import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/I18nProvider";
import { extractVariables, substituteVariables } from "@/lib/template";

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  body: string;
}

export function TemplateModal({
  open,
  onOpenChange,
  body,
}: TemplateModalProps) {
  const { t } = useTranslation();
  const variables = extractVariables(body);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      for (const v of variables) {
        initial[v] = "";
      }
      setValues(initial);
    }
  }, [open, variables]);

  const handleCopy = async () => {
    const result = substituteVariables(body, values);
    await writeText(result);
    onOpenChange(false);
  };

  if (variables.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("template.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {variables.map((variable) => (
            <div key={variable} className="space-y-1">
              <label
                htmlFor={`var-${variable}`}
                className="text-sm font-medium"
              >
                {`{{${variable}}}`}
              </label>
              <Input
                id={`var-${variable}`}
                value={values[variable] || ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [variable]: e.target.value }))
                }
                placeholder={t("template.placeholder", { name: variable })}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("template.cancel")}
          </Button>
          <Button onClick={handleCopy}>{t("template.copy")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
