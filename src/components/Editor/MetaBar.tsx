import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import type { Prompt } from "@/types/prompt";
import { useTranslation } from "@/i18n/I18nProvider";

interface MetaBarProps {
  prompt: Prompt;
  topics: string[];
  onUpdate: (updated: Prompt) => void;
}

export function MetaBar({ prompt, topics, onUpdate }: MetaBarProps) {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = useState("");

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!prompt.tags.includes(newTag)) {
        onUpdate({ ...prompt, tags: [...prompt.tags, newTag] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    onUpdate({ ...prompt, tags: prompt.tags.filter((tg) => tg !== tag) });
  };

  return (
    <div className="space-y-3 p-4 border-b">
      <Input
        value={prompt.title}
        onChange={(e) => onUpdate({ ...prompt, title: e.target.value })}
        className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
        placeholder={t("editor.placeholder_title")}
      />
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t("editor.topic_label")}</span>
        <select
          value={prompt.topic}
          onChange={(e) => onUpdate({ ...prompt, topic: e.target.value })}
          className="bg-transparent border rounded px-2 py-1 text-sm"
        >
          {topics.map((tp) => (
            <option key={tp} value={tp}>
              {tp}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">{t("editor.tags_label")}</span>
        {prompt.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button onClick={() => removeTag(tag)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className="w-24 h-6 text-xs border-dashed"
          placeholder={t("editor.placeholder_tag")}
        />
      </div>
    </div>
  );
}
