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
  const [
    defaults,
    promptDir,
    colorTheme,
    fontSize,
    language,
    onboardingComplete,
  ] = await Promise.all([
    getDefaults(),
    store.get<string>("promptDir"),
    store.get<AppSettings["colorTheme"]>("colorTheme"),
    store.get<AppSettings["fontSize"]>("fontSize"),
    store.get<AppSettings["language"]>("language"),
    store.get<boolean>("onboardingComplete"),
  ]);

  return {
    promptDir: promptDir ?? defaults.promptDir,
    colorTheme: colorTheme ?? defaults.colorTheme,
    fontSize: fontSize ?? defaults.fontSize,
    language: language ?? defaults.language,
    onboardingComplete: onboardingComplete ?? defaults.onboardingComplete,
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await store.set("promptDir", settings.promptDir);
  await store.set("colorTheme", settings.colorTheme);
  await store.set("fontSize", settings.fontSize);
  await store.set("language", settings.language);
  await store.set("onboardingComplete", settings.onboardingComplete);
  await store.save();
}
