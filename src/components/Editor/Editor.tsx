import type { Ref } from "react";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Prompt } from "@/types/prompt";
import { MarkdownToolbar } from "./MarkdownToolbar";
import { MetaBar } from "./MetaBar";
import { PromptEditor } from "./PromptEditor";

interface EditorProps {
  prompt: Prompt | null;
  onUpdate: (updated: Prompt) => void;
  titleRef?: Ref<HTMLInputElement>;
  bodyRef?: Ref<HTMLTextAreaElement>;
  onTitleEnter?: () => void;
}

export function Editor({
  prompt,
  onUpdate,
  titleRef,
  bodyRef,
  onTitleEnter,
}: EditorProps) {
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
      <MetaBar
        prompt={prompt}
        onUpdate={onUpdate}
        titleRef={titleRef}
        onEnter={onTitleEnter}
      />
      <MarkdownToolbar />
      <PromptEditor prompt={prompt} onUpdate={onUpdate} bodyRef={bodyRef} />
    </div>
  );
}
