import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Settings } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Editor } from "@/components/Editor/Editor";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SettingsModal } from "@/components/SettingsModal";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { StatusBar } from "@/components/StatusBar";
import { TemplateModal } from "@/components/TemplateModal";
import { Button } from "@/components/ui/button";
import { PROMPT_FILE_TITLE_AUTO_SAVE_DELAY_MS } from "@/consts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePrompts } from "@/hooks/usePrompts";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettings";
import type { Language } from "@/i18n";
import { I18nProvider, useTranslation } from "@/i18n/I18nProvider";
import { extractVariables } from "@/lib/template";
import { generateTitle } from "@/lib/title-generator";

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
  const { t, language } = useTranslation();

  // Sync language to parent I18nProvider when settings load or language changes
  useEffect(() => {
    if (settings?.language) {
      onLanguageOverride(settings.language);
    }
  }, [settings?.language, onLanguageOverride]);

  const {
    prompts,
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
  const [viewMode, setViewMode] = useState<"simple" | "detail">("detail");

  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);
  const shouldFocusBodyRef = useRef(false);

  useEffect(() => {
    setEditingPrompt((prev) => {
      if (!selectedPrompt) return null;
      // Same prompt (rename or auto-save echo) — only patch id/filePath
      if (prev && prev.created === selectedPrompt.created) {
        if (prev.id === selectedPrompt.id) return prev;
        return {
          ...prev,
          id: selectedPrompt.id,
          filePath: selectedPrompt.filePath,
        };
      }
      // Different prompt selected
      return selectedPrompt;
    });
  }, [selectedPrompt]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally triggers on editingPrompt change to focus body after rename cascade
  useEffect(() => {
    if (shouldFocusBodyRef.current) {
      shouldFocusBodyRef.current = false;
      bodyInputRef.current?.focus();
    }
  }, [editingPrompt]);

  useAutoSave(
    editingPrompt,
    updatePrompt,
    PROMPT_FILE_TITLE_AUTO_SAVE_DELAY_MS,
  );

  const handleNewPrompt = useCallback(async () => {
    try {
      const title = generateTitle(language);
      const newPrompt = await createPrompt(title, "General");
      flushSync(() => {
        setEditingPrompt(newPrompt);
      });
      requestAnimationFrame(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
          titleInputRef.current.select();
        } else {
          // Fallback: Input may not be mounted yet (empty state → editor transition)
          requestAnimationFrame(() => {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
          });
        }
      });
    } catch (err) {
      console.error("Failed to create prompt:", err);
    }
  }, [createPrompt, language]);

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
          viewMode={viewMode}
          onViewModeToggle={() =>
            setViewMode((v) => (v === "simple" ? "detail" : "simple"))
          }
        />
        <Editor
          prompt={editingPrompt}
          onUpdate={setEditingPrompt}
          titleRef={titleInputRef}
          bodyRef={bodyInputRef}
          onTitleEnter={() => {
            if (editingPrompt) {
              shouldFocusBodyRef.current = true;
              updatePrompt(editingPrompt);
              // Fallback: double rAF for when filename doesn't change (editingPrompt unchanged)
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  if (shouldFocusBodyRef.current) {
                    shouldFocusBodyRef.current = false;
                    bodyInputRef.current?.focus();
                  }
                });
              });
            }
          }}
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
