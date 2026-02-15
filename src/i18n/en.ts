export const en = {
  app: {
    title: "Prompt Pad",
    loading: "Loading...",
    loading_prompts: "Loading prompts...",
  },

  new_prompt: {
    untitled: "Untitled",
  },

  onboarding: {
    welcome_title: "Welcome to Prompt Pad",
    welcome_subtitle: "Let's set things up in a few quick steps.",
    welcome_hint: "You can change all of these later in Settings.",
    language_title: "Choose your language",
    language_description: "Select a language for the interface.",
    folder_title: "Where should we store your prompts?",
    folder_description: "Prompts are saved as Markdown files.",
    folder_browse: "Browse",
    theme_title: "Choose your theme",
    theme_description: "Pick a look that suits you.",
    font_title: "Choose your font size",
    font_description: "Select the font size for the prompt editor.",
    font_sample: "Aa Bb Cc",
    back: "Back",
    next: "Next",
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
    theme_label: "Theme",
    theme_description: "Choose your preferred color theme.",
    font_label: "Font Size",
    font_description: "Select the font size for the editor.",
    language_label: "Language",
    language_description: "Select the interface language.",
    close: "Close",
    browse_dialog_title: "Select Prompt Storage Directory",
  },

  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
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
      "Write your prompt here... Use {{variable_name}} for template variables.",
    copy: "Copy",
    copied: "Copied!",
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
