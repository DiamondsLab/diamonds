# Change Plan (PRD) — M0-E2 Baseline Capture

> **Epic overview:** [e2-red-baseline-capture.md](overview/e2-red-baseline-capture.md) · **Parent milestone:** [Milestone 1 (M0)](../overview/milestone-01-oracle-and-red-baseline.md) · **Project plan:** [deployinclude-exclude-fix-project-plan.md](../../deployinclude-exclude-fix-project-plan.md) · **Oracle:** [architecture](../../deployinclude-exclude-fix-architecture.md)
> **Status:** ✅ **COMPLETE (2026-06-27)** — baseline captured ([../baseline.md](../baseline.md)); premise corrected. · **Owner:** Engineer (agent-assisted) · **Date:** 2026-06-27

> ✅ **Done & reframed.** The capture proved the suite is **GREEN at HEAD** (189 passing / 0 failing) — the
> original "failing tests / requires both sides" premise did **not** reproduce. The change is **DONE**; the
> project was reframed to design-hardening. Artifact: [`../baseline.md`](../baseline.md).

## 1. Overview & Problem
The fix to `deployInclude`/`deployExclude` is TDD-driven, so we recorded the **current** behavior of
the selector-resolution code (with the `5b2f7af` `Replace` workaround in place) **before** changing
anything. Without a written "before" picture we cannot later prove we changed behavior on purpose and
regressed nothing. **Goal:** produce a committed, reproducible baseline of today's test results and the
diamond's actual selector routing under both the include and exclude fixtures. **Outcome:** the baseline
came back **green** for fresh deploys, correcting the premise (see banner above).

## 2. Goals
- Capture per-`it()` pass/fail for both deployment-selector suites against current `HEAD`.
- Capture the **runtime routing truth** today: which facet owns `0xdc38f9ab` and `0x7f0c610c` under each
  config, per `DiamondLoupe`.
- Characterize, in one paragraph, what the `5b2f7af` workaround actually does observably.
- Make it **reproducible** (exact commands, prep steps, versions) so M4 can diff against it.

## 3. Scope — Components & Services
- **Test suites (read-only):** `test/deployment/DeployIncludeExclude.test.ts`,
  `test/deployment/SelectorRegistration.test.ts`.
- **Fixtures exercised:** `diamonds/ExampleDiamond/examplediamond-include.config.json`,
  `diamonds/ExampleDiamond/examplediamond-exclude.config.json`, and the three
  `test-assets/test-diamonds/*include*/*exclude*` edge configs the suite already references.
- **Runtime:** local in-process Hardhat network (the `hardhat` provider; no external chain).
- **Artifact written:** `Milestone-00/baseline.md` (renamed from `red-baseline.md` — state is green) + raw run logs (new files; no source touched).
- **Build outputs (transient):** `typechain-types/`, `diamond-typechain-types/`, `diamond-abi/` if a
  regenerate is needed.

## 4. Stakeholders & Impact
- **Affected:** this project only — the baseline is an internal reference artifact.
- **User-facing / production impact:** none. No deployed contract, no published package, no CI gate is
  changed by this epic.

## 5. Operational Requirements
1. ABIs/TypeChain MUST be current before capture (`yarn compile`, or
   `yarn diamond:generate-abi-typechain` if the Diamond ABI is stale) so failures reflect the bug, not
   stale types.
2. Both suites MUST be run and every `it()` outcome recorded (pass/fail + failure message).
3. For **both** configs, the deployed diamond MUST be queried for `facetAddress(0xdc38f9ab)`,
   `facetAddress(0x7f0c610c)`, and each relevant facet's `facetFunctionSelectors`/`funcSelectors`, and
   the results recorded.
4. The `5b2f7af` workaround's observable effect MUST be characterized (**done:** it is
   **upgrade/redeploy-path-only** — fires on the `Deployed`/different-address case; **no current test
   hits it**, so its correctness is unverified).
5. The artifact MUST record exact reproduction: commands, prep, node/yarn versions, submodule SHA
   (`release/v1.3.3` @ `dd4ddf9`), and any compile/setup failure encountered (**none** — suite green).
6. The capture MUST NOT modify any source, test, schema, or fixture file (analysis only).

## 6. Security & Compliance Considerations
- No secrets, credentials, keys, or production resources are involved; the run is a local Hardhat node.
- The E2E describe-block sets `writeDeployedDiamondData: true` and deletes the record in `after()`;
  deployment records are gitignored regardless — confirm none is left staged. No elevated privileges
  required, so **no human-approval gate** applies to this epic.

## 7. Non-Goals (Out of Scope)
- Fixing any failure, even an obvious one (corrections belong to M2/M3 against the frozen oracle).
- Adding/altering tests or fixtures (M1+).
- Capturing a submodule-unit-test baseline — those tests don't exist yet (created in M1).
- Running the full root suite or Foundry — only the two selector suites are in scope here.

## 8. Risk, Rollback & Recovery
- **Risks:** on-chain `before` setup is slow/occasionally flaky; stale ABIs could mislead.
- **Rollback:** trivial — delete the artifact files; nothing else is touched. **No backup/snapshot
  required** (read-only).
- **Recovery:** if a run is inconsistent, re-run once and keep the raw log of record; do not hand-edit
  results.

## 9. Validation / Success Metrics (✅ met)
- `Milestone-00/baseline.md` exists and is committed, containing: a per-`it()` results table for
  both suites (**all passing**); the runtime routing readings for both selectors under both configs; the
  `5b2f7af` characterization paragraph (upgrade-path-only); and the reproduction block.
- A reviewer can re-run the documented commands and reproduce the recorded **green** set (29/29 in
  `test/deployment`; 189/0 full suite).

## 10. Open Questions (resolved)
- Raw mocha/hardhat log committed verbatim, or linked? → **Resolved:** the full log was noisy (~4091
  lines); the summary table in `baseline.md` is the artifact of record, raw logs retained in scratchpad.
- ~~If the suite fails to **compile** at `HEAD`, that becomes the finding.~~ → **It did not fail.** The
  more consequential finding was the opposite: the suite is **green**, which **corrected the premise** and
  reframed the whole project to design-hardening.
