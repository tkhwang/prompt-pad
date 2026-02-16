import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Prompt, Topic } from "@/types/prompt";
import { PromptItem } from "./PromptItem";
import { TopicGroup } from "./TopicGroup";

interface SidebarProps {
  prompts: Prompt[];
  topics: Topic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode: "simple" | "detail";
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
}

export function Sidebar({
  prompts,
  topics,
  selectedId,
  onSelect,
  onDelete,
  viewMode,
  selectedTopic,
  onSelectTopic,
}: SidebarProps) {
  const { t } = useTranslation();

  const grouped = useMemo(() => {
    const map = new Map<string, Prompt[]>();
    // Initialize all known topics (including empty ones)
    for (const topic of topics) {
      map.set(topic.name, []);
    }
    for (const prompt of prompts) {
      const topic = prompt.topic || "General";
      if (!map.has(topic)) map.set(topic, []);
      map.get(topic)?.push(prompt);
    }
    // Sort prompts within each topic: newest first
    for (const list of map.values()) {
      list.sort((a, b) => b.created.localeCompare(a.created));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [prompts, topics]);

  const topicPrompts = useMemo(() => {
    if (selectedTopic === null) return [];
    return prompts
      .filter((p) => (p.topic || "General") === selectedTopic)
      .sort((a, b) => b.created.localeCompare(a.created));
  }, [prompts, selectedTopic]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {selectedTopic !== null && (
        <div className="animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => onSelectTopic(null)}
            className="flex items-center gap-1 w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground border-b border-foreground/10"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>{selectedTopic}</span>
          </button>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div
          key={selectedTopic ?? "all"}
          className="animate-in fade-in duration-200"
        >
          {selectedTopic === null
            ? grouped.map(([topic, groupPrompts]) => (
                <TopicGroup
                  key={topic}
                  name={topic}
                  prompts={groupPrompts}
                  selectedId={selectedId}
                  viewMode={viewMode}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onSelectTopic={onSelectTopic}
                />
              ))
            : topicPrompts.map((prompt) => (
                <PromptItem
                  key={prompt.id}
                  prompt={prompt}
                  isSelected={prompt.id === selectedId}
                  viewMode={viewMode}
                  onClick={() => onSelect(prompt.id)}
                  onDelete={() => onDelete(prompt.id)}
                />
              ))}
          {((selectedTopic === null && grouped.length === 0) ||
            (selectedTopic !== null && topicPrompts.length === 0)) && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {t("sidebar.empty")}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
