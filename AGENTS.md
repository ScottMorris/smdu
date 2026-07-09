# AGENTS.md

## Coding Standards

- **Spelling:** Must use Canadian Spelling for things that don't require American spelling (e.g., UI strings, variables, comments). Examples: "colour", "center" -> "centre", "behavior" -> "behaviour".
- **Commit Messages:** Use Conventional Commits (e.g., `feat: add scanner`, `fix: typo in header`).

## Commit Messages

**Format:** Use Conventional Commits format (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`).

- Use `test:` for test-related changes, including fixes to tests themselves (do not use `fix:` unless it fixes application code).

**Body Requirements:**

- Explain what and why (not how)
- Use markdown: **bold**, _italics_, `code`, bullet lists
- **NO markdown headings** - use **bold labels** for sections (not always required)
- When a commit body includes backticked code in shell commands, avoid command substitution by using single-quoted `-m` strings (preferred) or escaping backticks.
  - Example (preferred): `git commit -m 'fix: ...' -m 'Use `scanStatus` in footer'`
  - Example (escape): `git commit -m "Use \`scanStatus\` in footer"`

**Specific Updates**: Each commit message should reflect the specific changes made in that commit. Do not just recap the entire project history or scope. Focus on the now.

**Shell Interpolation Safety:**

- Do not pass markdown-heavy commit bodies directly via `git commit -m "..."` when they include backticks, `$()`, or shell-sensitive characters.
- Prefer writing the message to a file with a single-quoted heredoc and commit with `git commit -F <file>` to prevent shell expansion.
- If using `-m`, escape shell-sensitive characters explicitly before running the command.
- After committing, verify the stored message with `git log -1 --pretty=fuller` and amend immediately if interpolation altered content.

## Pull Request Titles

**Requirement:** PR titles must be human-readable summaries of the PR change.

- Start with a capital letter.
- Do not use Conventional Commit prefixes in PR titles (for example, no `feat:`, `fix:`, `chore:`).
- Describe the outcome or behaviour change, not internal process language.
- Ignore internal planning document notes in PR titles and descriptions unless they directly map to repository changes.
- Keep title style consistent across every open PR in the same stack.
- If one title in a stack is updated, update the rest of the open stack titles to match style and scope.
- Do not rename merged PRs unless explicitly requested.
- Keep linked issues and merge order aligned after any title changes in a stack.

## Pull Request Content

**Requirement:** PR titles and descriptions must not mention internal workflow artefacts.

- Do not mention deferred-review documents, internal queue labels, or internal-only planning notes in outward PR content.
- Keep internal triage mechanics in local runbooks, internal labels, and agent workflows only.
- Use user-facing, outcome-focused language in PR titles and descriptions.
- Only include internal process details in PR content when explicitly requested by the user.
- Open pull requests ready for review by default. Only create a draft PR when the user explicitly asks for a draft or when there is a clearly communicated blocker that makes draft status necessary.

**PR Description Format:**

- Prefer a compact markdown structure with `## Summary` and `## Test plan`.
- Under `## Summary`, use `###` sub-sections when they help group the change cleanly (for example, `### User-facing changes`, `### Packaging`, `### Documentation`).
- Under each summary section, use flat bullets with bold lead-ins for scanability.
- Keep the summary focused on outcomes and behaviour changes, not commit history or implementation chronology.
- Under `## Test plan`, use checklist bullets (`- [x]` / `- [ ]`) with concrete commands, validations, or explicit gaps. If something could not be verified, state that plainly.

## Pull Request Labels

**Requirement:** Every PR must include labels that describe the change and map to release-note categories.

- Add at least one primary category label to every PR: `enhancement`, `bug`, `documentation`, `testing`, `ci`, `build`, or `chore`.
- Prefer the broader Liminal HQ label style over Conventional Commit terms for PR labelling — use `enhancement`/`bug` rather than aliases like `feat`, `feature`, `fix`, `bugfix`, `docs`, or `test`.
- Add additional scope labels where helpful (for example, `release`, `ui`, `scanner`, `cli`, `infrastructure`, `internal`).
- Use `skip-changelog` only when a change should be excluded from generated release notes.
- Keep labels accurate as scope changes during review.

## Pull Request Review Comments

**Requirement:** When working on feedback in a PR, reply on the review threads after updates are applied.

- Post a brief follow-up comment on each addressed thread summarising what changed.
- If a suggestion is not applied, explain why in-thread with concise reasoning.
- Resolve threads (or request reviewer confirmation) only after commenting.

## Git Workflow

**Requirement:** Do not push changes (especially force pushes) to the repository unless explicitly requested by the user.

- Do not squash-merge PRs unless the user explicitly requests squash for that PR.
- **GitHub tooling:** Prefer the `gh` CLI for repository, pull request, label, review, and GitHub Actions work.

## Release Workflow

**Requirement:** Follow this workflow for every patch/minor/major release prep.

- Determine the next release version from existing tags and published releases before preparing changes (for example, if `v0.0.3` exists, the next patch is `v0.0.4`).
- Create a dedicated release prep branch using `chore/release-v<version>` naming (for example, `chore/release-v0.0.4`).
- Keep release metadata aligned:
  - update `package.json` `version`
  - ensure `man/smdu.1` version/date stays in sync with every release
  - add/update `docs/releases/v<version>.md`
  - keep `docs/readme.md` release links current
- Use release-note structure consistent with existing files in `docs/releases/`:
  - include clear sections (for example: What’s New, UX Highlights, Fixes and Reliability, Quality)
  - use `-` bullet markers for list items
- Validate release prep changes before opening a PR:
  - run `pnpm test`
  - run `pnpm build`
- Open a PR with:
  - a human-readable title (no Conventional Commit prefix)
  - release-note category label(s) (`documentation`, `chore`, `bug`, `enhancement`, etc.) plus `release` scope label when relevant
- After merge, publish via an **annotated** Git tag that matches the release workflow trigger (`v*`) in `.github/workflows/release.yml`.
- When creating the release tag message, include a concise summary derived from `docs/releases/v<version>.md` so the tag history preserves release context.
- Do not push release branches or tags unless explicitly requested by the user.

## Testing

- **Mandatory Testing:** Make sure the unit tests are run after changes to the code.
- **Verification:** Always verify code changes by running relevant tests. If verification is incomplete or blocked, say so plainly rather than implying it passed.
- **Build Check:** Run `pnpm build` to surface any TypeScript errors.
- **Format Check:** Run `pnpm format:check` before opening or updating a PR, and run `pnpm format` if any files fail formatting.

## Documentation

- **Updates:** When user-facing behaviour, CLI options, or features change, update `README.md` and `SPEC.md`.
- **Man Page:** Ensure `man/smdu.1` is kept in sync with CLI options and features.

## Project Structure

- This is a TypeScript project using Ink for the CLI UI.
- Use `pnpm` as the package manager.

## Licence and Copyright

- **Requirement:** New source files (and substantially rewritten source files) should include a short header as the first content in the file.
- **Applies to:** `.ts`, `.tsx`, `.js` source files in `src/` and `tests/` (and scripts where appropriate).
- **Do not add headers to:** generated files, lockfiles, config files (`.json`, `.yml`, etc.), markdown docs, or man pages.
- When visiting an existing file that lacks a header, add one as part of the current change.

Preferred header format for TypeScript/JavaScript:

```ts
// Brief one-line summary of what this file does
//
// (c) Copyright 2026 Liminal HQ, Scott Morris
// SPDX-License-Identifier: MIT
```

- Keep the summary to one concise sentence.
- Place the header before `import` statements.
- Leave one blank line between the header and the first code line.
- Preserve existing valid licence headers when already present.

## Penpot MCP Usage

- **Colours:** Use the `fillColor` property with Hex strings for fills. The API does not reliably support RGB objects or plain `fill` string shorthand.
  - Correct: `shape.fills = [{ fillColor: "#ff0000", fillOpacity: 1 }]`
  - Incorrect: `shape.fills = [{ fill: { r:1, g:0, b:0, a:1 } }]`
- **Text:** Always specify font family (e.g., "Roboto Mono") and ensure `text.fills` uses the `fillColor` pattern.
- **Shapes:** Create shapes using `penpot.createRectangle()`, set `x`, `y`, and use `.resize(w, h)` for dimensions.
- **Strokes:** Use `strokeColor` in the strokes array: `shape.strokes = [{ strokeColor: "#ffffff", strokeWidth: 1 }]`
