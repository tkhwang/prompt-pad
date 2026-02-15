import type { Ref } from "react";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Prompt } from "@/types/prompt";

interface PromptEditorProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
  bodyRef?: Ref<HTMLTextAreaElement>;
}

export function PromptEditor({ prompt, onUpdate, bodyRef }: PromptEditorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 p-4">
      <textarea
        ref={bodyRef}
        value={prompt.body}
        onChange={(e) => onUpdate({ ...prompt, body: e.target.value })}
        className="w-full h-full resize-none bg-transparent outline-none leading-relaxed"
        style={{
          fontFamily: "var(--editor-font)",
          fontSize: "var(--editor-font-size)",
        }}
        placeholder={t("editor.placeholder_body")}
      />
    </div>
  );
}
