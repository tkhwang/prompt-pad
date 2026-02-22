import { useCallback, useEffect, useRef } from "react";
import type { Prompt } from "@/types/prompt";

export function useAutoSave(
  prompt: Prompt | null,
  onSave: (prompt: Prompt) => Promise<void>,
  delay: number = 500,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const latestPromptRef = useRef<Prompt | null>(null);
  const latestSerializedRef = useRef<string>("");
  const onSaveRef = useRef(onSave);
  const prevCreatedRef = useRef<string | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const clearPendingSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(async () => {
    const latestPrompt = latestPromptRef.current;
    const latestSerialized = latestSerializedRef.current;
    if (!latestPrompt || latestSerialized === lastSavedRef.current) return;

    clearPendingSave();

    await onSaveRef.current(latestPrompt);
    lastSavedRef.current = latestSerialized;
  }, [clearPendingSave]);

  useEffect(() => {
    latestPromptRef.current = prompt;
    if (!prompt) {
      latestSerializedRef.current = "";
      prevCreatedRef.current = null;
      return;
    }

    const serialized = JSON.stringify({
      title: prompt.title,
      body: prompt.body,
      tags: prompt.tags,
      templateValues: prompt.templateValues,
      repoPath: prompt.repoPath,
    });
    latestSerializedRef.current = serialized;

    // On prompt switch, initialize lastSavedRef to skip unnecessary save
    if (prompt.created !== prevCreatedRef.current) {
      prevCreatedRef.current = prompt.created;
      lastSavedRef.current = serialized;
      return;
    }

    if (serialized === lastSavedRef.current) return;

    clearPendingSave();

    timeoutRef.current = setTimeout(async () => {
      const currentPrompt = latestPromptRef.current;
      const currentSerialized = latestSerializedRef.current;
      if (!currentPrompt || currentSerialized === lastSavedRef.current) return;

      await onSaveRef.current(currentPrompt);
      lastSavedRef.current = currentSerialized;
      timeoutRef.current = null;
    }, delay);

    return () => clearPendingSave();
  }, [prompt, delay, clearPendingSave]);

  return flush;
}
