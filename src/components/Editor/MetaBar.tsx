import type { Ref } from "react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/I18nProvider";
import type { Prompt } from "@/types/prompt";

interface MetaBarProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
  titleRef?: Ref<HTMLInputElement>;
  onEnter?: () => void;
}

export function MetaBar({ prompt, onUpdate, titleRef, onEnter }: MetaBarProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-b">
      <Input
        ref={titleRef}
        value={prompt.title}
        onChange={(e) => onUpdate({ ...prompt, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onEnter?.();
          }
        }}
        className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
        placeholder={t("editor.placeholder_title")}
      />
    </div>
  );
}
