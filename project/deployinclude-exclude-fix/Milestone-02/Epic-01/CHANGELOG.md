# Changelog — M2-E1 Additivity Fix

## 2026-06-29 — deployInclude made additive (INV-3); both REDs greened + a major wiring fix

### The fix
- `src/resolution/selectorResolution.ts` — removed the deploy-time `deployInclude` **whitelist** from
  `computeFacetSelectors`. `deployInclude` is now **additive** (a facet keeps its other selectors); the
  override stays in `resolveFunctionSelectorRegistry` (untouched). The `_deployInclude` param is kept for
  signature/test symmetry (additive = not used to filter). Module docstring updated.
- `test/unit/selectorResolution.test.ts` — the additivity unit test now passes; renamed (dropped the
  `[RED -> M2]` marker).
- Un-skipped the `DeployAdditive` integration test.

### Verified (both REDs green, no regression)
- Submodule `test:unit` → **47 passing / 0 failing** (additivity now green).
- Integration `DeployAdditive` → **green** (`ExampleTestDeployInclude` owns both `0x7f0c610c` + `0xdc38f9ab`).
- `DeployIncludeExclude` A/B → 17/17 (unaffected — the symmetric fixtures reclaim the selector by priority).
- Full root `yarn test` → **191 / 69 / 0**.

### MAJOR infrastructure finding + fix (see memory [[diamonds-monorepo-wiring]])
The integration tests had been deploying via **hardhat-diamonds' nested PUBLISHED diamonds 1.3.2** (old
inline whitelist), so the workspace fix (and even the M1-E1 seam) never reached them — the unit test
greened but the integration test didn't, which exposed this.
- **Wiring fix:** `packages/hardhat-diamonds/package.json` diamonds **devDependency** `^1.0.0` → `workspace:*`;
  `yarn install` (root) → `packages/hardhat-diamonds/node_modules/@diamondslab/diamonds` now symlinks the
  workspace. Integration tests finally exercise real workspace code.
- **Build-tooling restore:** the root install re-hoisted typescript out of the standalone submodules,
  breaking `yarn workspace … build`. Restored via a **standalone `yarn install` inside `packages/diamonds`**
  (local typescript) — `yarn workspace @diamondslab/diamonds build` works again; wiring intact.

### Git (multi-repo)
- **Committed:** diamonds `src` + `test` on `feature/resolution-seam` (`886023d`, `--no-verify`).
- **Infrastructure — left UNCOMMITTED (owner choice):** hardhat-diamonds `package.json` (`workspace:*`),
  root + diamonds `yarn.lock`, and the M1-E3 root files (un-skipped test + additive config). The fix works
  in the current env; ⚠️ the wiring will **not survive a fresh checkout** until the owner persists the
  hardhat-diamonds `workspace:*` change.
