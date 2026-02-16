import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { open } from "@tauri-apps/plugin-shell";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { EditorPanel } from "@/components/Editor/EditorPanel";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SettingsModal } from "@/components/SettingsModal";
import { SearchBar } from "@/components/Sidebar/SearchBar";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarToolbar } from "@/components/Sidebar/SidebarToolbar";
import { StatusBar } from "@/components/StatusBar";
import { TopicPanel } from "@/components/TopicPanel/TopicPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AUTO_SAVE_DELAY_MS } from "@/consts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePrompts } from "@/hooks/usePrompts";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettings";
import type { Language } from "@/i18n";
import { I18nProvider, useTranslation } from "@/i18n/I18nProvider";
import { extractVariables, substituteVariables } from "@/lib/template";
import { generateTitle } from "@/lib/title-generator";
import { cn } from "@/lib/utils";

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
    topics,
    selectedPrompt,
    selectedId,
    loading,
    setSelectedId,
    loadPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    createTopic,
    renameTopic,
    deleteTopic,
  } = usePrompts(settings?.promptDir ?? "");

  const { query, setQuery, filtered } = useSearch(prompts);

  const [editingPrompt, setEditingPrompt] = useState(selectedPrompt);
  const [editorMode, setEditorMode] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"compact" | "cozy" | "detailed">(
    "cozy",
  );
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicPanelOpen, setTopicPanelOpen] = useState(false);
  const [createTopicDialogOpen, setCreateTopicDialogOpen] = useState(false);
  const [selectTopicDialogOpen, setSelectTopicDialogOpen] = useState(false);
  const [topicNameInput, setTopicNameInput] = useState("");

  // Close animation 중 TopicPanel에 보여줄 토픽 (마지막 non-null 값 유지)
  const lastTopicRef = useRef<string | null>(null);
  if (selectedTopic !== null) {
    lastTopicRef.current = selectedTopic;
  }
  const panelDisplayTopic = topicPanelOpen
    ? selectedTopic
    : (selectedTopic ?? lastTopicRef.current);

  // TopicPanel 내부 클릭: 토픽 선택 + 패널 닫기
  const handlePanelSelectTopic = useCallback((topic: string | null) => {
    setSelectedTopic(topic);
    setTopicPanelOpen(false);
  }, []);

  // Sidebar에서 호출: TopicGroup 클릭(non-null)은 토픽 설정, 뒤로가기(null)는 패널만 열기
  const handleSidebarSelectTopic = useCallback((topic: string | null) => {
    if (topic !== null) {
      setSelectedTopic(topic);
    }
    setTopicPanelOpen(true);
  }, []);

  const handleNewTopicShortcut = useCallback(() => {
    setTopicNameInput("");
    setCreateTopicDialogOpen(true);
  }, []);

  const handleCreateTopicSubmit = useCallback(() => {
    const name = topicNameInput.trim();
    if (name) {
      createTopic(name);
      setTopicNameInput("");
      setCreateTopicDialogOpen(false);
    }
  }, [topicNameInput, createTopic]);

  const handleRenameTopic = useCallback(
    async (oldName: string, newName: string) => {
      await renameTopic(oldName, newName);
      if (selectedTopic === oldName) {
        setSelectedTopic(newName);
      }
    },
    [renameTopic, selectedTopic],
  );

  const handleDeleteTopic = useCallback(
    async (name: string) => {
      await deleteTopic(name);
      if (selectedTopic === name) {
        setSelectedTopic(null);
        setTopicPanelOpen(false);
      }
    },
    [deleteTopic, selectedTopic],
  );

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

  const flushAutoSave = useAutoSave(
    editingPrompt,
    updatePrompt,
    AUTO_SAVE_DELAY_MS,
  );

  const handleSelectPrompt = useCallback(
    async (id: string) => {
      try {
        await flushAutoSave();
      } catch (err) {
        console.error("Failed to flush auto-save before prompt switch:", err);
      }
      setSelectedId(id);
      setEditorMode("view");
    },
    [flushAutoSave, setSelectedId],
  );

  const handleCreatePromptInTopic = useCallback(
    async (topic: string) => {
      try {
        const title = generateTitle(language);
        const newPrompt = await createPrompt(title, topic);
        flushSync(() => {
          setEditingPrompt(newPrompt);
          setEditorMode("edit");
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
    },
    [createPrompt, language],
  );

  const handleNewPrompt = useCallback(() => {
    const inferredTopic = selectedTopic ?? editingPrompt?.topic ?? null;

    if (inferredTopic) {
      handleCreatePromptInTopic(inferredTopic);
      return;
    }

    if (topics.length === 0) {
      handleCreatePromptInTopic("General");
      return;
    }

    setSelectTopicDialogOpen(true);
  }, [
    selectedTopic,
    editingPrompt?.topic,
    topics.length,
    handleCreatePromptInTopic,
  ]);

  const handleSelectTopicAndCreate = useCallback(
    (topicName: string) => {
      setSelectTopicDialogOpen(false);
      setSelectedTopic(topicName);
      handleCreatePromptInTopic(topicName);
    },
    [handleCreatePromptInTopic],
  );

  const handleCopy = useCallback(async () => {
    if (editingPrompt) {
      const variables = extractVariables(editingPrompt.body);
      const text =
        variables.length > 0
          ? substituteVariables(
              editingPrompt.body,
              editingPrompt.templateValues ?? {},
            )
          : editingPrompt.body;
      await writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [editingPrompt]);

  const handleSendTo = useCallback(
    async (url: string) => {
      await handleCopy();
      await open(url);
    },
    [handleCopy],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key === "n") {
        e.preventDefault();
        handleNewTopicShortcut();
      } else if (e.metaKey && e.key === "n") {
        e.preventDefault();
        handleNewPrompt();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewPrompt, handleNewTopicShortcut]);

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

  const handleTitleEnter = useCallback(() => {
    if (!editingPrompt) return;
    shouldFocusBodyRef.current = true;
    updatePrompt(editingPrompt);
  }, [editingPrompt, updatePrompt]);

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
        onThemePreview={updateSettings}
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
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Col 1: TopicPanel */}
        <div
          className={cn(
            "shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out",
            topicPanelOpen ? "w-48" : "w-0",
          )}
        >
          <TopicPanel
            topics={topics}
            totalPromptCount={filtered.length}
            selectedTopic={panelDisplayTopic}
            onSelectTopic={handlePanelSelectTopic}
            onCreateTopic={createTopic}
            onRenameTopic={handleRenameTopic}
            onDeleteTopic={handleDeleteTopic}
          />
        </div>

        {/* Cols 2+3 wrapper */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Row 1: Search spanning full width */}
          <SearchBar query={query} onQueryChange={setQuery} />

          {/* Row 2+: Split into sidebar-list and editor */}
          <div className="flex flex-1 overflow-hidden">
            {/* Col 2: Toolbar + Sidebar list */}
            <div className="flex flex-col shrink-0 w-72 bg-sidebar">
              <SidebarToolbar
                viewMode={viewMode}
                onViewModeToggle={() =>
                  setViewMode((v) =>
                    v === "compact"
                      ? "cozy"
                      : v === "cozy"
                        ? "detailed"
                        : "compact",
                  )
                }
                onNewPrompt={handleNewPrompt}
              />
              <Sidebar
                prompts={filtered}
                topics={topics}
                selectedId={selectedId}
                onSelect={handleSelectPrompt}
                onDelete={deletePrompt}
                viewMode={viewMode}
                selectedTopic={selectedTopic}
                onSelectTopic={handleSidebarSelectTopic}
              />
            </div>

            {/* Col 3: Title + Mode toggle + Editor/View + Copy */}
            <EditorPanel
              prompt={editingPrompt}
              editorMode={editorMode}
              onEditorModeChange={setEditorMode}
              onUpdate={setEditingPrompt}
              titleRef={titleInputRef}
              bodyRef={bodyInputRef}
              onTitleEnter={handleTitleEnter}
            />
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar
        onNewPrompt={handleNewPrompt}
        onNewTopic={handleNewTopicShortcut}
        onSettingsOpen={() => setSettingsOpen(true)}
        onCopy={handleCopy}
        onSendTo={handleSendTo}
        copied={copied}
        hasPrompt={!!editingPrompt}
        topicPanelOpen={topicPanelOpen}
      />

      {/* Modals */}
      {settings && (
        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onRerunSetup={handleRerunSetup}
        />
      )}

      {/* Create Topic Dialog (from hotkey) */}
      <Dialog
        open={createTopicDialogOpen}
        onOpenChange={setCreateTopicDialogOpen}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("topic_panel.create")}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t("topic_panel.create_placeholder")}
            value={topicNameInput}
            onChange={(e) => setTopicNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateTopicSubmit();
            }}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("topic_panel.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={handleCreateTopicSubmit}
              disabled={!topicNameInput.trim()}
            >
              {t("topic_panel.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Topic Dialog (for ⌘N in All Prompts view) */}
      <Dialog
        open={selectTopicDialogOpen}
        onOpenChange={setSelectTopicDialogOpen}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("status.select_topic")}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-64">
            <div className="flex flex-col gap-1">
              {topics.map((topic) => (
                <Button
                  key={topic.name}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => handleSelectTopicAndCreate(topic.name)}
                >
                  {topic.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
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
