import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types/prompt";
import { PromptItem } from "./PromptItem";

interface TopicGroupProps {
  name: string;
  prompts: Prompt[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TopicGroup({
  name,
  prompts,
  selectedId,
  onSelect,
  onDelete,
}: TopicGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1 w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            !collapsed && "rotate-90",
          )}
        />
        <span>{name}</span>
        <span className="ml-auto text-xs">{prompts.length}</span>
      </button>
      {!collapsed &&
        prompts.map((prompt) => (
          <PromptItem
            key={prompt.id}
            prompt={prompt}
            isSelected={prompt.id === selectedId}
            onClick={() => onSelect(prompt.id)}
            onDelete={() => onDelete(prompt.id)}
          />
        ))}
    </div>
  );
}
