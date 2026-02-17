# PromptPad

A desktop app for managing AI prompt templates. Prompts are stored as plain Markdown files on your filesystem — no cloud, no lock-in.

Built with [Tauri 2](https://v2.tauri.app/) + [React 19](https://react.dev/) + [NestJS 11](https://nestjs.com/), managed as a [Turborepo](https://turbo.build/) monorepo.

## Features

- **File-based storage** — Prompts are Markdown files with YAML frontmatter, organized in topic folders. Portable and version-control friendly.
- **Topic organization** — Group prompts by topic (e.g., Coding, Writing, General). Create, rename, and delete topics freely.
- **Template variables** — Use `{{variable}}` placeholders in prompts. Fill values in a side panel and copy the final result to clipboard.
- **Auto-save** — Changes are saved automatically with debounced writes and change detection.
- **Search** — Instant case-insensitive search across prompt titles and bodies.
- **Theming** — Light, dark, and system-follow modes with oklch color space.
- **Onboarding wizard** — First-run setup for language, storage directory, theme, and font size.
- **i18n** — English and Korean. Type-safe translations with `{{variable}}` interpolation.
- **Keyboard shortcuts** — `Cmd+N` new prompt, `Cmd+Shift+N` new topic.

## Data Model

The filesystem is the database. <br />
On first launch, the onboarding wizard lets you choose where to store your prompts:

```
~/PromptPad/               # configurable prompt directory
└── Topic/
    └── my-prompt1.md
    └── my-prompt2.md
```

Each prompt file:

```markdown
---
title: Code Review
created: 2025-01-15T10:00:00.000Z
updated: 2025-01-15T10:30:00.000Z
tags: []
---

Review the following {{language}} code for bugs and improvements:

{{code}}
```

Settings persist via Tauri Store at `~/.PromptPad/settings.json`.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Install

```bash
git clone https://github.com/tkhwang/prompt-pad.git
cd prompt-pad
pnpm install
```

### Development

```bash
# Monorepo
pnpm dev              # All packages in dev mode (Turborepo)

# Desktop
pnpm dev:desktop      # Vite dev server only (localhost:1420)
pnpm tauri:dev        # Full Tauri desktop app with hot reload

# Backend
pnpm dev:backend      # NestJS watch mode (localhost:3000)
```

### Build

```bash
# Monorepo
pnpm build            # Build all packages (shared → desktop + backend)

# Desktop
pnpm build:desktop    # tsc + Vite bundle
pnpm tauri:build      # Production desktop binary

# Backend
pnpm build:backend    # nest build
```

### Lint & Format

```bash
pnpm check            # Biome lint + format (auto-fix) across all packages
```

### Release

```bash
pnpm release          # Interactive: pick version → update files → commit → tag → push
pnpm release patch    # 0.1.0 → 0.1.1
pnpm release minor    # 0.1.0 → 0.2.0
pnpm release major    # 0.1.0 → 1.0.0
```

Updates version across all `package.json`, `Cargo.toml`, and `tauri.conf.json` in one step. Pushing a `v*` tag triggers the macOS build workflow.

## Tech Stack

| Layer         | Technology                                                |
| ------------- | --------------------------------------------------------- |
| Monorepo      | pnpm workspaces, Turborepo 2                              |
| Frontend      | React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui |
| Desktop       | Tauri 2 (Rust)                                            |
| Backend       | NestJS 11, TypeScript (strict)                            |
| Shared        | TypeScript types (`@prompt-pad/shared`)                   |
| Tauri Plugins | fs, dialog, clipboard-manager, store                      |
| Linting       | Biome                                                     |
| Icons         | lucide-react                                              |
