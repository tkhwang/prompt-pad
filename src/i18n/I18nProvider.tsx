import { createContext, useContext } from "react";
import type { Language, TranslationKey } from "./index";
import { DEFAULT_LANGUAGE, translations } from "./index";

type TranslationFn = (
  key: TranslationKey,
  vars?: Record<string, string>,
) => string;

interface I18nContextValue {
  language: Language;
  t: TranslationFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolve(
  obj: Record<string, unknown>,
  path: string,
): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

interface I18nProviderProps {
  language: Language;
  children: React.ReactNode;
}

export function I18nProvider({ language, children }: I18nProviderProps) {
  const t: TranslationFn = (key, vars) => {
    const str =
      resolve(translations[language], key) ??
      resolve(translations[DEFAULT_LANGUAGE], key) ??
      key;
    if (!vars) return str;
    return str.replace(
      /\{\{(\w+)\}\}/g,
      (_, name) => vars[name] ?? `{{${name}}}`,
    );
  };

  return (
    <I18nContext.Provider value={{ language, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return ctx;
}
