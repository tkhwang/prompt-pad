import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Check, ChevronUp, Copy, ExternalLink } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/Editor/MarkdownPreview";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/i18n/I18nProvider";
import type { LlmService } from "@/lib/llm-services";

interface BlockCardProps {
  content: string;
  enabledServices: LlmService[];
  onSendTo: (service: LlmService, content: string) => void;
}

export function BlockCard({
  content,
  enabledServices,
  onSendTo,
}: BlockCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isEmpty = !content.trim();

  const handleCopy = useCallback(async () => {
    await writeText(content.trim());
    toast.success(t("editor.copied"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [content, t]);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <MarkdownPreview content={content} />
      </div>
      <div className="flex justify-end px-3 pb-2">
        <div className="flex items-center">
          <Button
            variant={copied ? "default" : "secondary"}
            size="sm"
            className={`h-7 gap-1.5 text-xs font-medium transition-all ${
              copied
                ? "bg-green-500 hover:bg-green-500 text-white"
                : "hover:bg-primary hover:text-primary-foreground"
            } ${enabledServices.length > 0 ? "rounded-r-none" : ""}`}
            disabled={isEmpty}
            onClick={handleCopy}
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
          {enabledServices.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 rounded-l-none border-l border-border/60 px-1.5 hover:bg-primary hover:text-primary-foreground"
                  disabled={isEmpty}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {enabledServices.map((service) => (
                  <DropdownMenuItem
                    key={service.id}
                    onClick={() => onSendTo(service, content.trim())}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("editor.sendTo", { service: service.label })}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
