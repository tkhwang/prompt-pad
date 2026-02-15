import { LazyStore } from "@tauri-apps/plugin-store";
import { homeDir, join } from "@tauri-apps/api/path";
import type { AppSettings } from "@/types/settings";

const store = new LazyStore("settings.json");

const DEFAULT_DIR_NAME = "PromptPad";

export async function getDefaultPromptDir(): Promise<string> {
  const home = await homeDir();
  return await join(home, DEFAULT_DIR_NAME);
}

async function getDefaults(): Promise<AppSettings> {
  return {
    promptDir: await getDefaultPromptDir(),
    colorTheme: "system",
    fontFamily: "mono",
    onboardingComplete: false,
  };
}

export async function loadSettings(): Promise<AppSettings> {
  const defaults = await getDefaults();
  const promptDir = await store.get<string>("promptDir") ?? defaults.promptDir;
  const colorTheme = await store.get<AppSettings["colorTheme"]>("colorTheme") ?? defaults.colorTheme;
  const fontFamily = await store.get<AppSettings["fontFamily"]>("fontFamily") ?? defaults.fontFamily;
  const onboardingComplete = await store.get<boolean>("onboardingComplete") ?? defaults.onboardingComplete;
  return { promptDir, colorTheme, fontFamily, onboardingComplete };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await store.set("promptDir", settings.promptDir);
  await store.set("colorTheme", settings.colorTheme);
  await store.set("fontFamily", settings.fontFamily);
  await store.set("onboardingComplete", settings.onboardingComplete);
  await store.save();
}
