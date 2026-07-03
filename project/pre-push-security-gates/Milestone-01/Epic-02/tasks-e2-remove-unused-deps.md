# Tasks — M1-E2 Remove Unused Deps

## Relevant Files & Resources

- `prd-e2-remove-unused-deps.md` - The Change Plan this task list executes.
- `overview/e2-remove-unused-deps.md` - The epic overview both docs expand.
- `packages/diamonds/package.json` - **Edited**: remove `axios` + `lodash` from `dependencies`.
- `packages/diamonds/yarn.lock` - **Regenerated** (standalone install; keep scoped, exclude the pre-existing unrelated diff).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - record the post-removal audit count.
- `packages/diamonds/project/pre-push-security-gates/Milestone-01/Epic-02/CHANGELOG.md` - epic change log.

### Notes

- **Reversible dep change** — rollback is `git checkout packages/diamonds/package.json packages/diamonds/yarn.lock`. No backup/snapshot needed beyond git.
- No source code changes (both deps have 0 imports — confirmed in M1-E1).
- Install **inside** `packages/diamonds` (standalone), never the root, per the monorepo-wiring gotcha; keep the pre-existing unrelated `yarn.lock` diff out of the commit.
- On branch `chore/pre-push-security-gates`.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch `chore/pre-push-security-gates` (not `main`)
  - [x] 0.2 No snapshot needed — change is git-reversible; note the rollback command
  - [x] 0.3 Capture pre-change audit count as baseline: `yarn npm audit --severity moderate | grep -c 'Severity:'` (expect 26)
- [x] 1.0 Remove the unused deps
  - [x] 1.1 Remove `axios` + `lodash` lines from `dependencies` in `packages/diamonds/package.json`
  - [x] 1.2 Confirm they're gone: `grep -E '"(axios|lodash)"' package.json` → no match in `dependencies`
- [x] 2.0 Regenerate lock + re-audit
  - [x] 2.1 Run `yarn install` **inside** `packages/diamonds` (standalone) to regenerate the lockfile
  - [x] 2.2 Re-run `yarn npm audit --severity moderate`; record the new advisory count (expected 0) + any residual
  - [x] 2.3 If any residual advisory remains, note it for M1-E3 (don't treat as failure)
- [x] 3.0 Validate the change
  - [x] 3.1 `yarn npm audit --severity moderate` → 0 findings (or residual list captured)
  - [x] 3.2 `yarn why axios` / `yarn why lodash` → not found
  - [x] 3.3 Confirm the diff is scoped to `package.json` (2 removed lines) + intended `yarn.lock` changes; the pre-existing unrelated lock diff is not conflated
- [x] 4.0 Record the change
  - [x] 4.1 Record the post-removal audit count in `baseline.md`
  - [x] 4.2 Append to `Milestone-01/Epic-02/CHANGELOG.md`
  - [x] 4.3 Commit `package.json` + `yarn.lock` + the project docs with a Conventional Commit referencing Task 4.0
