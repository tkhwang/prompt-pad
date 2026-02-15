import { Input } from "@/components/ui/input";
import type { Ref } from "react";
import type { Prompt } from "@/types/prompt";
import { useTranslation } from "@/i18n/I18nProvider";

interface MetaBarProps {
  prompt: Prompt;
  onUpdate: (updated: Prompt) => void;
  titleRef?: Ref<HTMLInputElement>;
}

export function MetaBar({ prompt, onUpdate, titleRef }: MetaBarProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-b">
      <Input
        ref={titleRef}
        value={prompt.title}
        onChange={(e) => onUpdate({ ...prompt, title: e.target.value })}
        className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
        placeholder={t("editor.placeholder_title")}
      />
    </div>
  );
}
