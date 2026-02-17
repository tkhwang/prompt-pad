import { open } from "@tauri-apps/plugin-dialog";
import { Check, FolderOpen, Globe, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Language, TranslationKey } from "@/i18n";
import { LANGUAGE_OPTIONS } from "@/i18n";
import { useTranslation } from "@/i18n/I18nProvider";
import { DEFAULT_ENABLED_IDS, PRESET_LLM_SERVICES } from "@/lib/llm-services";
import { THEME_IDS, THEMES } from "@/lib/themes";
import { cn } from "@/lib/utils";
import type { AppSettings, ColorTheme, ThemeId } from "@/types/settings";

interface OnboardingWizardProps {
  defaultSettings: AppSettings;
  onComplete: (settings: AppSettings) => void;
  onLanguageChange: (language: Language) => void;
  onThemePreview: (partial: Partial<AppSettings>) => void;
}

const STEP_COUNT = 6;

function OnboardingThemeCard({
  themeId,
  selected,
  onClick,
  label,
  description,
}: {
  themeId: ThemeId;
  selected: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  const preview = THEMES[themeId].preview;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-lg border-2 p-2.5 text-left transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
      )}
    >
      {selected && (
        <div className="absolute top-1.5 right-1.5 rounded-full bg-primary p-0.5">
          <Check className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      )}
      {/* Mini preview */}
      <div
        className="rounded-md overflow-hidden border border-black/5 mb-2"
        style={{ backgroundColor: preview.bg }}
      >
        <div className="flex h-10">
          <div
            className="w-6 shrink-0"
            style={{
              backgroundColor: preview.sidebar,
              borderRight: `1px solid ${preview.border}`,
            }}
          >
            <div
              className="m-1 h-1.5 rounded-sm"
              style={{ backgroundColor: preview.accent, opacity: 0.7 }}
            />
          </div>
          <div className="flex-1 p-1.5">
            <div
              className="h-1 w-8 rounded-sm opacity-25"
              style={{ backgroundColor: preview.border }}
            />
            <div
              className="mt-1 h-1 w-12 rounded-sm opacity-15"
              style={{ backgroundColor: preview.border }}
            />
          </div>
        </div>
      </div>
      {/* Swatches */}
      <div className="flex gap-1 mb-1">
        <div
          className="h-2 w-2 rounded-full border border-black/10"
          style={{ backgroundColor: preview.sidebar }}
        />
        <div
          className="h-2 w-2 rounded-full border border-black/10"
          style={{ backgroundColor: preview.border }}
        />
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: preview.accent }}
        />
      </div>
      <p className="text-xs font-medium leading-none">{label}</p>
      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
        {description}
      </p>
    </button>
  );
}

export function OnboardingWizard({
  defaultSettings,
  onComplete,
  onLanguageChange,
  onThemePreview,
}: OnboardingWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [enabledLlmIds, setEnabledLlmIds] = useState<string[]>(
    defaultSettings.enabledLlmIds ?? DEFAULT_ENABLED_IDS,
  );

  const handleBrowse = async () => {
    const selected = await open({
      title: t("onboarding.browse_dialog_title"),
      directory: true,
      recursive: true,
      defaultPath: settings.promptDir,
    });
    if (selected) {
      setSettings((s) => ({ ...s, promptDir: selected as string }));
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setSettings((s) => ({ ...s, language: lang }));
    onLanguageChange(lang);
  };

  const toggleLlmService = (id: string) => {
    setEnabledLlmIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleFinish = () => {
    onComplete({ ...settings, enabledLlmIds });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {t("onboarding.welcome_title")}
          </h1>
          <p className="text-muted-foreground">
            {t("onboarding.welcome_subtitle")}
          </p>
          <p className="text-sm text-muted-foreground/70">
            {t("onboarding.welcome_hint")}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static step indicators never reorder
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < STEP_COUNT - 1 && (
                <div
                  className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {/* Required: Step 0 — Language */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {t("onboarding.language_title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.language_description")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGE_OPTIONS.map(({ value, label }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => handleLanguageSelect(value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      settings.language === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Globe className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Required: Step 1 — Folder */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {t("onboarding.folder_title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.folder_description")}
              </p>
              <div className="flex gap-2 items-center">
                <div className="flex-1 px-3 py-2 rounded-md border bg-muted text-sm truncate">
                  {settings.promptDir}
                </div>
                <Button variant="outline" onClick={handleBrowse}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {t("onboarding.folder_browse")}
                </Button>
              </div>
            </div>
          )}

          {/* Required: Step 2 — LLM Services */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {t("onboarding.llm_title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.llm_description")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_LLM_SERVICES.map((service) => {
                  const selected = enabledLlmIds.includes(service.id);
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleLlmService(service.id)}
                      className={cn(
                        "relative flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 rounded-full bg-primary p-0.5">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {service.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Optional: Step 3 — Theme mode */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {t("onboarding.theme_title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.theme_description")}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    value: "light" as ColorTheme,
                    labelKey: "theme.light" as const,
                    icon: Sun,
                  },
                  {
                    value: "dark" as ColorTheme,
                    labelKey: "theme.dark" as const,
                    icon: Moon,
                  },
                  {
                    value: "system" as ColorTheme,
                    labelKey: "theme.system" as const,
                    icon: Monitor,
                  },
                ].map(({ value, labelKey, icon: Icon }) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => {
                      setSettings((s) => ({ ...s, colorTheme: value }));
                      onThemePreview({ colorTheme: value });
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      settings.colorTheme === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{t(labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional: Step 4 — Color theme */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {t("onboarding.color_theme_title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.color_theme_description")}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {THEME_IDS.map((id) => (
                  <OnboardingThemeCard
                    key={id}
                    themeId={id}
                    selected={settings.themeId === id}
                    onClick={() => {
                      setSettings((s) => ({ ...s, themeId: id }));
                      onThemePreview({ themeId: id });
                    }}
                    label={t(`theme.${id}` as TranslationKey)}
                    description={t(`theme.${id}_description` as TranslationKey)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional: Step 5 — Font size */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {t("onboarding.font_title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("onboarding.font_description")}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={12}
                  max={24}
                  step={1}
                  value={settings.fontSize}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      fontSize: Number(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-10 text-right tabular-nums">
                  {settings.fontSize}px
                </span>
              </div>
              <div className="p-4 rounded-lg border">
                <span
                  className="text-muted-foreground"
                  style={{
                    fontFamily:
                      "ui-monospace, 'SF Mono', 'Cascadia Code', monospace",
                    fontSize: `${settings.fontSize}px`,
                  }}
                >
                  {t("onboarding.font_sample")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            {t("onboarding.back")}
          </Button>
          <div className="flex gap-2">
            {step >= 3 && step < STEP_COUNT - 1 && (
              <Button variant="ghost" onClick={handleFinish}>
                {t("onboarding.skip")}
              </Button>
            )}
            {step < STEP_COUNT - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                {t("onboarding.next")}
              </Button>
            ) : (
              <Button onClick={handleFinish}>{t("onboarding.finish")}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
