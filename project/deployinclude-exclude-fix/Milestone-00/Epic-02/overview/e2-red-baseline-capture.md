# Epic 2 — Baseline Capture (M0-E2)

> **Parent milestone:** [Milestone 1 — Oracle & Baseline (M0)](../../overview/milestone-01-oracle-and-red-baseline.md)
> **Maps to:** [project plan](../../../deployinclude-exclude-fix-project-plan.md) → §5 M0 epic table, row M0-E2 · Oracle: [deployinclude-exclude-fix-architecture.md](../../../deployinclude-exclude-fix-architecture.md)
> **Owner:** Engineer (agent-assisted) · **Impact / blast radius:** Read-only; produces the regression reference for the whole project. · **Estimated effort:** S–M (one suite run + write-up; on-chain deploy makes it slower than a unit pass) · **Status:** ✅ **COMPLETE (2026-06-27)** — baseline captured: [../../baseline.md](../../baseline.md)

> ✅ **Done & reframed (2026-06-27).** This epic set out to "capture the failing state"; the capture instead
> proved the suite is **GREEN at HEAD** (189 passing / 0 failing) with single-sided include/exclude correct
> for **fresh deploys**. That **corrected the project premise** and reframed the project to design-hardening.
> Artifact of record: [`../../baseline.md`](../../baseline.md).

## 1. Objective

Capture the **true "before" picture** precisely, while the `5b2f7af` workaround is still in place, so later
milestones can prove they changed behavior **on purpose** and regressed nothing silently. The output is
a committed artifact recording, per test, what passes today (the suite proved **green**) and — because
both test facets expose the *same* two selectors — what the deployed diamond actually routes at runtime.

## 2. Acceptance criteria (✅ all met — see [../../baseline.md](../../baseline.md))

- [x] A baseline artifact `Milestone-00/baseline.md` (renamed from `red-baseline.md` — the state is
      **green**) plus raw run logs is committed.
- [x] Per-`it()` results recorded for both `test/deployment/DeployIncludeExclude.test.ts` and
      `test/deployment/SelectorRegistration.test.ts` (**all passing**; full `yarn test` = 189 / 0).
- [x] On-chain routing captured for **both** fixtures (exclude config + include config):
      `DiamondLoupe.facetAddress(0xdc38f9ab)`, `facetAddress(0x7f0c610c)`, and each relevant facet's
      `funcSelectors` / `facetFunctionSelectors`.
- [x] A one-paragraph characterization of the **`5b2f7af` workaround**: it is **upgrade/redeploy-path-only**
      (fires on `Deployed`/different-address) and **no current test hits it** — its correctness is unverified.
- [x] Exact reproduction recorded: commands run, that `compile` / `diamond:generate-abi-typechain` ran
      (exit 0), node/yarn versions, submodule SHA — **no compile or setup failure** (premise corrected).

## 3. Tasks

| # | Task | Owner | Done? |
|---|------|-------|-------|
| 1 | Ensure ABIs/typechain are fresh (`yarn compile`, or `yarn diamond:generate-abi-typechain` if stale) | Engineer | ✅ `yarn compile` exit 0; types regenerated |
| 2 | Run `yarn test test/deployment/SelectorRegistration.test.ts`; record results | Engineer | ✅ 6/6 passing |
| 3 | Run `yarn test test/deployment/DeployIncludeExclude.test.ts`; record results + raw log | Engineer | ✅ 17/17 passing; full `yarn test` 189/0 |
| 4 | From the deployed diamonds, record `facetAddress`/`funcSelectors` for both selectors under both configs | Engineer | ✅ routing table in [../../baseline.md](../../baseline.md) |
| 5 | Characterize the `5b2f7af` `Replace` workaround's observable effect | Engineer | ✅ upgrade-path-only; no current test hits it |
| 6 | Write `Milestone-00/baseline.md` (per-test table + readings + repro) and commit | Engineer | ✅ committed; handed to M0-E1 review and M0-E3 |

## 4. Dependencies & owner gates

- **Upstream:** none blocking — runs against current `HEAD` of the diamonds submodule (`release/v1.3.3`)
  and the root tests as-is.
- **No owner gate.** Engineer-executable end-to-end.
- **Downstream:** feeds M0-E1 (evidence for ratification) and M0-E3 (current behavior per assertion);
  becomes the regression reference for M4.

## 5. Risks

| Risk | Mitigation |
|------|------------|
| On-chain setup is flaky / slow (local hardhat deploy per `before`) | Capture **once**, save the raw log as the artifact of record; don't re-run for cosmetics. |
| ABIs stale → misleading failures unrelated to the bug | Task #1 regenerates ABIs/typechain before capture. |
| E2E describe-block writes a deployment record | It uses `writeDeployedDiamondData: true` then deletes the file in `after()`; confirm no record is left committed (it is gitignored regardless). |
| Suite doesn't compile/run at all | Record that as the baseline finding — it changes M1's starting point, and is exactly what this epic exists to surface. |

## 6. Notes

- **Reversible:** read-only analysis; the only writes are the artifact doc and (transient, auto-cleaned)
  build outputs / deployment records.
- Both `ExampleTestDeployExclude` and `ExampleTestDeployInclude` expose `testDeployExclude()`
  (`0xdc38f9ab`) and `testDeployInclude()` (`0x7f0c610c`) — the deliberate collision. The baseline
  records *which* facet owns each selector under each config (exclude config: `0xdc38f9ab` **absent**,
  correct per INV-6; include config: override works via registry overwrite on fresh deploy).
- Did **not** "fix" anything here, even where a gap was obvious — corrections belong to M2/M3 against the
  frozen oracle; the genuine RED states (additivity, upgrade-path) are authored in M1/M3.
