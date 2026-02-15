import { useTranslation } from "@/i18n/I18nProvider";

interface StatusBarProps {
  onNewPrompt: () => void;
  onNewTopic: () => void;
  onCopy: () => void;
  hasSelection: boolean;
}

export function StatusBar({
  onNewPrompt,
  onNewTopic,
  onCopy,
  hasSelection,
}: StatusBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onNewPrompt}
          className="hover:text-foreground transition-colors"
        >
          {t("status.new_prompt")}{" "}
          <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">
            ⌘N
          </kbd>
        </button>
        <button
          type="button"
          onClick={onNewTopic}
          className="hover:text-foreground transition-colors"
        >
          {t("status.new_topic")}{" "}
          <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">
            ⌘⇧N
          </kbd>
        </button>
      </div>
      <div className="flex items-center gap-4">
        {hasSelection && (
          <button
            type="button"
            onClick={onCopy}
            className="hover:text-foreground transition-colors"
          >
            {t("status.copy")}{" "}
            <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">
              ⌘C
            </kbd>
          </button>
        )}
      </div>
    </div>
  );
}
