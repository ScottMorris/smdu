# SMDU (See My Disk Usage)

SMDU is a modern, terminal-based disk usage analyser inspired by `ncdu`, built with TypeScript and Ink.

## Features

- **Fast Scanning:** Efficiently scans directories to visualize disk usage.
- **Interactive UI:** Navigate through your file system with ease.
- **Visual Feedback:** Size bars and percentages help identify large files quickly.
- **Theming:** Includes built-in themes (Default, Classic, Dracula) with a sleek default palette.
- **Fullscreen TUI:** Uses the alternate screen buffer by default to keep scrollback intact after exit.
- **Adaptive Layout:** Columns adjust to terminal size and keep totals and units visible.
- **Status Panel:** Right-side panel with sort/view/unit/toggle summary in the header plus selected-file properties (including directory/file counts, size impact, permissions, created/modified timestamps) with freshness updates (toggle with `p`).
- **Live Scan Feedback:** Shows the current scan location with running totals.
- **Incremental Scan Results:** File list updates as directories finish, with a partial scan indicator and live scan stats above the footer.
- **File Type Colours:** Colour-codes files by category (including `Text`, `Scripts`, `Executables/Libraries`, `Disk Images`, and `Archives`) with an optional legend.
- **Heatmap Size Bars:** Green-to-red gradient for size bars (toggle with `H`).
- **Hidden Files Toggle:** Show or hide dotfiles with `.`.
- **Review Mode:** A third analysis-first view for ranked, filterable review of descendants under the current root.
- **Header:** Shows the current path with a subtle divider and a right-aligned `smdu v<version>` label.
- **Planned:** List view (name-only entries).
- **View Modes:** Flat (ncdu-style, default), Tree, and Review.
- **Help Modal:** Press `?` to view keybindings.
- **Information Panel:** Press `i` to view extended details for the selected item, including symlink destination state.
- **Directory/Link Type Cues:** Directories and symbolic links use dedicated colours in the file browser when file type colours are enabled.
- **Focus Timer:** Press `T` to start a 5/10/15/30 minute focus timer with session stats and a completion bell.
- **Cross-Platform:** Works on Linux, macOS, and Windows (best on POSIX).

## Installation

```bash
# Clone the repository
git clone https://github.com/liminal-hq/smdu.git
cd smdu

# Install dependencies
pnpm install

# Build JavaScript output (TypeScript -> dist/*.js)
pnpm build

# Build a standalone executable with Bun
pnpm build:binary

# Link globally (optional)
pnpm link --global
```

`pnpm build:binary` requires Bun to be installed.

### Linux Package Builds (`.deb` / `.rpm`)

Build Linux packages locally (host architecture):

```bash
pnpm build:linux:packages
```

Or build a single package format:

```bash
pnpm build:linux:deb
pnpm build:linux:rpm
```

The packaging script outputs artefacts under `dist/` and installs files to distro-managed paths inside the package:

- binary: `/usr/bin/smdu`
- man page: `/usr/share/man/man1/smdu.1.gz`

### macOS Homebrew Prep Archives (`.tar.gz`)

Build Homebrew-oriented macOS archives locally:

```bash
pnpm build:macos:package:x64
pnpm build:macos:package:arm64
```

Release automation publishes tarball artefacts named `smdu-<tag>-macos-<arch>.tar.gz`. Each archive includes:

- `smdu` (executable)
- `smdu.1.gz` (manual page payload for formula install)

### Windows Installer Builds (`.msi`)

Build a Windows MSI locally:

```bash
pnpm build:windows:installer:x64
pnpm build:windows:installer:arm64
```

Release automation publishes MSI artefacts named `smdu-<tag>-windows-<arch>.msi`. The installer places `smdu.exe` under `%LOCALAPPDATA%\\Programs\\smdu` and appends this directory to the per-user `PATH`.

### Install Path Conventions

Canonical install paths are defined in `SPEC.md` and are summarised here for operators:

| Platform | Binary path                                                               | Man page path                                                               | Notes                                             |
| -------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------- |
| Linux    | `/usr/local/bin/smdu` (or distro-managed `/usr/bin/smdu`)                 | `/usr/local/share/man/man1/smdu.1.gz` (or `/usr/share/man/man1/smdu.1.gz`)  | Package-managed installs may use distro prefixes. |
| macOS    | `/opt/homebrew/bin/smdu` (Apple Silicon) or `/usr/local/bin/smdu` (Intel) | `/opt/homebrew/share/man/man1/smdu.1` or `/usr/local/share/man/man1/smdu.1` | Homebrew prefix determines final path.            |
| Windows  | `%LOCALAPPDATA%\\Programs\\smdu\\smdu.exe`                                | Not supported                                                               | Installer must expose `smdu` on `PATH`.           |

### Uninstall Baseline

- Linux:
  - Debian/Ubuntu packages: `sudo apt remove smdu` (or `sudo dpkg -r smdu`)
  - RPM-based packages: `sudo dnf remove smdu` (or `sudo rpm -e smdu`)
  - manual cleanup fallback: remove both `smdu` and `smdu.1(.gz)` from the same install prefix
- macOS: run `brew uninstall smdu`, or remove both `smdu` and `smdu.1` from the active Homebrew prefix.
- Windows:
  - installer path: uninstall from Windows Settings (Installed apps), or run `msiexec /x smdu-<tag>-windows-<arch>.msi`
  - if leftovers remain, remove `%LOCALAPPDATA%\\Programs\\smdu`
  - open a fresh terminal after install/uninstall to pick up `PATH` changes

## Usage

Run `smdu` in any directory:

```bash
smdu
```

Or specify a path:

```bash
smdu /var/log
```

You can also scan multiple paths at once:

```bash
smdu /var/log /var/cache
```

SMDU combines the given paths under a virtual root (labelled with their names) so you can compare disk usage across unrelated directories in a single session.

### Options

- `--theme <name>`: Choose a theme (default, classic, dracula). This overrides the configuration file.
- `--units <units>`: Display units (iec, si). This overrides the configuration file.
- `--no-fullscreen`: Disable the alternate screen buffer.
- `--help`: Show help.
- `-v, --version`: Show version.

## Configuration

SMDU stores configuration using the system's standard configuration directory (e.g., `~/.config/smdu/config.json` on Linux).

Settings available:

- `theme`: The selected UI theme.
- `units`: The display units (`iec` or `si`).
- `fileTypeColoursEnabled`: Enable file type colours in the list.
- `heatmapEnabled`: Enable heatmap colours for size bars (default on).
- `showHiddenFiles`: Show hidden files by default (dotfiles only; Windows hidden attributes are not detected, default on).

## Keybindings

- **Up / Down / k / j**: Move selection.
- **Right / Enter / l**: Enter directory.
- **Left / Backspace / h**: Go up a directory.
- **d**: Delete selected file/directory.
- **S**: Open Settings.
- **i**: Toggle the information panel for the selected item.
- **n**: Sort by name.
- **s**: Sort by size.
- **C**: Sort by file count.
- **v**: Toggle view mode (flat/tree/review).
- **.**: Toggle hidden files (global in flat/tree, review-local in Review mode).
- **L**: Toggle the file type legend.
- **H**: Toggle heatmap size bars.
- **p**: Toggle the status panel.
- **f**: Open/close Review filters modal (Review mode).
- **m**: Cycle Review presets.
- **g**: Cycle Review grouping.
- **G**: Collapse/expand selected Review group.
- **u**: Cycle Review scope (files/directories/both).
- **z**: Cycle Review minimum size filter.
- **a**: Cycle Review age-bucket filter.
- **M**: Toggle Review media-only filter.
- **o**: Open selected Review item in Flat view.
- **O**: Open selected Review item in Tree view.
- **x**: Reset Review filters.
- **T**: Start a focus timer (cycles 5/10/15/30 minutes).
- **t**: Toggle focus timer display (shows the timer pane even when idle).
- **c**: Cancel the focus timer.
- **R**: Rescan the current directory.
- **?**: Toggle help.
- **q / Esc**: Quit (during scan, cancels).

## Development

To start the project in development mode:

1.  **Install dependencies**:

    ```bash
    pnpm install
    ```

2.  **Start the TypeScript compiler in watch mode** (in a separate terminal):

    ```bash
    pnpm run watch
    ```

3.  **Run the application**:

    ```bash
    pnpm start
    # or to scan a specific directory
    pnpm start -- /path/to/scan
    ```

    Note: `pnpm start` runs `node dist/cli.js`, so you need to have the code built (which `pnpm run watch` does automatically).

4.  **Run tests**:

    ```bash
    pnpm test
    ```

5.  **Build the standalone executable** (optional):
    ```bash
    pnpm build:binary
    ```

## License

MIT
