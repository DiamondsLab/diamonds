# Tasks — M2-E2 Disposition → Gate Green

## Relevant Files & Resources

- `prd-e2-disposition-gate-green.md` - The Change Plan this task list executes.
- `overview/e2-disposition-gate-green.md` - The epic overview both docs expand.
- `packages/diamonds/src/cli/diamond-abi-cli.ts` - **Edited**: type the 9 fixable `any`s + annotate the 1 justified `hre`.
- `packages/diamonds/.semgrep.yml` - the `typescript-any-usage` rule (read-only; NOT tuned in mix posture).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - record the semgrep result.
- `packages/diamonds/project/pre-push-security-gates/Milestone-02/Epic-02/CHANGELOG.md` - epic change log.

### Notes

- **Reversible** — rollback is `git checkout packages/diamonds/src/cli/diamond-abi-cli.ts`. No backup beyond git.
- Type-level edits + 1 annotation only; **no runtime behavior change**, no `.semgrep.yml` change.
- Use M0 reliable invocations: `npm run build` / `npx hardhat test` if the yarn runner trips the state bug.
- On branch `chore/pre-push-security-gates`.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch `chore/pre-push-security-gates` (not `main`)
  - [x] 0.2 No snapshot needed — git-reversible; note the rollback command
  - [x] 0.3 Capture pre-change semgrep count (expect 10)
- [x] 1.0 Apply the type fixes + annotation in `src/cli/diamond-abi-cli.ts`
  - [x] 1.1 Lines 348/350/355/359 — type `(f: Fragment)` (import `Fragment` from `ethers`); keep the chain working
  - [x] 1.2 Line 394 — type `result` with the ABI-generator result type (import it, or a minimal local interface with the `.stats` shape)
  - [x] 1.3 Line 474 — type `artifact` as hardhat `Artifact` (import from `hardhat/types`) or minimal `{ abi?: unknown[] }`
  - [x] 1.4 Lines 477/478/479 — type the ABI `item` as `{ type: string }`
  - [x] 1.5 Line 375 — keep `hre: any`; add inline `// nosemgrep: typescript-any-usage -- hre.ethers injected at runtime by hardhat-ethers`
- [x] 2.0 Re-run gate + regression
  - [x] 2.1 `yarn semgrep:scan` (with `--error`) → 0 blocking findings
  - [x] 2.2 `yarn build` (or `npm run build`) → green
  - [x] 2.3 `npm run test:unit` (or `npx hardhat test`) → prior count holds (no regression)
- [x] 3.0 Validate the change
  - [x] 3.1 Confirm `yarn semgrep:scan` exit 0; `git diff --stat` limited to `src/cli/diamond-abi-cli.ts`
  - [x] 3.2 Confirm build + test:unit green
- [x] 4.0 Record the change
  - [x] 4.1 Record the semgrep result (0) + closure in `baseline.md`
  - [x] 4.2 Append to `Milestone-02/Epic-02/CHANGELOG.md`
  - [x] 4.3 Commit `src/cli/diamond-abi-cli.ts` + project docs (exclude pre-existing `yarn.lock`) referencing Task 4.0
