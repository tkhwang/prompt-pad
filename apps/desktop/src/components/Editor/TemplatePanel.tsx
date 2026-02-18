import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/i18n/I18nProvider";

interface TemplatePanelProps {
  variables: string[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  editorMode: "view" | "edit";
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function TemplatePanel({
  variables,
  values,
  onChange,
  editorMode,
  collapsed,
  onCollapsedChange,
}: TemplatePanelProps) {
  const { t } = useTranslation();

  if (collapsed) {
    return (
      <div className="shrink-0 border-l border-border/40 flex items-start pt-2">
        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          className="p-2 hover:bg-muted/50 transition-colors"
          title={t("template.title")}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 border-l border-border/40 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <span className="text-sm font-medium">
          {t("template.title")} ({variables.length})
        </span>
        <button
          type="button"
          onClick={() => onCollapsedChange(true)}
          className="p-1 hover:bg-muted/50 rounded transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-3">
          {variables.map((variable) => (
            <div key={variable} className="space-y-2">
              <label
                htmlFor={`tpl-${variable}`}
                className="text-xs font-medium text-muted-foreground font-mono"
              >
                {`{{${variable}}}`}
              </label>
              <textarea
                id={`tpl-${variable}`}
                value={values[variable] || ""}
                onChange={(e) =>
                  onChange({ ...values, [variable]: e.target.value })
                }
                placeholder={t("template.placeholder", { name: variable })}
                rows={3}
                readOnly={editorMode === "view"}
                className={`placeholder:text-muted-foreground border-input dark:bg-input/30 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] resize-none ${editorMode === "view" ? "opacity-60 cursor-default focus-visible:ring-0 focus-visible:border-input" : "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"}`}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
