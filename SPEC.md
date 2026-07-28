# SMDU (See My Disk Usage) Specification

## Overview

SMDU is a TUI disk usage analyser inspired by `ncdu`. It is built with TypeScript, React, and Ink.

## Installation Path Conventions (Canonical)

The following install paths are the canonical defaults for supported platform families. Packaging work must align to these paths unless a platform package manager enforces a different location.

| Platform | Binary path                                                                                      | Man page path                                                                             | Uninstall baseline                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Linux    | `/usr/local/bin/smdu` (or distro-managed `/usr/bin/smdu`)                                        | `/usr/local/share/man/man1/smdu.1.gz` (or distro-managed `/usr/share/man/man1/smdu.1.gz`) | Remove package or remove binary and man page from the same prefix.                                                 |
| macOS    | `/opt/homebrew/bin/smdu` (Apple Silicon) or `/usr/local/bin/smdu` (Intel)                        | `/opt/homebrew/share/man/man1/smdu.1` or `/usr/local/share/man/man1/smdu.1`               | `brew uninstall smdu` (or remove binary and man page from the same prefix).                                        |
| Windows  | `%LOCALAPPDATA%\\Programs\\smdu\\smdu.exe` (installer adds install directory to per-user `PATH`) | Not supported. Use `smdu --help`.                                                         | Uninstall from Windows Settings (Installed apps) or `msiexec /x`, then remove the install directory if it remains. |

Platform-specific exceptions must be documented in `README.md` and linked to the package method that requires them.

Linux release packaging must produce both `.deb` and `.rpm` artefacts and place files in distro-managed paths (`/usr/bin/smdu`, `/usr/share/man/man1/smdu.1.gz`) unless a platform policy requires an override.
macOS release packaging must produce architecture-specific `.tar.gz` archives that include both the `smdu` binary and `smdu.1.gz` for Homebrew formula installation.
Windows release packaging must produce MSI installer artefacts for supported architectures and ensure installs add `%LOCALAPPDATA%\\Programs\\smdu` to the per-user `PATH`.

## Features

- **Directory Scanning:** Recursively scans directories to calculate file sizes.
- **Multi-Path Scanning:** Accepts multiple path arguments (`smdu /var/log /var/cache`) and combines them under a single virtual root labelled with their basenames, so unrelated directories can be compared in one session.
- **Visual Interface:** Displays a file tree with size bars and percentages.
- **Navigation:** Navigate through directories using arrow keys (Up/Down to move, Right/Enter to enter, Left/Backspace to go up).
- **Sorting:** Sort files by name or size.
- **View Modes:** Toggle between flat (ncdu-style, default), tree, and review. List mode (name-only entries) is planned but currently disabled.
- **Review Mode:** Analysis-first view for ranked and grouped descendants under the current root, with presets and filter controls.
- **Help Modal:** Display keybindings with `?`.
- **Information Panel:** Display details for the selected item with `i`.
- **Deletion:** Delete files or directories with a confirmation modal.
- **Focus Timer:** Start a 5/10/15/30 minute timer with session stats and completion alert.
- **Theming:** Support for multiple colour themes (Default, Classic, Dracula) with a sleek default palette.
- **File Type Colours:** Colour-coded file entries by category with an optional legend toggle, including dedicated `Text`, `Scripts`, `Executables/Libraries`, `Archives`, and `Disk Images` categories.
- **Heatmap Bars:** Green-to-red heatmap colours for size bars with `H` (default on).
- **Status Panel:** Toggle a right-side panel with `p` for sort/view/flag state.
- **Status Panel Properties:** Shows selected-file size impact, permissions, and created/modified metadata with refresh feedback.
- **Hidden Files:** Toggle dotfiles with `.` (global in flat/tree; review-local in Review mode). Windows hidden attributes are not detected.
- **Settings:** Persistent configuration for themes, units, file type colours, heatmap colours, and hidden files.
- **Settings:** Heatmap colours can be toggled for size bars.
- **Fullscreen:** Uses the alternate screen buffer by default; `--no-fullscreen` opts out.
- **Adaptive Layout:** Column widths and the graph adjust to terminal size.
- **Feedback:** Footer shows totals and units; live scan feedback shows the current path and counts.
- **Incremental Results:** File list refreshes as directories finish, with a partial scan indicator and live scan stats above the footer.

## Architecture

### Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js (development/runtime), Bun (standalone executable build)
- **UI Framework:** Ink (React for CLI)
- **State Management:** React Hooks / Internal State
- **Testing:** Jest, Ink Testing Library
- **Distribution Build:** `bun build --compile --format esm` for a single-file executable

### Modules

1.  **Scanner (`src/scanner.ts`)**
    - Function `scanDirectory(path: string, parent?: FileNode, onProgress?: ScanProgressCallback, progress?: ScanProgress, signal?: AbortSignal, onPartial?: ScanPartialCallback): Promise<FileNode>`
    - Returns a tree structure:
      ```typescript
      interface FileNode {
      	name: string;
      	path: string;
      	size: number;
      	isDirectory: boolean;
      	isHidden: boolean;
      	children?: FileNode[];
      	parent?: FileNode; // Optional, helpful for navigation
      }
      ```
    - Scan feedback:
      ```typescript
      interface ScanProgress {
      	currentPath: string;
      	directories: number;
      	files: number;
      	bytes: number;
      	errors: number;
      }
      ```
    - Partial scan updates:
      ```typescript
      type ScanPartialCallback = (root: FileNode) => void;
      ```

2.  **State Management (`src/state.ts` or Hooks)**
    - `useFileSystem`: Manages the current directory node and full tree.
    - `useSelection`: Manages cursor position in browse and review lists.
    - `useSort`: Manages sort order for browse mode.
    - `useReviewState`: Derived review dataset, filters, grouping, per-root Review state, and cross-view open behaviour.

3.  **UI Components (`src/components/`)**
    - `App`: Main container.
    - `Header`: Displays current path and version label.
    - `FileList`: Renders flat/tree file listings.
      - Calculates bars relative to the largest item in the directory.
    - `ReviewToolbar`: Displays active Review preset/scope/sort/group and filter summary.
    - `ReviewList`: Renders grouped review rows with table-style columns.
    - `ReviewFiltersModal`: Displays Review filter state and quick controls.
    - `Footer`: Shows key hints and total size.
    - `ConfirmDelete`: Modal for deletion.
    - `InfoModal`: Modal for file and directory details.
    - `Settings`: Screen for selecting themes.
    - `TimerStatus`: Shows focus timer countdown and session stats.

4.  **Configuration (`src/config.ts`)**
    - Uses `conf` to store settings (theme, units, file type colours, heatmap, hidden files).

5.  **Theming (`src/themes.ts`)**
    - Interface `Theme` with properties for `text`, `highlight`, `bar`, `background`.
    - Context provider to supply the theme to components.

## UI/UX

- **Header:** `/home/user/projects/smdu` with a subtle divider and right-aligned `smdu v<version>` label.
- **Status Panel:** Right-side panel shows sort/view/units/hidden/heatmap/legend state in the header and selected-file properties in the body (directory/file counts, size impact, permission bits, timestamps).
- **Footer:** Shows totals with a partial scan indicator while scanning.
- **Scan Status:** Displays live progress above the footer while scanning.
- **Timer:** `T` starts a focus timer and shows a countdown or completion message above the footer, with a bell on completion.
- **Timer Controls:** `t` toggles the timer display (even when idle), `c` cancels the timer.
- **Help:** `?` opens the keybinding modal.
- **Info Panel:** `i` opens the information panel for the selected item, including symlink destination details and unresolved-link state.
- **Scan:** `q` cancels the scan and exits.
- **List:**
  - `[--#-------]  80%  src/` (Selected item highlighted)
  - `[----------]  20%  package.json`
  - Tree mode indents nested items.
  - Flat mode shows full relative paths (ncdu-style).
  - Review mode shows ranked rows (path, size, age, type, percent, count) and optional group rows.
- **Legend:** `L` toggles the file type legend in the list header.
- **Heatmap:** `H` toggles heatmap colours for size bars.
- **Status Panel:** `p` toggles the right-side status panel.
- **Type Cues:** Directories and symbolic links use dedicated browser colours when file type colours are enabled.
- **Hidden Files:** `.` toggles dotfiles (global in flat/tree, review-local in Review mode).
- **Review Controls:** `f` filters modal, `m` preset cycle, `g` group cycle, `G` group collapse/expand, `u` scope cycle, `z` minimum size cycle, `a` age-bucket cycle, `M` media-only toggle, `o`/`O` cross-view open, `x` reset filters.
- **Footer:** `Total: 101.21 MiB (15 items) | Scan: Partial` with mode-specific hints.

## Theming

- **Default:** Sleek charcoal palette with muted dividers and green bars.
- **Classic:** Original terminal colours with bright accents.
- **Dracula:** Purple/Pink accents, dark background optimised.

## Testing Strategy

- Unit tests for `scanner` logic (mocking `fs`).
- Component tests using `ink-testing-library` to assert output strings.
