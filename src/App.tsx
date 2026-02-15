import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Check, Copy, Eye, Pencil } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Editor } from "@/components/Editor/Editor";
import { MetaBar } from "@/components/Editor/MetaBar";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SettingsModal } from "@/components/SettingsModal";
import { SearchBar } from "@/components/Sidebar/SearchBar";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarToolbar } from "@/components/Sidebar/SidebarToolbar";
import { StatusBar } from "@/components/StatusBar";
import { TemplateModal } from "@/components/TemplateModal";
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
import { PROMPT_FILE_TITLE_AUTO_SAVE_DELAY_MS } from "@/consts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { usePrompts } from "@/hooks/usePrompts";
import { useSearch } from "@/hooks/useSearch";
import { useSettings } from "@/hooks/useSettings";
import type { Language } from "@/i18n";
import { I18nProvider, useTranslation } from "@/i18n/I18nProvider";
import { extractVariables } from "@/lib/template";
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
  const [templateOpen, setTemplateOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"simple" | "detail">("detail");
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

  const handleCreateTopic = useCallback(
    (name: string) => {
      createTopic(name);
    },
    [createTopic],
  );

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

  useAutoSave(
    editingPrompt,
    updatePrompt,
    PROMPT_FILE_TITLE_AUTO_SAVE_DELAY_MS,
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
    if (selectedTopic === null) {
      if (topics.length === 0) {
        handleCreatePromptInTopic("General");
      } else {
        setSelectTopicDialogOpen(true);
      }
      return;
    }
    handleCreatePromptInTopic(selectedTopic);
  }, [selectedTopic, topics.length, handleCreatePromptInTopic]);

  const handleSelectTopicAndCreate = useCallback(
    (topicName: string) => {
      setSelectTopicDialogOpen(false);
      handleCreatePromptInTopic(topicName);
    },
    [handleCreatePromptInTopic],
  );

  const handleCopy = useCallback(async () => {
    if (editingPrompt) {
      await writeText(editingPrompt.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      if (e.metaKey && e.shiftKey && e.key === "n") {
        e.preventDefault();
        handleNewTopicShortcut();
      } else if (e.metaKey && e.key === "n") {
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
  }, [handleNewPrompt, handleNewTopicShortcut, handleTemplate]);

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
            onCreateTopic={handleCreateTopic}
            onRenameTopic={handleRenameTopic}
            onDeleteTopic={handleDeleteTopic}
          />
        </div>

        {/* Cols 2+3 wrapper */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Row 1: Search spanning full width */}
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSettingsOpen={() => setSettingsOpen(true)}
          />

          {/* Row 2+: Split into sidebar-list and editor */}
          <div className="flex flex-1 overflow-hidden">
            {/* Col 2: Toolbar + Sidebar list */}
            <div className="flex flex-col shrink-0 w-72 border-r">
              <SidebarToolbar
                viewMode={viewMode}
                onViewModeToggle={() =>
                  setViewMode((v) => (v === "simple" ? "detail" : "simple"))
                }
                onNewPrompt={handleNewPrompt}
              />
              <Sidebar
                prompts={filtered}
                topics={topics}
                selectedId={selectedId}
                onSelect={(id) => {
                  setSelectedId(id);
                  setEditorMode("view");
                }}
                onDelete={deletePrompt}
                viewMode={viewMode}
                selectedTopic={selectedTopic}
                onSelectTopic={handleSidebarSelectTopic}
              />
            </div>

            {/* Col 3: Mode toggle + Editor/View + Copy */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {editingPrompt ? (
                <>
                  {/* Mode toggle bar */}
                  <div className="flex items-center justify-end px-4 py-2 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditorMode((m) => (m === "view" ? "edit" : "view"))
                      }
                    >
                      {editorMode === "view" ? (
                        <Pencil className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {editorMode === "view"
                        ? t("editor.edit")
                        : t("editor.view")}
                    </Button>
                  </div>

                  {editorMode === "edit" ? (
                    <>
                      <MetaBar
                        prompt={editingPrompt}
                        onUpdate={setEditingPrompt}
                        titleRef={titleInputRef}
                        onEnter={() => {
                          shouldFocusBodyRef.current = true;
                          updatePrompt(editingPrompt);
                          requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                              if (shouldFocusBodyRef.current) {
                                shouldFocusBodyRef.current = false;
                                bodyInputRef.current?.focus();
                              }
                            });
                          });
                        }}
                      />
                      <Editor
                        prompt={editingPrompt}
                        onUpdate={setEditingPrompt}
                        bodyRef={bodyInputRef}
                      />
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b">
                        <h2 className="text-lg font-semibold">
                          {editingPrompt.title}
                        </h2>
                      </div>
                      <ScrollArea className="flex-1 p-4">
                        <pre
                          className="whitespace-pre-wrap text-sm leading-relaxed"
                          style={{ fontFamily: "var(--editor-font)" }}
                        >
                          {editingPrompt.body}
                        </pre>
                      </ScrollArea>
                    </>
                  )}

                  {/* Bottom Copy button */}
                  <div className="px-4 py-3 border-t">
                    <Button className="w-full" onClick={handleCopy}>
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? t("editor.copied") : t("editor.copy")}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  {t("editor.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar
        onNewPrompt={handleNewPrompt}
        onNewTopic={handleNewTopicShortcut}
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
