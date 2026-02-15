import { useEffect, useRef } from "react";
import type { Prompt } from "@/types/prompt";

export function useAutoSave(
  prompt: Prompt | null,
  onSave: (prompt: Prompt) => Promise<void>,
  delay: number = 500,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    if (!prompt) return;

    const serialized = JSON.stringify({
      title: prompt.title,
      body: prompt.body,
      tags: prompt.tags,
      templateValues: prompt.templateValues,
    });

    if (serialized === lastSavedRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      await onSave(prompt);
      lastSavedRef.current = serialized;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [prompt, onSave, delay]);
}
