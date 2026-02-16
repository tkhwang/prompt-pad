import type { Language } from "@/i18n/types";

export type ColorTheme = "light" | "dark" | "system";

export type ThemeId = "zinc" | "slate" | "stone" | "rose" | "sage" | "violet";

export interface AppSettings {
  promptDir: string;
  colorTheme: ColorTheme;
  themeId: ThemeId;
  fontSize: number;
  language: Language;
  onboardingComplete: boolean;
}
