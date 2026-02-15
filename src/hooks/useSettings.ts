import { useState, useEffect, useCallback } from "react";
import type { AppSettings, ColorTheme, FontFamily } from "@/types/settings";
import { loadSettings, saveSettings } from "@/lib/store";

function applyTheme(theme: ColorTheme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

function applyFont(font: FontFamily) {
  const root = document.documentElement;
  root.classList.remove("font-system", "font-mono", "font-serif");
  root.classList.add(`font-${font}`);
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings()
      .then((s) => {
        setSettings(s);
        applyTheme(s.colorTheme);
        applyFont(s.fontFamily);
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
  }, [settings?.colorTheme]);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      if (!settings) return;
      const next = { ...settings, ...partial };
      setSettings(next);
      if (partial.colorTheme) applyTheme(partial.colorTheme);
      if (partial.fontFamily) applyFont(partial.fontFamily);
      await saveSettings(next);
    },
    [settings]
  );

  const completeOnboarding = useCallback(
    async (finalSettings: AppSettings) => {
      const completed = { ...finalSettings, onboardingComplete: true };
      setSettings(completed);
      applyTheme(completed.colorTheme);
      applyFont(completed.fontFamily);
      await saveSettings(completed);
    },
    []
  );

  return { settings, loading, updateSettings, completeOnboarding };
}
