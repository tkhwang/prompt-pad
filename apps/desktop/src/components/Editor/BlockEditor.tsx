import { Minus, Plus } from "lucide-react";
import {
  type RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BlockEditArea } from "@/components/Editor/BlockEditArea";
import { joinBlocks, splitBlocks } from "@/lib/blocks";
import type { Prompt } from "@/types/prompt";

export interface BlockEditorHandle {
  updateActiveBlock: (newText: string) => void;
}

interface BlockEditorProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
  activeBlockRef: RefObject<HTMLTextAreaElement | null>;
  handleRef: RefObject<BlockEditorHandle | null>;
  repoFiles?: string[];
}

export function BlockEditor({
  prompt,
  onUpdate,
  activeBlockRef,
  handleRef,
  repoFiles,
}: BlockEditorProps) {
  const blocks = splitBlocks(prompt.body);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const blockElsRef = useRef<Map<number, HTMLTextAreaElement | null>>(
    new Map(),
  );

  // Expose updateActiveBlock to parent
  useImperativeHandle(
    handleRef,
    () => ({
      updateActiveBlock: (newText: string) => {
        const updated = [...blocks];
        updated[activeBlockIndex] = newText;
        onUpdate({ ...prompt, body: joinBlocks(updated) });
      },
    }),
    [blocks, activeBlockIndex, prompt, onUpdate],
  );

  const setBlockEl = useCallback(
    (index: number) => (el: HTMLTextAreaElement | null) => {
      blockElsRef.current.set(index, el);
      if (index === activeBlockIndex) {
        (activeBlockRef as { current: HTMLTextAreaElement | null }).current =
          el;
      }
    },
    [activeBlockIndex, activeBlockRef],
  );

  const handleBlockFocus = useCallback(
    (index: number) => {
      setActiveBlockIndex(index);
      const el = blockElsRef.current.get(index) ?? null;
      (activeBlockRef as { current: HTMLTextAreaElement | null }).current = el;
    },
    [activeBlockRef],
  );

  const handleBlockChange = useCallback(
    (index: number, value: string) => {
      const updated = [...blocks];
      updated[index] = value;
      onUpdate({ ...prompt, body: joinBlocks(updated) });
    },
    [blocks, prompt, onUpdate],
  );

  const handleBlockDelete = useCallback(
    (index: number) => {
      if (blocks.length <= 1) return;
      const updated = blocks.filter((_, i) => i !== index);
      const nextFocus = index > 0 ? index - 1 : 0;
      setActiveBlockIndex(nextFocus);
      onUpdate({ ...prompt, body: joinBlocks(updated) });
      requestAnimationFrame(() => {
        blockElsRef.current.get(nextFocus)?.focus();
      });
    },
    [blocks, prompt, onUpdate],
  );

  const handleBlockSplit = useCallback(
    (index: number, before: string, after: string) => {
      const updated = [...blocks];
      updated.splice(index, 1, before, after);
      const newIndex = index + 1;
      onUpdate({ ...prompt, body: joinBlocks(updated) });
      setActiveBlockIndex(newIndex);
      requestAnimationFrame(() => {
        const el = blockElsRef.current.get(newIndex);
        if (el) {
          el.focus();
          el.setSelectionRange(0, 0);
        }
      });
    },
    [blocks, prompt, onUpdate],
  );

  const handleAddBlock = useCallback(() => {
    const updated = [...blocks, ""];
    const newIndex = updated.length - 1;
    onUpdate({ ...prompt, body: joinBlocks(updated) });
    setActiveBlockIndex(newIndex);
    requestAnimationFrame(() => {
      blockElsRef.current.get(newIndex)?.focus();
    });
  }, [blocks, prompt, onUpdate]);

  return (
    <div className="flex flex-1 flex-col overflow-auto px-1">
      {blocks.map((block, index) => (
        <div key={`block-${prompt.id}-${index}`}>
          {index > 0 && (
            <div className="flex items-center gap-2 px-4 py-1">
              <div className="flex-1 border-t border-border/40" />
              <Minus className="h-3 w-3 text-muted-foreground/40" />
              <div className="flex-1 border-t border-border/40" />
            </div>
          )}
          <BlockEditArea
            ref={setBlockEl(index)}
            value={block}
            onChange={(value) => handleBlockChange(index, value)}
            onFocus={() => handleBlockFocus(index)}
            onDelete={
              blocks.length > 1 ? () => handleBlockDelete(index) : undefined
            }
            onSplit={(before, after) => handleBlockSplit(index, before, after)}
            isActive={index === activeBlockIndex}
            repoFiles={repoFiles}
          />
        </div>
      ))}
      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={handleAddBlock}
          className="flex items-center gap-1 px-3 py-1 rounded-md text-xs text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
