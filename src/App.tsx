import { useEffect, useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Editor } from "@/components/Editor/Editor";
import { StatusBar } from "@/components/StatusBar";
import { TemplateModal } from "@/components/TemplateModal";
import { SettingsModal } from "@/components/SettingsModal";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { I18nProvider } from "@/i18n/I18nProvider";
import { useTranslation } from "@/i18n/I18nProvider";
import { usePrompts } from "@/hooks/usePrompts";
import { useSearch } from "@/hooks/useSearch";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useSettings } from "@/hooks/useSettings";
import { extractVariables } from "@/lib/template";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Language } from "@/i18n";

interface AppContentProps {
  onLanguageOverride: (language: Language) => void;
}

function AppContent({ onLanguageOverride }: AppContentProps) {
  const {
    settings,
    loading: settingsLoading,
    updateSettings,
    completeOnboarding,
  } = useSettings();
  const { t } = useTranslation();

  // Sync language to parent I18nProvider when settings load or language changes
  useEffect(() => {
    if (settings?.language) {
      onLanguageOverride(settings.language);
    }
  }, [settings?.language, onLanguageOverride]);

  const {
    prompts,
    topics,
    selectedPrompt,
    selectedId,
    loading,
    setSelectedId,
    loadPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
  } = usePrompts(settings?.promptDir ?? "");

  const { query, setQuery, filtered } = useSearch(prompts);
  const [editingPrompt, setEditingPrompt] = useState(selectedPrompt);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newPromptOpen, setNewPromptOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("General");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditingPrompt(selectedPrompt);
  }, [selectedPrompt]);

  useAutoSave(editingPrompt, updatePrompt);

  const handleNewPrompt = useCallback(() => {
    setNewTitle("");
    setNewTopic("General");
    setNewPromptOpen(true);
  }, []);

  const handleCreateConfirm = useCallback(async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      await createPrompt(title, newTopic.trim() || "General");
      setNewPromptOpen(false);
    } catch (err) {
      console.error("Failed to create prompt:", err);
    }
  }, [newTitle, newTopic, createPrompt]);

  const handleCopy = useCallback(async () => {
    if (editingPrompt) {
      await writeText(editingPrompt.body);
    }
  }, [editingPrompt]);

  const handleTemplate = useCallback(() => {
    if (editingPrompt && extractVariables(editingPrompt.body).length > 0) {
      setTemplateOpen(true);
    }
  }, [editingPrompt]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        handleNewPrompt();
      }
      if (e.metaKey && e.key === "t") {
        e.preventDefault();
        handleTemplate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewPrompt, handleTemplate]);

  const handleSettingsUpdate = useCallback(
    async (partial: Partial<import("@/types/settings").AppSettings>) => {
      await updateSettings(partial);
      if (partial.promptDir) {
        await loadPrompts();
      }
    },
    [updateSettings, loadPrompts],
  );

  const handleLanguageChange = useCallback(
    (language: Language) => {
      onLanguageOverride(language);
      updateSettings({ language });
    },
    [updateSettings, onLanguageOverride],
  );

  const handleRerunSetup = useCallback(() => {
    setSettingsOpen(false);
    updateSettings({ onboardingComplete: false });
  }, [updateSettings]);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        {t("app.loading")}
      </div>
    );
  }

  if (settings && !settings.onboardingComplete) {
    return (
      <OnboardingWizard
        defaultSettings={settings}
        onComplete={completeOnboarding}
        onLanguageChange={handleLanguageChange}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        {t("app.loading_prompts")}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h1 className="text-sm font-semibold">{t("app.title")}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          prompts={filtered}
          selectedId={selectedId}
          query={query}
          onQueryChange={setQuery}
          onSelect={setSelectedId}
          onDelete={deletePrompt}
          onNewPrompt={handleNewPrompt}
        />
        <Editor
          prompt={editingPrompt}
          topics={topics.map((tp) => tp.name)}
          onUpdate={setEditingPrompt}
        />
      </div>

      {/* Status bar */}
      <StatusBar
        onNew={handleNewPrompt}
        onCopy={handleCopy}
        onTemplate={handleTemplate}
        hasSelection={!!editingPrompt}
      />

      {/* Modals */}
      {editingPrompt && (
        <TemplateModal
          open={templateOpen}
          onOpenChange={setTemplateOpen}
          body={editingPrompt.body}
        />
      )}
      {settings && (
        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onRerunSetup={handleRerunSetup}
        />
      )}

      {/* New Prompt Dialog */}
      <Dialog open={newPromptOpen} onOpenChange={setNewPromptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("new_prompt.title")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateConfirm();
            }}
          >
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="prompt-title" className="text-sm font-medium">
                  {t("new_prompt.label_title")}
                </label>
                <Input
                  id="prompt-title"
                  ref={titleInputRef}
                  placeholder={t("new_prompt.placeholder_title")}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="prompt-topic" className="text-sm font-medium">
                  {t("new_prompt.label_topic")}
                </label>
                <Input
                  id="prompt-topic"
                  placeholder={t("new_prompt.placeholder_topic")}
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewPromptOpen(false)}
              >
                {t("new_prompt.cancel")}
              </Button>
              <Button type="submit" disabled={!newTitle.trim()}>
                {t("new_prompt.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <I18nProvider language={language}>
      <AppContent onLanguageOverride={setLanguage} />
    </I18nProvider>
  );
}

export default App;
