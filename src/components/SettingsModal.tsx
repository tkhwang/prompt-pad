import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { open } from "@tauri-apps/plugin-dialog";
import { RotateCcw } from "lucide-react";
import type { AppSettings, ColorTheme, FontFamily } from "@/types/settings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
  onRerunSetup: () => void;
}

const THEME_OPTIONS: { value: ColorTheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: "system", label: "System" },
  { value: "mono", label: "Monospace" },
  { value: "serif", label: "Serif" },
];

export function SettingsModal({
  open: isOpen,
  onOpenChange,
  settings,
  onUpdate,
  onRerunSetup,
}: SettingsModalProps) {
  const [dir, setDir] = useState(settings.promptDir);

  const handleBrowse = async () => {
    const selected = await open({
      title: "Select Prompt Storage Directory",
      directory: true,
      defaultPath: dir,
    });
    if (selected) {
      setDir(selected as string);
    }
  };

  const handleSaveDir = () => {
    if (dir !== settings.promptDir) {
      onUpdate({ promptDir: dir });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Re-run setup wizard */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Setup Wizard</p>
              <p className="text-xs text-muted-foreground">Re-run the initial setup wizard</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRerunSetup}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Re-run
            </Button>
          </div>

          {/* Prompt directory */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt Storage Directory</label>
            <div className="flex gap-2">
              <Input value={dir} onChange={(e) => setDir(e.target.value)} className="flex-1" />
              <Button variant="outline" onClick={handleBrowse}>
                Browse
              </Button>
            </div>
            {dir !== settings.promptDir && (
              <Button size="sm" onClick={handleSaveDir}>
                Apply Directory Change
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Prompts are stored as Markdown files in this directory.
            </p>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={settings.colorTheme === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate({ colorTheme: value })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Editor Font</label>
            <div className="flex gap-2">
              {FONT_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={settings.fontFamily === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate({ fontFamily: value })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
