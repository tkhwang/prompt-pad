import { appDataDir, join } from "@tauri-apps/api/path";
import { LazyStore } from "@tauri-apps/plugin-store";
import type { AppSettings } from "@/types/settings";

const store = new LazyStore("settings.json");

const DEFAULT_DIR_NAME = "PromptPad";

export async function getDefaultPromptDir(): Promise<string> {
  const appData = await appDataDir();
  return await join(appData, DEFAULT_DIR_NAME);
}

async function getDefaults(): Promise<AppSettings> {
  return {
    promptDir: await getDefaultPromptDir(),
    colorTheme: "system",
    fontSize: 14,
    language: "en",
    onboardingComplete: false,
  };
}

export async function loadSettings(): Promise<AppSettings> {
  const defaults = await getDefaults();
  const promptDir =
    (await store.get<string>("promptDir")) ?? defaults.promptDir;
  const colorTheme =
    (await store.get<AppSettings["colorTheme"]>("colorTheme")) ??
    defaults.colorTheme;
  const fontSize =
    (await store.get<AppSettings["fontSize"]>("fontSize")) ?? defaults.fontSize;
  const language =
    (await store.get<AppSettings["language"]>("language")) ?? defaults.language;
  const onboardingComplete =
    (await store.get<boolean>("onboardingComplete")) ??
    defaults.onboardingComplete;
  return { promptDir, colorTheme, fontSize, language, onboardingComplete };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await store.set("promptDir", settings.promptDir);
  await store.set("colorTheme", settings.colorTheme);
  await store.set("fontSize", settings.fontSize);
  await store.set("language", settings.language);
  await store.set("onboardingComplete", settings.onboardingComplete);
  await store.save();
}
