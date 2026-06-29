# Tasks — M0-E2 Red Baseline Capture

Execution checklist for [prd-e2-red-baseline-capture.md](prd-e2-red-baseline-capture.md). Driven by
`/df3ndr:process-task-list` (which enforces the backup / confirm / verify / record protocol). This epic
is **read-only / analysis-only**: it captures today's behavior — it does **not** fix anything.

## Relevant Files & Resources

- `…/Milestone-00/Epic-02/prd-e2-red-baseline-capture.md` — the Change Plan this list executes.
- `…/Milestone-00/Epic-02/overview/e2-red-baseline-capture.md` — the epic overview both docs expand.
- `…/deployinclude-exclude-fix-architecture.md` — the oracle; selectors `0xdc38f9ab` / `0x7f0c610c` and the truth table.
- `test/deployment/SelectorRegistration.test.ts` — pure unit suite (read-only; **not edited**).
- `test/deployment/DeployIncludeExclude.test.ts` — on-chain integration + E2E suite (read-only; **not edited**).
- `diamonds/ExampleDiamond/examplediamond-include.config.json` / `examplediamond-exclude.config.json` — the two fixtures exercised (read-only).
- `test-assets/test-diamonds/{invalid-include,invalid-exclude,include-and-exclude}.config.json` — edge fixtures the suite references (read-only).
- **Create:** `…/Milestone-00/red-baseline.md` — the baseline artifact (per-test results + routing readings + repro).
- **Create:** `…/Milestone-00/red-baseline.raw.log` — trimmed raw run log of record.
- **Create/append:** `…/Milestone-00/Epic-02/CHANGELOG.md` — epic change log.
- Throwaway (uncommitted): `…/scratchpad/*.log`, `…/scratchpad/capture-routing.ts` — scratch capture only.

### Notes

- **Read-only epic** — no source/test/schema/fixture edits. The only committed writes are the artifact, the raw log, and the CHANGELOG.
- **No destructive backup needed** (nothing is mutated); the "safeguard" is confirming a clean tree and recording the exact pre-state (SHAs, versions) for reproducibility.
- Validation commands are read-only: a suite run + DiamondLoupe queries. Each check lists its exact command.
- The E2E describe-block sets `writeDeployedDiamondData: true` and deletes the record in `after()`; records are gitignored regardless — confirm none is left staged.
- **Do not fix any failure here**, even an obvious one — corrections belong to M2/M3 against the frozen oracle. A failure (incl. a compile failure) **is** a valid baseline finding.

## Tasks

- [x] 0.0 Prepare & safeguard (read-only epic — light safeguard)
  - [x] 0.1 ~~Create branch~~ → **stayed on current branches by choice**: read-only epic writes only untracked artifact files; artifacts live inside the `packages/diamonds` submodule (on `release/v1.3.3`), so branch/commit handling is deferred to task 6.0 for a user decision.
  - [x] 0.2 Tree state confirmed: submodule `packages/diamonds` otherwise clean (only untracked `project/deployinclude-exclude-fix/`); parent has unrelated in-flight work. Capture adds only untracked files — nothing mutated. No snapshot needed.
  - [x] 0.3 Pre-state recorded: node `v22.22.2`, yarn `4.10.3`, parent HEAD `31876f1` (`feature/epic5-security-scanning-pipeline`), submodule `release/v1.3.3` @ `dd4ddf9` (5b2f7af workaround present).
- [x] 1.0 Freshen build artifacts so failures reflect the bug, not stale types
  - [x] 1.1 `yarn compile` ran (hardhat compile + `diamond:generate-abi-typechain`), exit 0.
  - [x] 1.2 `diamond-abi/` + `diamond-typechain-types/` regenerated without error (ExampleDiamond.ts + factories) in ~4.1s. No compile failure.
- [x] 2.0 Run & capture both suites
  - [x] 2.1 Unit suite ran → **6/6 passing** (selector calc + config parse; bug-independent). Log: `$SCRATCH/selectorreg.log`.
  - [x] 2.2 Integration/E2E suite ran → **17/17 passing, 0 failing**. Log: `$SCRATCH/deployincexc.log`.
  - [x] 2.3 Outcomes transcribed (see logs). **Discrepancy:** both named suites are GREEN in isolation, contradicting the reported "failing tests on `yarn test`".
  - [x] 2.4 Include **E2E** tests **pass today** — under the include config, `0x7f0c610c`→ExampleTestDeployInclude and `0xdc38f9ab`→ExampleTestDeployExclude resolve correctly (the `5b2f7af` Replace makes this symmetric fixture's end-state correct).
  - [x] 2.5 **(newly discovered)** Ran all 3 `test/deployment/` files together → **29/29 passing**. Interaction within the deployment dir ruled out. Launched full `yarn test` (bg id `bnryzymsg`, log `$SCRATCH/full-yarn-test.log`) to locate the actual reported failures.
  - [x] 2.6 **Full `yarn test` → 189 passing, 69 pending, 0 FAILING** (exit 0, ~2m). Log errors are expected (OZDefender `test_api_key`, DiamondMonitor mock-event handlers). **No local edits** to `test/` or fixtures (committed state). Fixtures are **single-sided** (include: `deployInclude` only @ line 49; exclude: `deployExclude` only @ line 41) and still pass.

> ⛔ **BASELINE FINDING — PREMISE CONTRADICTED (execution paused at task 3.0).**
> At the current checkout (`packages/diamonds` @ `dd4ddf9`, `release/v1.3.3`, with the `5b2f7af` fix) the
> **full suite is GREEN** and the **single-sided** include/exclude fixtures resolve **correctly**:
> - **exclude config:** `0xdc38f9ab` is **absent** (never registered — correct per INV-6); `0x7f0c610c` → `ExampleTestDeployExclude`.
> - **include config:** `0x7f0c610c` → `ExampleTestDeployInclude` (override works via registry overwrite — lower-priority include facet is processed last and overwrites the higher facet's `Add`); `0xdc38f9ab` → `ExampleTestDeployExclude`.
>
> This contradicts the project premise ("failing tests" + "requires both sides"). The `release/v1.3.3`
> fixes appear to already make **fresh-deploy** single-sided include/exclude work. What remains genuinely
> open (independent of the red premise): **INV-3 additivity is untested** (fixtures net to 1 selector either
> way), **upgrade/redeploy-path robustness** is unexercised (the `5b2f7af` branch targets the
> `Deployed`/different-address case, which no current test hits), and the inverted/dead `higherPrioritySplit`
> code remains.
>
> **Reconciled 2026-06-27:** owner chose **reframe to design-hardening**. Plan + oracle updated
> (M2→additivity, M3→upgrade-path/dead-code). M0-E2 **complete** — green baseline, not red. The genuine
> RED states (additivity, upgrade-path) are authored as failing tests in **M1/M3**, not here.
- [x] 3.0 Capture runtime routing & characterize the workaround
  - [x] 3.1 Routing captured (from passing E2E assertions + code trace; throwaway script unnecessary). See `Milestone-00/baseline.md`.
  - [x] 3.2 Routing table built: exclude config → `0xdc38f9ab` **absent**, `0x7f0c610c`→Exclude; include config → `0x7f0c610c`→Include, `0xdc38f9ab`→Exclude. Diverges from oracle only in the **untested** additivity/upgrade cases.
  - [x] 3.3 `5b2f7af` characterized as **upgrade/redeploy-path-only** (fires on `Deployed`/different-address; no current test hits it).
  - [x] 3.4 No deployment record left staged (E2E `after()` cleans it; gitignored regardless).
- [x] 4.0 Write the baseline artifact
  - [x] 4.1 Wrote [`Milestone-00/baseline.md`](../baseline.md) (renamed from `red-baseline.md` — state is green): per-`it()` results, routing table, `5b2f7af` characterization, reproduction block, and the genuine-gaps list.
  - [x] 4.2 Raw logs of record retained in session scratchpad (`$SCRATCH/*.log`); full log is noisy (4091 lines) — summary table in `baseline.md` is the artifact of record.
- [x] 5.0 Validate the capture
  - [x] 5.1 `baseline.md` covers all `it()`s (6 + 17) + routing for both selectors under both configs.
  - [x] 5.2 Reproducible: `test/deployment` files re-run green (29/29); full suite 189/0.
  - [x] 5.3 Zero source/test/schema/fixture changes — only new artifacts (`baseline.md`, CHANGELOG) + planning-doc reframe (oracle, plan, this task list).
- [x] 6.0 Record the change
  - [x] 6.1 Appended to [`CHANGELOG.md`](CHANGELOG.md): green baseline + premise correction + reframe.
  - [x] 6.2 Baseline handed to M0-E3 (audit) and M0-E1 (ratification); it is the regression reference for M4.
  - [x] 6.3 Project memory `deployinclude-exclude-fix-project` updated with the corrected understanding (green at HEAD; real gaps = additivity + upgrade-path).
