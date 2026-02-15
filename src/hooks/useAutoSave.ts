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

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const flush = useCallback(async () => {
    const latestPrompt = latestPromptRef.current;
    const latestSerialized = latestSerializedRef.current;
    if (!latestPrompt || latestSerialized === lastSavedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await onSaveRef.current(latestPrompt);
    lastSavedRef.current = latestSerialized;
  }, []);

  useEffect(() => {
    latestPromptRef.current = prompt;
    if (!prompt) {
      latestSerializedRef.current = "";
      return;
    }

    const serialized = JSON.stringify({
      title: prompt.title,
      body: prompt.body,
      tags: prompt.tags,
      templateValues: prompt.templateValues,
    });
    latestSerializedRef.current = serialized;

    if (serialized === lastSavedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(async () => {
      await onSaveRef.current(prompt);
      lastSavedRef.current = serialized;
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [prompt, delay]);

  return flush;
}
