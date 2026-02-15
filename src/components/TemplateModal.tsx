import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractVariables, substituteVariables } from "@/lib/template";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  body: string;
}

export function TemplateModal({ open, onOpenChange, body }: TemplateModalProps) {
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
  }, [open]);

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
          <DialogTitle>Fill Template Variables</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {variables.map((variable) => (
            <div key={variable} className="space-y-1">
              <label className="text-sm font-medium">{`{{${variable}}}`}</label>
              <Input
                value={values[variable] || ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [variable]: e.target.value }))
                }
                placeholder={`Enter ${variable}...`}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCopy}>Copy to Clipboard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
