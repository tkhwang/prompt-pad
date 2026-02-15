import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, Globe, Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Language } from "@/i18n";
import { LANGUAGE_OPTIONS } from "@/i18n";
import { useTranslation } from "@/i18n/I18nProvider";
import type { AppSettings, ColorTheme } from "@/types/settings";

interface OnboardingWizardProps {
  defaultSettings: AppSettings;
  onComplete: (settings: AppSettings) => void;
  onLanguageChange: (language: Language) => void;
}

const STEP_COUNT = 4;

export function OnboardingWizard({
  defaultSettings,
  onComplete,
  onLanguageChange,
}: OnboardingWizardProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const handleBrowse = async () => {
    const selected = await open({
      title: t("onboarding.browse_dialog_title"),
      directory: true,
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

  const handleFinish = () => {
    onComplete(settings);
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

          {step === 2 && (
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
                    onClick={() =>
                      setSettings((s) => ({ ...s, colorTheme: value }))
                    }
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

          {step === 3 && (
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
                    fontSize: settings.fontSize + "px",
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
  );
}
