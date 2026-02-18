import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { open } from "@tauri-apps/plugin-shell";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { AUTO_SAVE_DELAY_MS } from "@/consts";
import { useAutoSave } from "@/hooks/useAutoSave";
import type { Language, TranslationKey } from "@/i18n";
import type { LlmService } from "@/lib/llm-services";
import { buildServiceUrl } from "@/lib/llm-services";
import { extractVariables, substituteVariables } from "@/lib/template";
import { generateTitle } from "@/lib/title-generator";
import type { Prompt, Topic } from "@/types/prompt";

interface UsePromptActionsDeps {
  selectedPrompt: Prompt | null;
  setSelectedId: (id: string) => void;
  createPrompt: (title: string, topic: string) => Promise<Prompt>;
  updatePrompt: (prompt: Prompt) => Promise<void>;
  language: Language;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
  selectedTopic: string | null;
  setSelectedTopic: (topic: string | null) => void;
  topics: Topic[];
}

export function usePromptActions({
  selectedPrompt,
  setSelectedId,
  createPrompt,
  updatePrompt,
  language,
  t,
  selectedTopic,
  setSelectedTopic,
  topics,
}: UsePromptActionsDeps) {
  const [editingPrompt, setEditingPrompt] = useState(selectedPrompt);
  const [editorMode, setEditorMode] = useState<"view" | "edit">("view");
  const [selectTopicDialogOpen, setSelectTopicDialogOpen] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);
  const shouldFocusBodyRef = useRef(false);

  useEffect(() => {
    setEditingPrompt((prev) => {
      if (!selectedPrompt) return null;
      if (prev && prev.created === selectedPrompt.created) {
        if (prev.id === selectedPrompt.id) return prev;
        return {
          ...prev,
          id: selectedPrompt.id,
          filePath: selectedPrompt.filePath,
        };
      }
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
    [handleCreatePromptInTopic, setSelectedTopic],
  );

  const resolvePromptBody = useCallback(
    (prompt: NonNullable<typeof editingPrompt>): string => {
      const variables = extractVariables(prompt.body);
      if (variables.length === 0) return prompt.body;
      return substituteVariables(prompt.body, prompt.templateValues ?? {});
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (editingPrompt) {
      const text = resolvePromptBody(editingPrompt);
      await writeText(text);
      toast.success(t("editor.copied"));
    }
  }, [editingPrompt, t, resolvePromptBody]);

  const handleSendTo = useCallback(
    async (service: LlmService) => {
      if (!editingPrompt) return;
      const text = resolvePromptBody(editingPrompt);
      await writeText(text);
      toast.success(t("editor.copied"));
      const url = buildServiceUrl(service, text);
      await open(url);
    },
    [editingPrompt, t, resolvePromptBody],
  );

  const handleBlockSendTo = useCallback(
    async (service: LlmService, content: string) => {
      await writeText(content);
      toast.success(t("editor.copied"));
      const url = buildServiceUrl(service, content);
      await open(url);
    },
    [t],
  );

  const handleTitleEnter = useCallback(() => {
    if (!editingPrompt) return;
    shouldFocusBodyRef.current = true;
    updatePrompt(editingPrompt);
  }, [editingPrompt, updatePrompt]);

  return {
    editingPrompt,
    setEditingPrompt,
    editorMode,
    setEditorMode,
    titleInputRef,
    bodyInputRef,
    selectTopicDialogOpen,
    setSelectTopicDialogOpen,
    handleSelectPrompt,
    handleNewPrompt,
    handleSelectTopicAndCreate,
    handleCopy,
    handleSendTo,
    handleBlockSendTo,
    handleTitleEnter,
  };
}
