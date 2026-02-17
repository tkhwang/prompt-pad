import { FolderOpen } from "lucide-react";
import type { Prompt } from "@/types/prompt";
import { PromptItem } from "./PromptItem";

interface TopicGroupProps {
  name: string;
  prompts: Prompt[];
  selectedId: string | null;
  viewMode: "compact" | "cozy" | "detailed";
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectTopic: (topic: string) => void;
}

export function TopicGroup({
  name,
  prompts,
  selectedId,
  viewMode,
  onSelect,
  onDelete,
  onSelectTopic,
}: TopicGroupProps) {
  return (
    <div className="mt-2 first:mt-0">
      <button
        type="button"
        onClick={() => onSelectTopic(name)}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        <span>{name}</span>
        <span className="ml-auto text-[10px] normal-case tracking-normal">
          {prompts.length}
        </span>
      </button>
      {prompts.map((prompt) => (
        <PromptItem
          key={prompt.id}
          prompt={prompt}
          isSelected={prompt.id === selectedId}
          viewMode={viewMode}
          onClick={() => onSelect(prompt.id)}
          onDelete={() => onDelete(prompt.id)}
        />
      ))}
    </div>
  );
}
