# Changelog — M4-E2 Cross-Strategy Regression

## 2026-06-29 — Fix confirmed across strategies; no regression

- **Full regression:** root `yarn test` **190 / 70 / 0**; submodule `test:unit` 51/0 — green.
- **Cross-strategy (the fix reaches all live strategies):**
  - `LocalDeploymentStrategy` — extends `BaseDeploymentStrategy`, **no resolution override** → inherits the
    fix fully. This is the strategy `LocalDiamondDeployer` uses, so the integration tests exercise it directly.
  - `RPCDeploymentStrategy` — overrides `deployFacetsTasks` (for RPC tx), but it stores **all** facet
    selectors (no deploy-time whitelist) and **inherits** `updateFunctionSelectorRegistryTasks` (the fixed
    pure core) → gets the additive + S-3 fixes. **Inheritance-confirmed by analysis; not directly tested**
    (no RPC test network) — a documented minor gap.
  - `OZDefenderDeploymentStrategy` — **deprecated** ([[ozdefender-strategy-deprecated]]); overrides
    `deployFacetsTasks`; out of behavior scope. It **compiles** (in the green build) and its suite passes
    (fails-over on `test_api_key`).
- **hardhat-diamonds `signer` change:** touches only `DiamondAbiGenerator` (ABI generation), **not** the
  selector-resolution path → **not implicated** in include/exclude.
- **Upgrade integration E2E (deferred from M3-E4):** **NOT built** — `LocalDiamondDeployer` has no upgrade
  API (deploy-once) and an in-process deploy→upgrade is high-effort/flaky. **Verification of record:**
  M3-E1's 4-scenario unit probe (S-1…S-4, all green after the S-3 fix) comprehensively covers the upgrade
  resolution. Building a robust E2E remains optional future work.
- **Git:** confirmation only; nothing committed.
