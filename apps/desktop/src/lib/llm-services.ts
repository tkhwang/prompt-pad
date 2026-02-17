export interface LlmService {
  id: string;
  label: string;
  url: string;
  /** Query parameter name for pre-filling prompt content (e.g. "q") */
  queryParam?: string;
  /** Whether this is a user-created custom service */
  isCustom?: boolean;
}

export const PRESET_LLM_SERVICES: LlmService[] = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    url: "https://chatgpt.com",
    queryParam: "q",
  },
  {
    id: "claude",
    label: "Claude",
    url: "https://claude.ai/new",
    queryParam: "q",
  },
  {
    id: "gemini",
    label: "Gemini",
    url: "https://gemini.google.com/app",
    queryParam: "q",
  },
  {
    id: "perplexity",
    label: "Perplexity",
    url: "https://www.perplexity.ai",
    queryParam: "q",
  },
  {
    id: "copilot",
    label: "Copilot",
    url: "https://copilot.microsoft.com",
    queryParam: "q",
  },
  { id: "grok", label: "Grok", url: "https://grok.com", queryParam: "q" },
  {
    id: "deepseek",
    label: "DeepSeek",
    url: "https://chat.deepseek.com",
    queryParam: "q",
  },
  {
    id: "lechat",
    label: "Le Chat",
    url: "https://chat.mistral.ai/chat",
    queryParam: "q",
  },
];

export const DEFAULT_ENABLED_IDS = [
  "chatgpt",
  "claude",
  "gemini",
  "perplexity",
];

export function buildServiceUrl(service: LlmService, prompt: string): string {
  if (!service.queryParam || !prompt) return service.url;
  const url = new URL(service.url);
  url.searchParams.set(service.queryParam, prompt);
  return url.toString();
}
