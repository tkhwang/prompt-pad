import { en } from "./en";
import { ko } from "./ko";
import type { Language } from "./types";

export type { Language } from "./types";

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

export const translations: Record<Language, Record<string, unknown>> = {
  en,
  ko,
};
