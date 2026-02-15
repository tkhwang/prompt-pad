import { useCallback, useEffect, useState } from "react";
import { loadSettings, saveSettings } from "@/lib/store";
import type { AppSettings, ColorTheme } from "@/types/settings";

function applyTheme(theme: ColorTheme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

function applyFontSize(size: number) {
  document.documentElement.style.setProperty("--editor-font-size", size + "px");
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        setSettings(s);
        applyTheme(s.colorTheme);
        applyFontSize(s.fontSize);
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen for system theme changes when theme is "system"
  useEffect(() => {
    if (!settings || settings.colorTheme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [settings]);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      if (!settings) return;
      const next = { ...settings, ...partial };
      setSettings(next);
      if (partial.colorTheme) applyTheme(partial.colorTheme);
      if (partial.fontSize !== undefined) applyFontSize(partial.fontSize);
      await saveSettings(next);
    },
    [settings],
  );

  const completeOnboarding = useCallback(async (finalSettings: AppSettings) => {
    const completed = { ...finalSettings, onboardingComplete: true };
    setSettings(completed);
    applyTheme(completed.colorTheme);
    applyFontSize(completed.fontSize);
    await saveSettings(completed);
  }, []);

  return { settings, loading, updateSettings, completeOnboarding };
}
