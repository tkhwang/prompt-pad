import type { Language } from "@/i18n/types";

export type ColorTheme = "light" | "dark" | "system";

export interface AppSettings {
  promptDir: string;
  colorTheme: ColorTheme;
  fontSize: number;
  language: Language;
  onboardingComplete: boolean;
}
