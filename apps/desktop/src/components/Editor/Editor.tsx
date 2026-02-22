import type { RefObject } from "react";
import { useCallback, useRef } from "react";
import {
  BlockEditor,
  type BlockEditorHandle,
} from "@/components/Editor/BlockEditor";
import type { Prompt } from "@/types/prompt";
import { MarkdownToolbar } from "./MarkdownToolbar";

interface EditorProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
  bodyRef?: RefObject<HTMLTextAreaElement | null>;
}

export function Editor({ prompt, onUpdate, bodyRef }: EditorProps) {
  const fallbackRef = useRef<HTMLTextAreaElement | null>(null);
  // Use bodyRef (from usePromptActions) as the activeBlockRef so that
  // external focus management (title Enter → body focus) works seamlessly.
  const activeBlockRef = bodyRef ?? fallbackRef;
  const blockEditorHandleRef = useRef<BlockEditorHandle | null>(null);

  const handleActiveBlockTextChange = useCallback((newText: string) => {
    blockEditorHandleRef.current?.updateActiveBlock(newText);
  }, []);

  return (
    <>
      <MarkdownToolbar
        textareaRef={activeBlockRef}
        onTextChange={handleActiveBlockTextChange}
      />
      <BlockEditor
        prompt={prompt}
        onUpdate={onUpdate}
        activeBlockRef={activeBlockRef}
        handleRef={blockEditorHandleRef}
      />
    </>
  );
}
