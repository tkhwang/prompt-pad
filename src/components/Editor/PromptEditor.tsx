import type { Prompt } from "@/types/prompt";
import { useTranslation } from "@/i18n/I18nProvider";

interface PromptEditorProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
}

export function PromptEditor({ prompt, onUpdate }: PromptEditorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex-1 p-4">
      <textarea
        value={prompt.body}
        onChange={(e) => onUpdate({ ...prompt, body: e.target.value })}
        className="w-full h-full resize-none bg-transparent outline-none text-sm leading-relaxed"
        style={{ fontFamily: "var(--editor-font)" }}
        placeholder={t("editor.placeholder_body")}
      />
    </div>
  );
}
