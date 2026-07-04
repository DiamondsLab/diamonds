# Tasks — M1-E3 Residual + Verify

## Relevant Files & Resources

- `prd-e3-residual-verify.md` - The Change Plan this task list executes.
- `overview/e3-residual-verify.md` - The epic overview both docs expand.
- `packages/diamonds/package.json` + `yarn.lock` - the M1-E2 removal being verified (not edited here).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - record M1 closure.
- `packages/diamonds/project/pre-push-security-gates/Milestone-01/Epic-03/CHANGELOG.md` - epic change log.

### Notes

- **Verification-only epic** — no dependency/source/config change; only doc updates. No backup needed.
- **No residual advisory** (M1-E2 → audit 0), so owner gate **OP-M1-1 does not fire**.
- Use reliable invocations from the M0 harness: `npx hardhat test` if `yarn test` trips the state bug; `npm run build` if `yarn build` does.
- On branch `chore/pre-push-security-gates`.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch `chore/pre-push-security-gates` (not `main`)
  - [x] 0.2 No backup needed (read-only verification) — note explicitly
  - [x] 0.3 Capture `git -C packages/diamonds status --short` baseline
- [x] 1.0 Verify the audit gate + no regression
  - [x] 1.1 `yarn npm audit --severity moderate` → exit 0 / 0 findings (re-confirm)
  - [x] 1.2 `yarn build` (or `npm run build`) → green
  - [x] 1.3 Submodule tests via `npx hardhat test` (or `yarn test:unit`) → prior 51/0 holds
- [x] 2.0 Record M1 closure
  - [x] 2.1 Record the verification results + M1 closure (audit 0, no residual, build+tests green) in `baseline.md`
  - [x] 2.2 Append to `Milestone-01/Epic-03/CHANGELOG.md`
  - [x] 2.3 Commit the project docs (Conventional Commit referencing Task 2.0)
