import { useCallback, useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/store";
import { THEMES } from "@/lib/themes";
import type { AppSettings, ColorTheme, ThemeId } from "@/types/settings";

function isDarkMode(theme: ColorTheme): boolean {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return theme === "dark";
}

function applyThemeMode(theme: ColorTheme) {
  document.documentElement.classList.toggle("dark", isDarkMode(theme));
}

function applyThemeVars(themeId: ThemeId, colorTheme: ColorTheme) {
  const dark = isDarkMode(colorTheme);
  const vars = dark ? THEMES[themeId].dark : THEMES[themeId].light;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(`--${key}`, value);
  }
}

function applyFontSize(size: number) {
  document.documentElement.style.setProperty("--editor-font-size", `${size}px`);
}

function applyAllAppearance(settings: AppSettings) {
  applyThemeMode(settings.colorTheme);
  applyThemeVars(settings.themeId, settings.colorTheme);
  applyFontSize(settings.fontSize);
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        setSettings(s);
        applyAllAppearance(s);
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for system theme changes when theme is "system"
  useEffect(() => {
    if (!settings || settings.colorTheme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyAllAppearance(settings);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings]);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      if (!settings) return;
      const next = { ...settings, ...partial };
      setSettings(next);
      applyAllAppearance(next);
      await saveSettings(next);
    },
    [settings],
  );

  const completeOnboarding = useCallback(async (finalSettings: AppSettings) => {
    const completed = { ...finalSettings, onboardingComplete: true };
    setSettings(completed);
    applyAllAppearance(completed);
    await saveSettings(completed);
  }, []);

  return { settings, loading, updateSettings, completeOnboarding };
}
