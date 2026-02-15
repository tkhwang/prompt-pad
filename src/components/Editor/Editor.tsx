import type { Ref } from "react";
import type { Prompt } from "@/types/prompt";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { PromptEditor } from "./PromptEditor";

interface EditorProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
  bodyRef?: Ref<HTMLTextAreaElement>;
}

export function Editor({ prompt, onUpdate, bodyRef }: EditorProps) {
  return (
    <>
      <MarkdownToolbar />
      <PromptEditor prompt={prompt} onUpdate={onUpdate} bodyRef={bodyRef} />
    </>
  );
}
