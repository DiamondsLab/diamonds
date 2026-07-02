# Tasks — M3-E1 Upgrade-Scenario Test (PROBE)

Execution checklist for [prd-e1-upgrade-scenario-test.md](prd-e1-upgrade-scenario-test.md). Probe the
adversarial upgrade scenarios; **record red/green**; set M3-E2 scope. Then **CHECKPOINT**.

## Relevant Files & Resources
- **New (submodule):** `packages/diamonds/test/unit/selectorResolutionUpgrade.test.ts`.
- **Under test (read-only):** `src/resolution/selectorResolution.ts` (`resolveFunctionSelectorRegistry`).
- **Append:** `…/Milestone-03/Epic-01/CHANGELOG.md`.

### Notes
- On `feature/resolution-seam`. Submodule test → commit `--no-verify` after recording. Measure, don't assume.

## Tasks
- [x] 0.0 Prepare — on `feature/resolution-seam`.
- [x] 1.0 Authored S-1…S-4 in `test/unit/selectorResolutionUpgrade.test.ts` (seeded `Deployed` registry).
- [x] 2.0 Ran + recorded: **S-1 ✅, S-2 ✅, S-4 ✅; S-3 ❌ RED** (exclude-on-upgrade Remove uses non-zero address — EIP-2535 needs `address(0)` → on-chain revert).
- [x] 3.0 **Findings → M3-E2 scope:** small targeted fix (Exclusion Filter Remove → `zeroAddress`); `5b2f7af` confirmed correct (S-1) + document. **CHECKPOINT.**
- [x] 4.0 CHANGELOG written; probe committed (`--no-verify`); memory updated.

> ✅ **M3-E1 PROBE COMPLETE.** One real bug found (S-3); `5b2f7af` verified correct. M3-E2 is a small fix.
