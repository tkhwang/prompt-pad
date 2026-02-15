import { open } from "@tauri-apps/plugin-dialog";
import { Palette, RotateCcw, Settings2 } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TranslationKey } from "@/i18n";
import { LANGUAGE_OPTIONS } from "@/i18n";
import { useTranslation } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import type { AppSettings, ColorTheme } from "@/types/settings";

type SettingsCategory = "general" | "appearance";

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

const CATEGORIES: {
  id: SettingsCategory;
  labelKey: TranslationKey;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "general", labelKey: "settings.category_general", icon: Settings2 },
  {
    id: "appearance",
    labelKey: "settings.category_appearance",
    icon: Palette,
  },
];

const CATEGORY_LABEL: Record<SettingsCategory, TranslationKey> = {
  general: "settings.category_general",
  appearance: "settings.category_appearance",
};

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="space-y-0.5 pr-4">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0 w-48">{children}</div>
    </div>
  );
}

export function SettingsModal({
  open: isOpen,
  onOpenChange,
  settings,
  onUpdate,
  onRerunSetup,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const [dir, setDir] = useState(settings.promptDir);
  const [category, setCategory] = useState<SettingsCategory>("general");

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
      <DialogContent
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{t("settings.title")}</DialogTitle>
        <div className="flex h-[min(70vh,560px)]">
          {/* Sidebar */}
          <nav className="w-44 shrink-0 border-r bg-muted/30 p-3 flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold px-2 py-2 mb-1">
              {t("settings.title")}
            </h2>
            {CATEGORIES.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors text-left",
                  category === id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(labelKey)}
              </button>
            ))}
          </nav>

          {/* Content */}
          <ScrollArea className="flex-1 min-w-0">
            <div className="p-6">
              <h3 className="text-lg font-semibold">
                {t(CATEGORY_LABEL[category])}
              </h3>

              {category === "general" && (
                <div className="mt-4 divide-y divide-border">
                  {/* Setup wizard */}
                  <SettingRow
                    title={t("settings.setup_wizard")}
                    description={t("settings.setup_wizard_description")}
                  >
                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={onRerunSetup}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      {t("settings.rerun")}
                    </Button>
                  </SettingRow>

                  {/* Prompt directory */}
                  <div className="py-3 space-y-2">
                    <div>
                      <p className="text-sm font-medium">
                        {t("settings.prompt_dir_label")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.prompt_dir_description")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={dir}
                        onChange={(e) => setDir(e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBrowse}
                      >
                        {t("settings.prompt_dir_browse")}
                      </Button>
                    </div>
                    {dir !== settings.promptDir && (
                      <Button size="sm" onClick={handleSaveDir}>
                        {t("settings.prompt_dir_apply")}
                      </Button>
                    )}
                  </div>

                  {/* Language */}
                  <SettingRow
                    title={t("settings.language_label")}
                    description={t("settings.language_description")}
                  >
                    <div className="flex gap-1">
                      {LANGUAGE_OPTIONS.map(({ value, label }) => (
                        <Button
                          key={value}
                          className="flex-1 min-w-0"
                          variant={
                            settings.language === value ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => onUpdate({ language: value })}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </SettingRow>
                </div>
              )}

              {category === "appearance" && (
                <div className="mt-4 divide-y divide-border">
                  {/* Theme */}
                  <SettingRow
                    title={t("settings.theme_label")}
                    description={t("settings.theme_description")}
                  >
                    <div className="flex gap-1">
                      {THEME_OPTIONS.map(({ value, labelKey }) => (
                        <Button
                          key={value}
                          className="flex-1 min-w-0"
                          variant={
                            settings.colorTheme === value
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => onUpdate({ colorTheme: value })}
                        >
                          {t(labelKey)}
                        </Button>
                      ))}
                    </div>
                  </SettingRow>

                  {/* Font */}
                  <SettingRow
                    title={t("settings.font_label")}
                    description={t("settings.font_description")}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={12}
                        max={24}
                        step={1}
                        value={settings.fontSize}
                        onChange={(e) =>
                          onUpdate({ fontSize: Number(e.target.value) })
                        }
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-10 text-right tabular-nums">
                        {settings.fontSize}px
                      </span>
                    </div>
                  </SettingRow>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
