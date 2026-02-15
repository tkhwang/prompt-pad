import type { Language } from "@/i18n/types";

export type ColorTheme = "light" | "dark" | "system";
export type FontFamily = "system" | "mono" | "serif";

export interface AppSettings {
  promptDir: string;
  colorTheme: ColorTheme;
  fontFamily: FontFamily;
  language: Language;
  onboardingComplete: boolean;
}
