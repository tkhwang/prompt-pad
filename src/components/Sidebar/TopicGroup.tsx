import { FolderOpen } from "lucide-react";
import type { Prompt } from "@/types/prompt";
import { PromptItem } from "./PromptItem";

interface TopicGroupProps {
  name: string;
  prompts: Prompt[];
  selectedId: string | null;
  viewMode: "simple" | "detail";
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
    <div className="border-b border-foreground/10">
      <button
        type="button"
        onClick={() => onSelectTopic(name)}
        className="flex items-center gap-1 w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground border-b border-foreground/10"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        <span>{name}</span>
        <span className="ml-auto text-xs">{prompts.length}</span>
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
