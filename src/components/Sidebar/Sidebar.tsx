import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Prompt } from "@/types/prompt";
import { SearchBar } from "./SearchBar";
import { TopicGroup } from "./TopicGroup";

interface SidebarProps {
  prompts: Prompt[];
  selectedId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewPrompt: () => void;
}

export function Sidebar({
  prompts,
  selectedId,
  query,
  onQueryChange,
  onSelect,
  onDelete,
  onNewPrompt,
}: SidebarProps) {
  const { t } = useTranslation();

  const grouped = useMemo(() => {
    const map = new Map<string, Prompt[]>();
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
  }, [prompts]);

  return (
    <div className="flex flex-col h-full border-r w-72">
      <SearchBar
        query={query}
        onQueryChange={onQueryChange}
        onNewPrompt={onNewPrompt}
      />
      <ScrollArea className="flex-1">
        {grouped.map(([topic, topicPrompts]) => (
          <TopicGroup
            key={topic}
            name={topic}
            prompts={topicPrompts}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
        {grouped.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground text-center">
            {t("sidebar.empty")}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
