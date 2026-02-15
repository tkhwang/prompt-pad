import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { FolderOpen, Sun, Moon, Monitor, Type } from "lucide-react";
import type { AppSettings, ColorTheme, FontFamily } from "@/types/settings";

interface OnboardingWizardProps {
  defaultSettings: AppSettings;
  onComplete: (settings: AppSettings) => void;
}

const STEPS = ["Folder", "Theme", "Font"] as const;

export function OnboardingWizard({ defaultSettings, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const handleBrowse = async () => {
    const selected = await open({
      title: "Select Prompt Storage Directory",
      directory: true,
      defaultPath: settings.promptDir,
    });
    if (selected) {
      setSettings((s) => ({ ...s, promptDir: selected as string }));
    }
  };

  const handleFinish = () => {
    onComplete(settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to Prompt Pad</h1>
          <p className="text-muted-foreground">Let's set things up in a few quick steps.</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
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
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Where should we store your prompts?</h2>
              <p className="text-sm text-muted-foreground">
                Prompts are saved as Markdown files. You can change this later in Settings.
              </p>
              <div className="flex gap-2 items-center">
                <div className="flex-1 px-3 py-2 rounded-md border bg-muted text-sm truncate">
                  {settings.promptDir}
                </div>
                <Button variant="outline" onClick={handleBrowse}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Browse
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Choose your theme</h2>
              <p className="text-sm text-muted-foreground">
                Pick a look that suits you. This can be changed anytime.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "light" as ColorTheme, label: "Light", icon: Sun },
                  { value: "dark" as ColorTheme, label: "Dark", icon: Moon },
                  { value: "system" as ColorTheme, label: "System", icon: Monitor },
                ]).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSettings((s) => ({ ...s, colorTheme: value }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      settings.colorTheme === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Pick your editor font</h2>
              <p className="text-sm text-muted-foreground">
                Choose the font style for the prompt editor.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "system" as FontFamily, label: "System", sample: "ui-sans-serif, system-ui, sans-serif" },
                  { value: "mono" as FontFamily, label: "Mono", sample: "ui-monospace, 'SF Mono', monospace" },
                  { value: "serif" as FontFamily, label: "Serif", sample: "ui-serif, Georgia, serif" },
                ]).map(({ value, label, sample }) => (
                  <button
                    key={value}
                    onClick={() => setSettings((s) => ({ ...s, fontFamily: value }))}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      settings.fontFamily === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Type className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: sample }}>
                      Aa Bb Cc
                    </span>
                  </button>
                ))}
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
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleFinish}>Get Started</Button>
          )}
        </div>
      </div>
    </div>
  );
}
