import { Check, ChevronUp, Copy, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/I18nProvider";
import { LLM_SERVICES } from "@/lib/llm-services";

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
  onSendTo: (url: string) => void;
  copied: boolean;
  hasPrompt: boolean;
  topicPanelOpen: boolean;
}

export function StatusBar({
  onNewPrompt,
  onNewTopic,
  onSettingsOpen,
  onCopy,
  onSendTo,
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
          <div className="flex items-center">
            <Button
              variant="default"
              size="sm"
              className="rounded-r-none min-w-20"
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-l-none border-l border-primary-foreground/20 px-1.5"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top">
                {LLM_SERVICES.map((service) => (
                  <DropdownMenuItem
                    key={service.id}
                    onClick={() => onSendTo(service.url)}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("editor.sendTo", { service: service.label })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
