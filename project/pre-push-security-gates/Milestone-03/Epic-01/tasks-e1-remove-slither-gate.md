# Tasks — M3-E1 Remove Slither Gate + Document

## Relevant Files & Resources

- `prd-e1-remove-slither-gate.md` - The Change Plan this task list executes.
- `overview/e1-remove-slither-gate.md` - The epic overview both docs expand.
- `packages/diamonds/.husky/pre-push` - **Edited**: remove the slither block (~lines 44–49).
- `packages/diamonds/package.json` - **Edited**: drop `yarn slither:scan &&` from `security-check`. KEEP `slither:scan`/`slither:check` scripts.
- `packages/diamonds/slither.config.json` - **Kept** (optional-manual; untouched).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - record the decommission rationale.
- `packages/diamonds/project/pre-push-security-gates/Milestone-03/Epic-01/CHANGELOG.md` - epic change log.

### Notes

- **Reversible** — rollback is `git checkout .husky/pre-push package.json`. No source/runtime change; no backup needed.
- Owner decision: **keep** `slither:scan`/`slither:check` + `slither.config.json` as optional-manual (out of every gate).
- On branch `chore/pre-push-security-gates`.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch `chore/pre-push-security-gates` (not `main`)
  - [x] 0.2 No backup needed — git-reversible; note the rollback command
  - [x] 0.3 Capture pre-change: `grep -n slither .husky/pre-push package.json`
- [x] 1.0 Remove the slither block from `.husky/pre-push`
  - [x] 1.1 Delete the `echo "🐍 …Slither…"` line + the `if ! yarn slither:scan …; then … success=false; fi` block (~44–49), leaving the rest of the hook intact
  - [x] 1.2 Confirm `grep -n slither .husky/pre-push` → nothing
- [x] 2.0 Remove slither from the `security-check` aggregate (keep the scripts)
  - [x] 2.1 Edit `package.json` `security-check`: drop `yarn slither:scan &&`, keeping the other checks + `&&` chain intact
  - [x] 2.2 Confirm `slither:scan` + `slither:check` scripts + `slither.config.json` are still present (kept as manual)
- [x] 3.0 Validate the change
  - [x] 3.1 `grep -rn slither .husky/` → empty; `security-check` no longer contains `slither:scan`
  - [x] 3.2 `slither.config.json` + the two `slither:*` scripts still exist
  - [x] 3.3 Confirm `git diff` limited to `.husky/pre-push` + `package.json`
- [x] 4.0 Document + record + commit
  - [x] 4.1 Write the decommission rationale in `baseline.md` (tooling repo; fixtures; errors in-container; scripts kept manual)
  - [x] 4.2 Append to `Milestone-03/Epic-01/CHANGELOG.md`
  - [x] 4.3 Commit `.husky/pre-push` + `package.json` + project docs (exclude pre-existing `yarn.lock`) referencing Task 4.0
