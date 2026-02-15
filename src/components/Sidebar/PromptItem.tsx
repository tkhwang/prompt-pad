import { cn } from "@/lib/utils";
import type { Prompt } from "@/types/prompt";

interface PromptItemProps {
  prompt: Prompt;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function PromptItem({
  prompt,
  isSelected,
  onClick,
  onDelete,
}: PromptItemProps) {
  const preview = prompt.body.slice(0, 80).replace(/\n/g, " ");

  return (
    <button
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (confirm(`Delete "${prompt.title}"?`)) {
          onDelete();
        }
      }}
      className={cn(
        "w-full text-left px-4 py-2.5 border-b transition-colors",
        "hover:bg-accent",
        isSelected && "bg-accent"
      )}
    >
      <div className="font-medium text-sm truncate">{prompt.title}</div>
      {preview && (
        <div className="text-xs text-muted-foreground truncate mt-0.5">
          {preview}
        </div>
      )}
    </button>
  );
}
