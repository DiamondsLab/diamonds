# Tasks — M1-E3 Additivity Fixture

Execution checklist for [prd-e3-additivity-fixture.md](prd-e3-additivity-fixture.md). Driven by
`/df3ndr:process-task-list`. **Dev-env ROOT** epic (config + a *skipped* integration test) — completes the
M1 harness milestone. Authored **pending/skip** so root `yarn test` stays green (189/69/0); the skip is
**verified to be a genuine RED at HEAD** before re-skipping. M2 un-skips + greens it.

## Relevant Files & Resources

- `…/Milestone-01/Epic-03/prd-e3-additivity-fixture.md` — the Change Plan this list executes.
- `…/Milestone-01/Epic-03/overview/e3-additivity-fixture.md` — the epic overview.
- `…/deployinclude-exclude-fix-architecture.md` — the oracle (§4.3 Fixture C; selectors `0x7f0c610c` / `0xdc38f9ab`).
- **Create (root):** `diamonds/ExampleDiamond/examplediamond-include-additive.config.json` — the additive fixture.
- **Create (root):** `test/deployment/DeployAdditive.test.ts` — the (skipped) integration test.
- **Copy from / pattern (read-only):** `diamonds/ExampleDiamond/examplediamond-include.config.json`, `test/deployment/DeployIncludeExclude.test.ts`.
- **Reused (read-only):** `contracts/examplediamond/ExampleTestDeployInclude.sol` (exposes both selectors — no new Solidity).
- **Create/append:** `…/Milestone-01/Epic-03/CHANGELOG.md`.
- Memory `deployinclude-exclude-fix-project` — update on completion (M1 complete).

### Notes

- **ROOT repo, not the submodule.** Source/seam work was in `packages/diamonds`; this is dev-env-root
  (`diamonds/…` config + `test/deployment/…`). The root is on `feature/epic5-security-scanning-pipeline`
  with unrelated in-flight work — **confirm the git approach before committing** (branch / current / leave
  uncommitted). The root pre-commit hook may run lint-staged + audit + tests (slow); **`--no-verify` likely
  needed** — confirm at commit time.
- **Pending/skip keeps root green.** The committed test is `it.skip` (TODO(M2)); it adds to **pending**, not
  failing. Root `yarn test` must remain **189/69/0** (→ 189 / 70 pending / 0).
- **Genuine-RED rigor:** a skipped test could silently would-pass. Task 3.0 un-skips once to **confirm it
  FAILS at HEAD**, records it, then re-skips — measure, don't assume.
- **No source/contract changes** — reuse `ExampleTestDeployInclude`; the fix is M2.
- No secrets / privileges / production — no STOP-and-approve steps.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Root is on `feature/epic5-security-scanning-pipeline` (not `main`). The 2 files are new/untracked (reversible, no history impact) — **git-approach decision deferred to 5.0 (commit time)** so the additive work proceeds first.
  - [x] 0.2 Change is additive (2 new files); no backup needed; in-flight root work untouched.
  - [x] 0.3 Baseline: root `yarn test` = **189 / 69 / 0** (established at the M1-E1 parity gate; E2 only added a submodule unit test, no root effect).
- [x] 1.0 Create the additive config
  - [x] 1.1 Created `diamonds/ExampleDiamond/examplediamond-include-additive.config.json` (core facets + `ExampleTestDeployInclude` @60 `deployInclude:["testDeployInclude()"]`; no Exclude facet).
  - [x] 1.2 Valid JSON; `diff` vs include config = **only** the `ExampleTestDeployExclude` block removed.
- [x] 2.0 Create the integration test (skipped)
  - [x] 2.1 Created `test/deployment/DeployAdditive.test.ts` mirroring `DeployIncludeExclude.test.ts` (multichain providers, `LocalDiamondDeployer` + additive config, snapshot/revert). Includes a green sanity test (deploy + own `0x7f0c610c`).
  - [x] 2.2 Additivity assertion authored as **`it.skip`** (TODO(M2)): asserts `ExampleTestDeployInclude` owns BOTH `0x7f0c610c` and `0xdc38f9ab` via `facetAddress` + `facetFunctionSelectors`.
- [x] 3.0 Verify the genuine RED (one-time)
  - [x] 3.1 Un-skipped + ran → **confirmed RED** (config deploys; sanity ✔). `AssertionError: additive (INV-3): testDeployExclude() should also be owned by ExampleTestDeployInclude: expected '0x0000…0000' to equal '0x5FC8…5707'` (`0xdc38f9ab` absent — whitelist dropped it).
  - [x] 3.2 **Re-skipped** (`it.skip`).
- [x] 4.0 Validate
  - [x] 4.1 Config parses; the 3.1 un-skip run deployed a valid diamond (sanity test ✔).
  - [x] 4.2 Full root `yarn test` = **190 passing / 70 pending / 0 failing** (root stays green; skipped additivity → pending, sanity → passing). _(estimate said 189/70; +1 passing because the sanity test passes.)_
  - [x] 4.3 `git status` (root) shows **only** the 2 new files — no source/contract/other-test changes.
- [x] 5.0 Record + commit
  - [x] 5.1 `CHANGELOG.md` written: config + skipped test, verified-RED message, M2 handoff.
  - [x] 5.2 **Left uncommitted (owner choice)** — the 2 root files stay in the working tree; no commit.
  - [x] 5.3 Memory updated: M1-E3 done → **M1 (harness) complete**; both REDs (unit + integration) ready for M2.
  - [x] 5.4 Handoff to M2: un-skip `DeployAdditive.test.ts` + green the M1-E2 unit RED via additive `deployInclude`.

> ✅ **M1-E3 COMPLETE (2026-06-29) — and M1 (harness milestone) COMPLETE.** Additivity integration fixture
> added (root, uncommitted), verified RED at HEAD, skipped so root stays green (190/70/0). M2 greens both REDs.
