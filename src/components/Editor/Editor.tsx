import type { Prompt } from "@/types/prompt";
import { MetaBar } from "./MetaBar";
import { PromptEditor } from "./PromptEditor";
import { useTranslation } from "@/i18n/I18nProvider";

interface EditorProps {
  prompt: Prompt | null;
  topics: string[];
  onUpdate: (updated: Prompt) => void;
}

export function Editor({ prompt, topics, onUpdate }: EditorProps) {
  const { t } = useTranslation();

  if (!prompt) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        {t("editor.empty")}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <MetaBar prompt={prompt} topics={topics} onUpdate={onUpdate} />
      <PromptEditor prompt={prompt} onUpdate={onUpdate} />
    </div>
  );
}
