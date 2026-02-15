import { useTranslation } from "@/i18n/I18nProvider";

interface StatusBarProps {
  onNew: () => void;
  onCopy: () => void;
  onTemplate: () => void;
  hasSelection: boolean;
}

export function StatusBar({
  onNew,
  onCopy,
  onTemplate,
  hasSelection,
}: StatusBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t text-xs text-muted-foreground">
      <button
        type="button"
        onClick={onNew}
        className="hover:text-foreground transition-colors"
      >
        {t("status.new")}{" "}
        <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">⌘N</kbd>
      </button>
      <div className="flex items-center gap-4">
        {hasSelection && (
          <>
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
            <button
              type="button"
              onClick={onTemplate}
              className="hover:text-foreground transition-colors"
            >
              {t("status.use_template")}{" "}
              <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">
                ⌘T
              </kbd>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
