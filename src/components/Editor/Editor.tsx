import type { Ref } from "react";
import type { Prompt } from "@/types/prompt";
import { MetaBar } from "./MetaBar";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { PromptEditor } from "./PromptEditor";
import { useTranslation } from "@/i18n/I18nProvider";

interface EditorProps {
  prompt: Prompt | null;
  onUpdate: (updated: Prompt) => void;
  titleRef?: Ref<HTMLInputElement>;
}

export function Editor({ prompt, onUpdate, titleRef }: EditorProps) {
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
      <MetaBar prompt={prompt} onUpdate={onUpdate} titleRef={titleRef} />
      <MarkdownToolbar />
      <PromptEditor prompt={prompt} onUpdate={onUpdate} />
    </div>
  );
}
