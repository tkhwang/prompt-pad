export const en = {
  app: {
    title: "PromptPad",
    loading: "Loading...",
    loading_prompts: "Loading prompts...",
  },

  new_prompt: {
    untitled: "Untitled",
  },

  onboarding: {
    welcome_title: "Welcome to PromptPad",
    welcome_subtitle: "Let's set things up in a few quick steps.",
    welcome_hint: "You can change all of these later in Settings.",
    language_title: "Choose your language",
    language_description: "Select a language for the interface.",
    folder_title: "Where should we store your prompts?",
    folder_description: "Prompts are saved as Markdown files.",
    folder_browse: "Browse",
    theme_title: "Choose your theme",
    theme_description: "Pick a look that suits you.",
    color_theme_title: "Choose a color theme",
    color_theme_description: "Pick a color palette for the interface.",
    font_title: "Choose your font size",
    font_description: "Select the font size for the prompt editor.",
    font_sample: "Aa Bb Cc",
    llm_title: "Choose your LLM services",
    llm_description: "Select the services you'd like in the Send To menu.",
    back: "Back",
    next: "Next",
    skip: "Skip",
    finish: "Get Started",
    browse_dialog_title: "Select Prompt Storage Directory",
  },

  settings: {
    title: "Settings",
    category_general: "General",
    category_appearance: "Appearance",
    setup_wizard: "Setup Wizard",
    setup_wizard_description: "Re-run the initial setup wizard",
    rerun: "Re-run",
    prompt_dir_label: "Prompt Storage Directory",
    prompt_dir_browse: "Browse",
    prompt_dir_apply: "Apply Directory Change",
    prompt_dir_description:
      "Prompts are stored as Markdown files in this directory.",
    theme_label: "Mode",
    theme_description: "Choose light, dark, or system mode.",
    color_theme_label: "Color Theme",
    color_theme_description: "Choose a color palette for the interface.",
    font_label: "Font Size",
    font_description: "Select the font size for the editor.",
    language_label: "Language",
    language_description: "Select the interface language.",
    close: "Close",
    browse_dialog_title: "Select Prompt Storage Directory",
    category_llm: "LLM Services",
    llm_services_label: "LLM Services",
    llm_services_description:
      "Choose which LLM services appear in the Send To menu.",
    llm_custom_add: "Add",
    llm_custom_label: "Service Name",
    llm_custom_url: "URL",
    llm_custom_delete: "Delete",
  },

  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
    zinc: "Zinc",
    zinc_description: "Pure grayscale",
    slate: "Blueberry",
    slate_description: "Vivid blue",
    stone: "Tangerine",
    stone_description: "Warm orange",
    rose: "Rose",
    rose_description: "Warm red",
    sage: "Kale",
    sage_description: "Forest green",
    violet: "Lavender",
    violet_description: "Soft purple",
  },

  language: {
    en: "English",
    ko: "Korean",
  },

  status: {
    new_prompt: "New Prompt",
    new_topic: "New Topic",
    copy: "Copy",
    select_topic: "Select Topic",
    settings: "Settings",
  },

  template: {
    title: "Template Variables",
    placeholder: "Enter {{name}}...",
    copy: "Copy with Variables",
  },

  editor: {
    empty: "Select a prompt or create a new one",
    placeholder_title: "Prompt title...",
    placeholder_body:
      "Write your prompt in markdown format here.\n\nUse ---  to separate blocks.\n\nUse {{variableName}} for template variables\n\nCopy (▲) button to send to your favorite LLM service\n\n✏️ Pencil icon to edit, 👁️ Eye icon to preview",
    tag_placeholder: "Add tag...",
    copy: "Copy",
    copyAll: "Copy All",
    copied: "Copied!",
    sendTo: "{{service}}",
    view: "View",
    edit: "Edit",
  },

  sidebar: {
    empty: "No prompts yet. Click + to create one.",
    search_placeholder: "Search prompts...",
    new_prompt: "New Prompt",
  },

  topic_panel: {
    all_prompts: "All Prompts",
    create: "New Topic",
    create_placeholder: "Topic name",
    rename: "Rename",
    delete: "Delete",
    delete_confirm: 'Delete "{{name}}" and all its prompts?',
    delete_description: "This action cannot be undone.",
    cancel: "Cancel",
  },

  prompt: {
    delete_confirm: 'Delete "{{title}}"?',
    delete_description: "This action cannot be undone.",
    delete_cancel: "Cancel",
    delete_action: "Delete",
  },
} as const;
