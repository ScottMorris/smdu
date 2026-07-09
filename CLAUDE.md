# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

SMDU ("See My Disk Usage") is a terminal disk usage analyser inspired by `ncdu`, built with TypeScript, React 19, and Ink 6. See `AGENTS.md` for the full contributor conventions (commit/PR rules, release workflow) — the essentials are summarised below.

## Commands

Uses `pnpm` as the package manager.

```bash
pnpm build              # tsc → dist/ (also the TypeScript error check)
pnpm watch              # tsc in watch mode
pnpm start -- <path>    # run node dist/cli.js (requires a build)
pnpm test               # run all Jest tests
pnpm test tests/state.test.ts        # run a single test file
pnpm test -- -t "pattern"            # run tests matching a name
pnpm lint               # eslint
pnpm format:check       # prettier check (run before opening/updating a PR)
pnpm format             # prettier write
pnpm build:binary       # standalone executable via Bun (requires Bun)
```

Tests use Jest with the ts-jest ESM preset (`--experimental-vm-modules`); test files live in `tests/` as `*.test.ts(x)`. Ink components are tested with a forked `ink-testing-library`.

After code changes: run `pnpm test` and `pnpm build`. Both are mandatory per `AGENTS.md`.

## Architecture

The project is an ESM package (`"type": "module"`): relative imports in `src/` use `.js` extensions even for `.ts`/`.tsx` files.

Data flow: `cli.tsx` (commander arg parsing, alternate-screen-buffer setup, SIGTSTP/SIGCONT handling) renders `App.tsx`, which owns the scan lifecycle and all overlay/modal state, dispatching to presentational components.

- **`src/App.tsx`** (~1000 lines) — central orchestrator. Runs the scan, wires keybindings via `useInput`, manages themes/config/units, tracks terminal dimensions, and coordinates every modal (help, info, settings, delete confirmation, review filters) plus the status panel and focus timer.
- **`src/scanner.ts`** — async recursive filesystem scan producing a `FileNode` tree (parent links, `isVirtualRoot` when scanning multiple paths). Has its own inline `p-limit` for concurrency, progress + partial-result callbacks (incremental UI updates), and cancellation via `ScanCancelledError`.
- **`src/state.ts`** — `useFileSystem` hook: navigation (`findNodeByPath`), selection, sorting, view mode (`flat` | `tree` | `review`), and per-root review state.
- **`src/review/`** — Review mode logic as pure functions, composed as a pipeline: `derive` → `filter` → `sort` → `group` → `rows`, with `presets`, `defaults`, and `types`. This is the most unit-tested area (`tests/review.*.test.ts`).
- **`src/keys.ts`** — declarative `ACTIONS` map (key/input bindings) checked with `checkInput`; add new keybindings here, not inline in components.
- **`src/components/`** — presentational Ink components (FileList, ReviewList, StatusPanel, modals, etc.).
- **`src/config.ts`** — persistent user settings via `conf` (theme, units, file type colours, heatmap, hidden files).
- **`src/themes.ts`** / **`src/fileTypeColours.ts`** — colour palettes and file-category colour mapping.

## Conventions (from AGENTS.md)

- **Canadian spelling** in UI strings, variables, and comments ("colour", "centre", "behaviour").
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:` — use `test:` for test-only changes, even fixes to tests). PR titles are human-readable, with **no** Conventional Commit prefix, and every PR needs at least one release-note category label.
- **Licence headers**: new or substantially rewritten `.ts`/`.tsx`/`.js` files in `src/` and `tests/` start with a one-line summary comment followed by `(c) Copyright 2026 Liminal HQ, Scott Morris` and `SPDX-License-Identifier: MIT` (see existing files for the exact format). Do not add headers to config files, docs, or generated output.
- **Docs sync**: user-facing behaviour, CLI options, or feature changes must be reflected in `README.md`, `SPEC.md`, and `man/smdu.1`.
- **Git**: never push (especially force-push) unless explicitly asked; no squash merges unless requested.
- **Releases**: follow the release workflow in `AGENTS.md` (branch `chore/release-v<version>`, sync `package.json`/`man/smdu.1`/`docs/releases/`, annotated `v*` tags).
