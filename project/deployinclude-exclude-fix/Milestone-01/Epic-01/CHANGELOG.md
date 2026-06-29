# Changelog — M1-E1 Resolution Seam

## 2026-06-28 — Pure resolution core extracted (behavior-preserving)

- **New:** `src/resolution/selectorResolution.ts` (+ `index.ts` barrel) — a pure, chain-free resolution
  core: `computeFacetSelectors()` (deployExclude removal + deployInclude whitelist) and
  `resolveFunctionSelectorRegistry()` (ownership/cut resolution). Imports `ethers` + `../types` only —
  **no** Hardhat/provider. Carries `priorDeployedState?` on `ResolveRegistryArgs` as the M3 upgrade home.
- **Edited:** `src/strategies/BaseDeploymentStrategy.ts` now **delegates** at both call sites (deploy-time
  filter → `computeFacetSelectors`; `updateFunctionSelectorRegistryTasks` → `resolveFunctionSelectorRegistry`);
  0 inlined resolution logic remains.
- **Strictly behavior-preserving:** the dead `higherPrioritySplit`, the `5b2f7af` `Replace` branch, and the
  deploy-time **whitelist** were relocated **verbatim** (fixes are M2/M3).
- **Parity verified (== M0 baseline):** `build` clean · targeted deployment **29/29** · submodule
  **70 pass / 7 pending / 0 fail** · full root `yarn test` **189 / 69 / 0**.
- **Git:** committed `662a09c` on submodule branch `feature/resolution-seam` (src only — `dist/` is
  gitignored). Used **`--no-verify`**: the submodule pre-commit hook (`lint-staged`, `--max-warnings 0`)
  rejects 55 **warning-only** issues (0 errors), ~52 of which are **pre-existing** in untouched
  `BaseDeploymentStrategy.ts` methods that the original committed code already carries — i.e. the hook does
  not pass on the repo's own committed code. Bypassing was owner-approved. Planning docs (this CHANGELOG,
  the task list, the wider tree) left **uncommitted** per owner preference.
- **Handoff:** M1-E2 unit-tests `src/resolution/`; M3 reviews the `priorDeployedState` shape.
