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

**Prompt Pad** is a monorepo containing a Tauri 2 desktop app, a NestJS backend, and a shared types package.

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
│   └── my-prompt.md   # ---\ntitle: ...\ntags: [...]\n---\n\nbody
└── Coding/
    └── review.md
```

Settings persist via Tauri Store at `~/.PromptPad/settings.json`.

### Key Hooks (Desktop)

| Hook | Purpose |
|------|---------|
| `usePrompts(promptDir)` | CRUD operations on prompt files, returns prompts/topics/selection state |
| `useSettings()` | Loads/saves AppSettings, applies theme & font to DOM |
| `useAutoSave(prompt, onSave)` | Debounced (500ms) save with JSON-diff change detection |
| `useSearch(prompts)` | Case-insensitive search over title + body |

### Component Layout (Desktop)

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

### Backend (NestJS)

Minimal NestJS 11 API server. Uses `@prompt-pad/shared` types for API contracts. Health endpoint at `GET /` returns `ApiResponse<{ status: string }>`.

### Shared Package

`@prompt-pad/shared` contains TypeScript interfaces shared between desktop and backend: `ApiResponse<T>`, `LoginRequest`, `LoginResponse`, `UserInfo`.

### I18n

Custom Context-based implementation (not i18next). Type-safe keys derived from `en.ts` structure via `NestedKeyOf`. Supports `{{variable}}` interpolation. Languages: `en.ts`, `ko.ts`.

### Theming

CSS variables in `index.css` using oklch color space. Three modes: light/dark/system. Font families (system/mono/serif) applied via `--editor-font` CSS variable and root class.

### Template System

Prompts support `{{variableName}}` placeholders. `extractVariables()` parses them, `TemplateModal` lets users fill values before copying to clipboard.

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
