import { Check, Copy, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/I18nProvider";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded bg-muted/80 border border-border/60 text-[10px] font-medium shadow-[0_1px_0_0] shadow-border/40">
      {children}
    </kbd>
  );
}

interface StatusBarProps {
  onNewPrompt: () => void;
  onNewTopic: () => void;
  onSettingsOpen: () => void;
  onCopy: () => void;
  copied: boolean;
  hasPrompt: boolean;
  topicPanelOpen: boolean;
}

export function StatusBar({
  onNewPrompt,
  onNewTopic,
  onSettingsOpen,
  onCopy,
  copied,
  hasPrompt,
  topicPanelOpen,
}: StatusBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {topicPanelOpen && (
          <button
            type="button"
            onClick={onNewTopic}
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            {t("status.new_topic")}
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>N</Kbd>
          </button>
        )}
        <button
          type="button"
          onClick={onNewPrompt}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          {t("status.new_prompt")}
          <Kbd>⌘</Kbd>
          <Kbd>N</Kbd>
        </button>
      </div>
      <div className="flex items-center gap-4">
        {hasPrompt && (
          <Button
            variant="default"
            size="sm"
            className="min-w-24"
            onClick={onCopy}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {t("editor.copied")}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {t("editor.copy")}
              </>
            )}
          </Button>
        )}
        <button
          type="button"
          onClick={onSettingsOpen}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          {t("status.settings")}
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
