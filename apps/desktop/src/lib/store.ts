import { documentDir, join } from "@tauri-apps/api/path";
import { LazyStore } from "@tauri-apps/plugin-store";
import { DEFAULT_ENABLED_IDS } from "@/lib/llm-services";
import type { AppSettings } from "@/types/settings";

const store = new LazyStore("settings.json");

const DEFAULT_DIR_NAME = "PromptPad";

export async function getDefaultPromptDir(): Promise<string> {
  const documents = await documentDir();
  return await join(documents, DEFAULT_DIR_NAME);
}

async function getDefaults(): Promise<AppSettings> {
  return {
    promptDir: await getDefaultPromptDir(),
    colorTheme: "system",
    themeId: "slate",
    fontSize: 14,
    language: "en",
    onboardingComplete: false,
    enabledLlmIds: DEFAULT_ENABLED_IDS,
    customLlmServices: [],
    templatePanelCollapsed: false,
  };
}

export async function loadSettings(): Promise<AppSettings> {
  const [
    defaults,
    promptDir,
    colorTheme,
    themeId,
    fontSize,
    language,
    onboardingComplete,
    enabledLlmIds,
    customLlmServices,
    templatePanelCollapsed,
  ] = await Promise.all([
    getDefaults(),
    store.get<string>("promptDir"),
    store.get<AppSettings["colorTheme"]>("colorTheme"),
    store.get<AppSettings["themeId"]>("themeId"),
    store.get<AppSettings["fontSize"]>("fontSize"),
    store.get<AppSettings["language"]>("language"),
    store.get<boolean>("onboardingComplete"),
    store.get<string[]>("enabledLlmIds"),
    store.get<AppSettings["customLlmServices"]>("customLlmServices"),
    store.get<boolean>("templatePanelCollapsed"),
  ]);

  return {
    promptDir: promptDir ?? defaults.promptDir,
    colorTheme: colorTheme ?? defaults.colorTheme,
    themeId: themeId ?? defaults.themeId,
    fontSize: fontSize ?? defaults.fontSize,
    language: language ?? defaults.language,
    onboardingComplete: onboardingComplete ?? defaults.onboardingComplete,
    enabledLlmIds: enabledLlmIds ?? defaults.enabledLlmIds,
    customLlmServices: customLlmServices ?? defaults.customLlmServices,
    templatePanelCollapsed:
      templatePanelCollapsed ?? defaults.templatePanelCollapsed,
  };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await store.set("promptDir", settings.promptDir);
  await store.set("colorTheme", settings.colorTheme);
  await store.set("themeId", settings.themeId);
  await store.set("fontSize", settings.fontSize);
  await store.set("language", settings.language);
  await store.set("onboardingComplete", settings.onboardingComplete);
  await store.set("enabledLlmIds", settings.enabledLlmIds);
  await store.set("customLlmServices", settings.customLlmServices);
  await store.set("templatePanelCollapsed", settings.templatePanelCollapsed);
  await store.save();
}
