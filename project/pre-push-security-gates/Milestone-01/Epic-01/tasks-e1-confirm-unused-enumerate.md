# Tasks — M1-E1 Confirm Unused + Enumerate

## Relevant Files & Resources

- `prd-e1-confirm-unused-enumerate.md` - The Change Plan this task list executes.
- `overview/e1-confirm-unused-enumerate.md` - The epic overview both docs expand.
- `packages/diamonds/src/**`, `scripts/**`, `test/**` - grepped for axios/lodash usage (read-only).
- `packages/diamonds/package.json` (`exports`), `src/index`/barrel, `hardhat.config.ts`, `tsconfig*.json`, `.mocharc*` - checked for re-export/dynamic usage (read-only).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - **Edited here**: M1 go/no-go + 26-advisory enumeration.
- `packages/diamonds/project/pre-push-security-gates/Milestone-01/Epic-01/CHANGELOG.md` - epic change log.

### Notes

- **Read-only epic** — no source/dep/config changed; only `baseline.md` appended. No backup needed.
- Validation is read-only: `git status` + re-grep.
- On branch `chore/pre-push-security-gates` (from M0). All work in `packages/diamonds/`.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch `chore/pre-push-security-gates` (not `main`)
  - [x] 0.2 No backup required (read-only) — note explicitly
  - [x] 0.3 Capture `git -C packages/diamonds status --short` baseline
- [x] 1.0 Confirm `axios` + `lodash` are unused (widened check)
  - [x] 1.1 Grep imports/`require`/dynamic for both across `src`, `scripts`, `test` (baseline already 0 — re-confirm)
  - [x] 1.2 Check root config files (`hardhat.config.ts`, `tsconfig*.json`, `.mocharc*`) for usage
  - [x] 1.3 Check `src/index`/barrel + `package.json` `exports` for any re-export of axios/lodash
  - [x] 1.4 Record the 0-usage confirmation (or list usages) in `baseline.md`
- [x] 2.0 Enumerate the 26 advisories + go/no-go
  - [x] 2.1 Run `yarn npm audit --severity moderate` (optionally `--json`); map each advisory → package + severity
  - [x] 2.2 For each advisory, determine **direct vs transitive** (path only via the direct axios/lodash, or also via another dep) — use the audit tree (Dependents/Tree Versions)
  - [x] 2.3 Write the table (`advisory id | package | severity | direct/transitive | clears-on-removal?`) + a **go/no-go** verdict + residual list into `baseline.md` (M1 section)
- [x] 3.0 Validate the change
  - [x] 3.1 Confirm the enumeration covers all 26 advisories and the go/no-go verdict is stated
  - [x] 3.2 Confirm `git -C packages/diamonds status --short` shows only `baseline.md` (+ epic docs) — no source/dep/config change
- [x] 4.0 Record the change
  - [x] 4.1 Append the go/no-go + residual summary to `Milestone-01/Epic-01/CHANGELOG.md`
  - [x] 4.2 Commit only the project docs (exclude the pre-existing `yarn.lock`) referencing Task 4.0
