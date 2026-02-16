import type { RefObject } from "react";
import { useCallback } from "react";
import type { Prompt } from "@/types/prompt";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { PromptEditor } from "./PromptEditor";

interface EditorProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
  bodyRef?: RefObject<HTMLTextAreaElement | null>;
}

export function Editor({ prompt, onUpdate, bodyRef }: EditorProps) {
  const handleBodyChange = useCallback(
    (newBody: string) => {
      onUpdate({ ...prompt, body: newBody });
    },
    [prompt, onUpdate],
  );

  return (
    <>
      {bodyRef && (
        <MarkdownToolbar
          textareaRef={bodyRef}
          onTextChange={handleBodyChange}
        />
      )}
      <PromptEditor prompt={prompt} onUpdate={onUpdate} bodyRef={bodyRef} />
    </>
  );
}
