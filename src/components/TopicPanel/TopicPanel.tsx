import { FolderOpen, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { Topic } from "@/types/prompt";

interface TopicPanelProps {
  topics: Topic[];
  totalPromptCount: number;
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
}

export function TopicPanel({
  topics,
  totalPromptCount,
  selectedTopic,
  onSelectTopic,
}: TopicPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full border-r w-48">
      <button
        type="button"
        onClick={() => onSelectTopic(null)}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 text-sm transition-colors",
          "hover:bg-accent",
          selectedTopic === null && "bg-accent font-medium",
        )}
      >
        <Layers className="h-4 w-4 shrink-0" />
        <span className="truncate">{t("topic_panel.all_prompts")}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {totalPromptCount}
        </span>
      </button>
      <ScrollArea className="flex-1">
        {topics.map((topic) => (
          <button
            key={topic.name}
            type="button"
            onClick={() => onSelectTopic(topic.name)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2.5 text-sm transition-colors",
              "hover:bg-accent",
              selectedTopic === topic.name && "bg-accent font-medium",
            )}
          >
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span className="truncate">{topic.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {topic.promptCount}
            </span>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
