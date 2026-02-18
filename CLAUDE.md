# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
# Monorepo (root)
pnpm build             # Turbo: build all packages (shared → desktop + backend)
pnpm dev               # Turbo: dev all packages
pnpm check             # Biome lint + format (auto-fix) across all packages

# Desktop (Tauri + React)
pnpm dev:desktop       # Vite dev server on localhost:1420
pnpm build:desktop     # tsc -b && vite build
pnpm --filter @prompt-pad/desktop tauri dev    # Full Tauri app with hot reload
pnpm --filter @prompt-pad/desktop tauri build  # Production desktop binary

# Backend (NestJS)
pnpm dev:backend       # NestJS watch mode on localhost:3000
pnpm build:backend     # nest build

# Shared types
pnpm --filter @prompt-pad/shared build   # tsc -b → dist/
```

No test framework is configured.

## After Code Changes

Always run these checks after modifying code:

```bash
pnpm build              # TypeScript type-check + build all packages
pnpm check              # Biome lint + format (auto-fix)
```

`pnpm check` runs `biome check --write .` which handles linting, formatting, and import sorting in one pass.

## Architecture

**PromptPad** is a monorepo containing a Tauri 2 desktop app, a NestJS backend, and a shared types package.

### Monorepo Structure

```
prompt-pad/
├── apps/
│   ├── desktop/          # @prompt-pad/desktop — Tauri 2 + React 19
│   │   ├── src/          # React frontend code
│   │   ├── src-tauri/    # Rust Tauri backend
│   │   └── ...
│   └── backend/          # @prompt-pad/backend — NestJS 11 API server
│       └── src/          # NestJS modules, controllers, services
├── packages/
│   └── shared/           # @prompt-pad/shared — shared TypeScript types
│       └── src/
├── turbo.json            # Turborepo task config
├── pnpm-workspace.yaml   # pnpm workspace definition
├── tsconfig.base.json    # Shared TypeScript base config
├── biome.json            # Biome config (applies to all packages)
└── package.json          # Root scripts + workspace devDependencies
```

### Stack

- **Monorepo**: pnpm workspaces + Turborepo 2
- **Desktop**: React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (new-york style), Tauri 2
- **Backend**: NestJS 11, TypeScript (strict)
- **Shared**: TypeScript types consumed by both desktop and backend
- **Icons**: lucide-react
- **Path alias** (desktop): `@/*` → `./src/*`

### Data Model

The filesystem is the database. Prompts are markdown files with YAML frontmatter, organized in topic directories:

```
~/PromptPad/           # default promptDir (configurable)
├── General/
│   └── my-prompt.md
└── Coding/
    └── review.md
```

Prompt frontmatter:

```yaml
title: ...
created: ISO8601
updated: ISO8601
tags: [tag1, tag2]
templateValues: { varName: value }
```

Key types:

- `Prompt` — id, title, body, topic, tags, filePath, created, updated, templateValues
- `Topic` — name, path, promptCount
- `LlmService` — id, label, url, queryParam, isCustom
- `AppSettings` — promptDir, colorTheme, themeId, fontSize, language, onboardingComplete, enabledLlmIds, customLlmServices

Settings persist via Tauri Store at `~/.PromptPad/settings.json`.

### Key Hooks (Desktop)

| Hook                          | Purpose                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `usePrompts(promptDir)`       | CRUD on prompt files + topic CRUD (create/rename/delete), returns prompts/topics/selection state |
| `useSettings()`               | Loads/saves AppSettings (theme, font, LLM services), applies appearance to DOM                   |
| `useAutoSave(prompt, onSave)` | Debounced (500ms) save with JSON-diff change detection                                           |
| `useSearch(prompts)`          | Case-insensitive search over title + body                                                        |

### Component Layout (Desktop)

```
App.tsx                          # Root: I18nProvider + state orchestration
├── TopicPanel/                  # Left sliding panel for topic management
│   └── TopicPanel              # Topic list with CRUD (create/rename/delete)
├── Sidebar/                     # Prompt list with search, grouped by topic
│   ├── SidebarToolbar          # View mode toggle + new prompt button
│   ├── SearchBar
│   ├── TopicGroup
│   └── PromptItem
├── Editor/                      # Right panel
│   ├── EditorPanel             # Main container: title, tags, editor/preview, template panel
│   ├── Editor                  # Wrapper for MarkdownToolbar + PromptEditor
│   ├── MarkdownToolbar         # Bear-style icon toolbar
│   ├── PromptEditor            # Body textarea (edit mode)
│   ├── BlockCard               # Individual content block with copy/send buttons
│   ├── MarkdownPreview         # GFM markdown rendering (view mode)
│   └── TemplatePanel           # Collapsible right sidebar for {{variable}} input
├── StatusBar                    # Bottom action bar with LLM service launcher
├── SettingsModal                # Settings with theme, font, language, LLM services
└── OnboardingWizard             # First-run setup flow (with skip option)
```

### Backend (NestJS)

Minimal NestJS 11 API server. Uses `@prompt-pad/shared` types for API contracts. Health endpoint at `GET /` returns `ApiResponse<{ status: string }>`.

### Shared Package

`@prompt-pad/shared` contains TypeScript interfaces shared between desktop and backend: `ApiResponse<T>`, `LoginRequest`, `LoginResponse`, `UserInfo`.

### I18n

Custom Context-based implementation (not i18next). Type-safe keys derived from `en.ts` structure via `NestedKeyOf`. Supports `{{variable}}` interpolation. Languages: `en.ts`, `ko.ts`.

### Theming

JS-based theme system in `lib/themes.ts`. Six named themes (`ThemeId`): zinc, slate, stone, rose, sage, violet. Each theme defines light/dark CSS variable sets using oklch color space. `useSettings()` applies theme vars to document root at runtime. Three color modes: light/dark/system. Font families (system/mono/serif) applied via `--editor-font` CSS variable and root class.

### Template System

`lib/template.ts` provides `extractVariables()` and `substituteVariables()`. `TemplatePanel` (collapsible right sidebar in editor) lets users fill `{{variable}}` values inline. Values persist in prompt frontmatter. Substitution happens before copy or send-to-LLM.

### LLM Services

`lib/llm-services.ts` defines preset services (ChatGPT, Claude, Gemini, Perplexity, Copilot, Grok, DeepSeek, Le Chat) + custom user services. `buildServiceUrl()` constructs URLs with prompt pre-filled via query parameter. Users enable/disable services in settings. Opens via Tauri shell plugin.

### Block System

Prompts split by `---` or `—` (em dash) separator into independent blocks. Each block renders as a `BlockCard` with its own copy/send buttons. Two view styles: markdown (styled blocks) and chat (bubble style).

### View Modes

Sidebar supports three density modes (compact/cozy/detailed) via `SidebarToolbar`. Editor toggles between edit mode (textarea) and view mode (markdown preview with blocks).

### Key Lib Files (Desktop)

| File                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `lib/llm-services.ts`    | LLM service definitions, URL builder                                               |
| `lib/markdown.ts`        | YAML frontmatter parsing (`parseMarkdown`) and serialization (`serializeMarkdown`) |
| `lib/template.ts`        | Template variable extraction and substitution                                      |
| `lib/themes.ts`          | Named color theme definitions (6 themes, light/dark variants)                      |
| `lib/title-generator.ts` | Poetic auto-generated titles for new prompts                                       |

### Keyboard Shortcuts

| Shortcut | Action     |
| -------- | ---------- |
| `⌘N`     | New prompt |
| `⌘⇧N`    | New topic  |

## TypeScript

Strict mode with `noUnusedLocals` and `noUnusedParameters` — unused variables cause build failures. Base config in `tsconfig.base.json`, extended by each package.

## Git

Do NOT create git commits. The user handles all git operations (commit, push, etc.) manually.

## Conventions

- shadcn/ui components live in `apps/desktop/src/components/ui/` — these are library primitives, not app code
- Feature components are organized by domain folder (Editor/, Sidebar/)
- All Tauri filesystem operations are wrapped in `apps/desktop/src/lib/fs.ts`
- NestJS controllers/services use `@prompt-pad/shared` types for API contracts
- NestJS files with DI imports need `biome-ignore lint/style/useImportType` comments
- Conventional commits: `feat(scope):`, `fix(scope):`, `chore(scope):`
