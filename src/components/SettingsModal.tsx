import { open } from "@tauri-apps/plugin-dialog";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { TranslationKey } from "@/i18n";
import { LANGUAGE_OPTIONS } from "@/i18n";
import { useTranslation } from "@/i18n/I18nProvider";
import type { AppSettings, ColorTheme, FontFamily } from "@/types/settings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
  onRerunSetup: () => void;
}

const THEME_OPTIONS: { value: ColorTheme; labelKey: TranslationKey }[] = [
  { value: "light", labelKey: "theme.light" },
  { value: "dark", labelKey: "theme.dark" },
  { value: "system", labelKey: "theme.system" },
];

const FONT_OPTIONS: { value: FontFamily; labelKey: TranslationKey }[] = [
  { value: "system", labelKey: "font.system" },
  { value: "mono", labelKey: "font.mono" },
  { value: "serif", labelKey: "font.serif" },
];

export function SettingsModal({
  open: isOpen,
  onOpenChange,
  settings,
  onUpdate,
  onRerunSetup,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [dir, setDir] = useState(settings.promptDir);

  const handleBrowse = async () => {
    const selected = await open({
      title: t("settings.browse_dialog_title"),
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
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Re-run setup wizard */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">
                {t("settings.setup_wizard")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("settings.setup_wizard_description")}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onRerunSetup}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              {t("settings.rerun")}
            </Button>
          </div>

          {/* Prompt directory */}
          <div className="space-y-2">
            <span className="text-sm font-medium">
              {t("settings.prompt_dir_label")}
            </span>
            <div className="flex gap-2">
              <Input
                value={dir}
                onChange={(e) => setDir(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleBrowse}>
                {t("settings.prompt_dir_browse")}
              </Button>
            </div>
            {dir !== settings.promptDir && (
              <Button size="sm" onClick={handleSaveDir}>
                {t("settings.prompt_dir_apply")}
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {t("settings.prompt_dir_description")}
            </p>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <span className="text-sm font-medium">
              {t("settings.language_label")}
            </span>
            <div className="flex gap-2">
              {LANGUAGE_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={settings.language === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdate({ language: value })}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <span className="text-sm font-medium">
              {t("settings.theme_label")}
            </span>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, labelKey }) => (
                <Button
                  key={value}
                  variant={
                    settings.colorTheme === value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onUpdate({ colorTheme: value })}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <span className="text-sm font-medium">
              {t("settings.font_label")}
            </span>
            <div className="flex gap-2">
              {FONT_OPTIONS.map(({ value, labelKey }) => (
                <Button
                  key={value}
                  variant={
                    settings.fontFamily === value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => onUpdate({ fontFamily: value })}
                >
                  {t(labelKey)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("settings.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
