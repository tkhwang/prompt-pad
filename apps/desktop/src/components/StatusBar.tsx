import { Settings } from "lucide-react";
import { useTranslation } from "@/i18n/I18nProvider";

interface StatusBarProps {
  onNewPrompt: () => void;
  onNewTopic: () => void;
  onSettingsOpen: () => void;
  topicPanelOpen: boolean;
}

export function StatusBar({
  onNewPrompt,
  onNewTopic,
  onSettingsOpen,
  topicPanelOpen,
}: StatusBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-3 py-3 border-t text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {topicPanelOpen && (
          <button
            type="button"
            onClick={onNewTopic}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {t("status.new_topic")}
            <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">
              ⌘
            </kbd>
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⇧</kbd>
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">N</kbd>
          </button>
        )}
        <button
          type="button"
          onClick={onNewPrompt}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          {t("status.new_prompt")}
          <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">
            ⌘
          </kbd>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">N</kbd>
        </button>
      </div>
      <button
        type="button"
        onClick={onSettingsOpen}
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <Settings className="h-3.5 w-3.5" />
        {t("status.settings")}
      </button>
    </div>
  );
}
