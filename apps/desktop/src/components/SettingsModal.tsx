import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import {
  Check,
  Database,
  Palette,
  RefreshCw,
  RotateCcw,
  Send,
  Settings2,
  Trash2,
} from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type { TranslationKey } from "@/i18n";
import { LANGUAGE_OPTIONS } from "@/i18n";
import { useTranslation } from "@/i18n/I18nProvider";
import {
  type DistributionChannel,
  getDistributionChannel,
} from "@/lib/distribution";
import { type LlmService, PRESET_LLM_SERVICES } from "@/lib/llm-services";
import { THEME_IDS, THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { AppSettings, ColorTheme, ThemeId } from "@/types/settings";

type SettingsCategory = "general" | "appearance" | "llm" | "data" | "update";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings;
  onUpdate: (partial: Partial<AppSettings>) => void;
  onRerunSetup: () => void;
  onCheckForUpdate: () => void;
}

const MODE_OPTIONS: { value: ColorTheme; labelKey: TranslationKey }[] = [
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
  { id: "llm", labelKey: "settings.category_llm", icon: Send },
  { id: "data", labelKey: "settings.category_data", icon: Database },
  { id: "update", labelKey: "settings.category_update", icon: RefreshCw },
];

const CATEGORY_LABEL: Record<SettingsCategory, TranslationKey> = {
  general: "settings.category_general",
  appearance: "settings.category_appearance",
  llm: "settings.category_llm",
  data: "settings.category_data",
  update: "settings.category_update",
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

function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3 space-y-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function ThemeCard({
  themeId,
  selected,
  onClick,
}: {
  themeId: ThemeId;
  selected: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const theme = THEMES[themeId];
  const preview = theme.preview;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 p-2 text-left transition-all hover:shadow-sm",
        selected
          ? "border-primary ring-1 ring-primary/30"
          : "border-border hover:border-muted-foreground/30",
      )}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5 rounded-full bg-primary p-0.5">
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      )}
      {/* Mini app preview */}
      <div
        className="rounded-md overflow-hidden border border-black/5 mb-2"
        style={{ backgroundColor: preview.bg }}
      >
        <div className="flex h-14">
          <div
            className="w-8 shrink-0"
            style={{
              backgroundColor: preview.sidebar,
              borderRight: `1px solid ${preview.border}`,
            }}
          >
            <div
              className="m-1.5 h-1.5 rounded-sm"
              style={{ backgroundColor: preview.accent, opacity: 0.7 }}
            />
            <div
              className="mx-1.5 h-1 rounded-sm opacity-25"
              style={{ backgroundColor: preview.border }}
            />
            <div
              className="mx-1.5 mt-0.5 h-1 rounded-sm opacity-25"
              style={{ backgroundColor: preview.border }}
            />
          </div>
          <div className="flex-1 p-1.5">
            <div
              className="h-1.5 w-10 rounded-sm opacity-30"
              style={{ backgroundColor: preview.border }}
            />
            <div
              className="mt-1 h-1 w-16 rounded-sm opacity-20"
              style={{ backgroundColor: preview.border }}
            />
            <div
              className="mt-0.5 h-1 w-12 rounded-sm opacity-20"
              style={{ backgroundColor: preview.border }}
            />
          </div>
        </div>
      </div>
      {/* Color swatches */}
      <div className="flex gap-1 mb-1.5">
        <div
          className="h-2.5 w-2.5 rounded-full border border-black/10"
          style={{ backgroundColor: preview.bg }}
        />
        <div
          className="h-2.5 w-2.5 rounded-full border border-black/10"
          style={{ backgroundColor: preview.sidebar }}
        />
        <div
          className="h-2.5 w-2.5 rounded-full border border-black/10"
          style={{ backgroundColor: preview.border }}
        />
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: preview.accent }}
        />
      </div>
      <p className="text-xs font-medium leading-none">
        {t(`theme.${themeId}` as TranslationKey)}
      </p>
      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
        {t(`theme.${themeId}_description` as TranslationKey)}
      </p>
    </button>
  );
}

export function SettingsModal({
  open: isOpen,
  onOpenChange,
  settings,
  onUpdate,
  onRerunSetup,
  onCheckForUpdate,
}: SettingsModalProps) {
  const { t } = useTranslation();

  const [dir, setDir] = useState(settings.promptDir);
  const [category, setCategory] = useState<SettingsCategory>("general");
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [channel, setChannel] = useState<DistributionChannel>("direct");

  useEffect(() => {
    import("@tauri-apps/api/app").then(({ getVersion }) =>
      getVersion().then(setAppVersion),
    );
    getDistributionChannel().then(setChannel);
  }, []);

  const handleBrowse = async () => {
    const selected = await open({
      title: t("settings.browse_dialog_title"),
      directory: true,
      recursive: true,
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
            {CATEGORIES.filter(
              ({ id }) => !(id === "update" && channel === "mas"),
            ).map(({ id, labelKey, icon: Icon }) => (
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
                        readOnly
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
                  {/* Mode (Light/Dark/System) */}
                  <SettingRow
                    title={t("settings.theme_label")}
                    description={t("settings.theme_description")}
                  >
                    <div className="flex gap-1">
                      {MODE_OPTIONS.map(({ value, labelKey }) => (
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

                  {/* Color Theme */}
                  <SettingSection
                    title={t("settings.color_theme_label")}
                    description={t("settings.color_theme_description")}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {THEME_IDS.map((id) => (
                        <ThemeCard
                          key={id}
                          themeId={id}
                          selected={settings.themeId === id}
                          onClick={() => onUpdate({ themeId: id })}
                        />
                      ))}
                    </div>
                  </SettingSection>

                  {/* Font Size */}
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

              {category === "llm" && (
                <div className="mt-4 space-y-4">
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                      {t("settings.llm_services_description")}
                    </p>
                  </div>

                  {/* Preset services */}
                  <div className="divide-y divide-border">
                    {PRESET_LLM_SERVICES.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between py-2.5"
                      >
                        <span className="text-sm">{service.label}</span>
                        <Switch
                          checked={settings.enabledLlmIds.includes(service.id)}
                          onCheckedChange={(checked) => {
                            const ids = checked
                              ? [...settings.enabledLlmIds, service.id]
                              : settings.enabledLlmIds.filter(
                                  (id) => id !== service.id,
                                );
                            onUpdate({ enabledLlmIds: ids });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Custom services */}
                  {settings.customLlmServices.length > 0 && (
                    <div className="divide-y divide-border">
                      {settings.customLlmServices.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center justify-between py-2.5"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <span className="text-sm">{service.label}</span>
                            <p className="text-xs text-muted-foreground truncate">
                              {service.url}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={settings.enabledLlmIds.includes(
                                service.id,
                              )}
                              onCheckedChange={(checked) => {
                                const ids = checked
                                  ? [...settings.enabledLlmIds, service.id]
                                  : settings.enabledLlmIds.filter(
                                      (id) => id !== service.id,
                                    );
                                onUpdate({ enabledLlmIds: ids });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                onUpdate({
                                  customLlmServices:
                                    settings.customLlmServices.filter(
                                      (s) => s.id !== service.id,
                                    ),
                                  enabledLlmIds: settings.enabledLlmIds.filter(
                                    (id) => id !== service.id,
                                  ),
                                });
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add custom service form */}
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("settings.llm_custom_label")}
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <Input
                        placeholder={t("settings.llm_custom_url")}
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!customLabel.trim() || !customUrl.trim()}
                        onClick={() => {
                          const id = `custom-${crypto.randomUUID()}`;
                          const newService: LlmService = {
                            id,
                            label: customLabel.trim(),
                            url: customUrl.trim(),
                            isCustom: true,
                          };
                          onUpdate({
                            customLlmServices: [
                              ...settings.customLlmServices,
                              newService,
                            ],
                            enabledLlmIds: [...settings.enabledLlmIds, id],
                          });
                          setCustomLabel("");
                          setCustomUrl("");
                        }}
                      >
                        {t("settings.llm_custom_add")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {category === "data" && (
                <div className="mt-4 divide-y divide-border">
                  <SettingRow
                    title={t("settings.export_label")}
                    description={t("settings.export_description")}
                  >
                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const today = new Date().toISOString().slice(0, 10);
                        const outputPath = await save({
                          title: t("settings.export_label"),
                          defaultPath: `PromptPad-export-${today}.zip`,
                          filters: [{ name: "Zip", extensions: ["zip"] }],
                        });
                        if (!outputPath) return;
                        toast.loading(t("settings.exporting"), {
                          id: "data-export",
                        });
                        try {
                          await invoke("export_data_zip", {
                            sourceDir: settings.promptDir,
                            outputPath,
                          });
                          toast.success(t("settings.export_success"), {
                            id: "data-export",
                          });
                        } catch {
                          toast.error(t("settings.export_error"), {
                            id: "data-export",
                          });
                        }
                      }}
                    >
                      <Database className="h-3.5 w-3.5 mr-1.5" />
                      {t("settings.export_button")}
                    </Button>
                  </SettingRow>
                </div>
              )}

              {category === "update" && (
                <div className="mt-4 divide-y divide-border">
                  <SettingRow
                    title={t("settings.version_label")}
                    description={t("settings.version_description")}
                  >
                    <p className="text-sm text-right">v{appVersion}</p>
                  </SettingRow>
                  <SettingRow
                    title={t("settings.check_update_label")}
                    description={t("settings.check_update_description")}
                  >
                    <Button
                      className="w-full"
                      variant="outline"
                      size="sm"
                      onClick={onCheckForUpdate}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      {t("settings.check_update_button")}
                    </Button>
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
