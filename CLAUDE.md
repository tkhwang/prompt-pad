# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
pnpm run dev          # Vite dev server on localhost:1420
pnpm run build        # tsc -b && vite build (type-check then bundle)
pnpm tauri dev        # Full Tauri desktop app with hot reload
pnpm tauri build      # Production desktop binary
```

No test framework is configured.

## After Code Changes

Always run these checks after modifying code:

```bash
pnpm run build          # TypeScript type-check + build
pnpm run check          # Biome lint + format (auto-fix)
```

`pnpm run check` runs `biome check --write .` which handles linting, formatting, and import sorting in one pass.

## Architecture

**Prompt Pad** is a Tauri 2 desktop app (React 19 + Rust) for managing prompt templates stored as markdown files on disk.

### Stack

- **Frontend**: React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (new-york style)
- **Desktop shell**: Tauri 2 with plugins: fs, dialog, clipboard-manager, store
- **Icons**: lucide-react
- **Path alias**: `@/*` → `./src/*`

### Data Model

The filesystem is the database. Prompts are markdown files with YAML frontmatter, organized in topic directories:

```
~/PromptPad/           # default promptDir (configurable)
├── General/
│   └── my-prompt.md   # ---\ntitle: ...\ntags: [...]\n---\n\nbody
└── Coding/
    └── review.md
```

Settings persist via Tauri Store at `~/.PromptPad/settings.json`.

### Key Hooks

| Hook | Purpose |
|------|---------|
| `usePrompts(promptDir)` | CRUD operations on prompt files, returns prompts/topics/selection state |
| `useSettings()` | Loads/saves AppSettings, applies theme & font to DOM |
| `useAutoSave(prompt, onSave)` | Debounced (500ms) save with JSON-diff change detection |
| `useSearch(prompts)` | Case-insensitive search over title + body |

### Component Layout

```
App.tsx                          # Root: I18nProvider + state orchestration
├── Sidebar/                     # Prompt list with search, grouped by topic
│   ├── SearchBar
│   ├── TopicGroup
│   └── PromptItem
├── Editor/                      # Right panel
│   ├── MetaBar                  # Title input
│   ├── MarkdownToolbar          # Bear-style icon toolbar (visual only)
│   └── PromptEditor             # Body textarea
├── StatusBar                    # Bottom action bar
├── SettingsModal
├── TemplateModal                # {{variable}} fill & copy
└── OnboardingWizard             # First-run setup flow
```

### I18n

Custom Context-based implementation (not i18next). Type-safe keys derived from `en.ts` structure via `NestedKeyOf`. Supports `{{variable}}` interpolation. Languages: `en.ts`, `ko.ts`.

### Theming

CSS variables in `index.css` using oklch color space. Three modes: light/dark/system. Font families (system/mono/serif) applied via `--editor-font` CSS variable and root class.

### Template System

Prompts support `{{variableName}}` placeholders. `extractVariables()` parses them, `TemplateModal` lets users fill values before copying to clipboard.

## TypeScript

Strict mode with `noUnusedLocals` and `noUnusedParameters` — unused variables cause build failures.

## Conventions

- shadcn/ui components live in `src/components/ui/` — these are library primitives, not app code
- Feature components are organized by domain folder (Editor/, Sidebar/)
- All Tauri filesystem operations are wrapped in `src/lib/fs.ts`
- Conventional commits: `feat(scope):`, `fix(scope):`, `chore(scope):`
