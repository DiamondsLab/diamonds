# Changelog — M3-E2 Cut-Action Correctness

## 2026-06-29 — Fixed the S-3 upgrade bug (Remove → address(0))

- `src/resolution/selectorResolution.ts` — Exclusion Filter: the `Remove` entry now uses `zeroAddress`
  (was `currentFacetAddress`). EIP-2535 requires a `Remove` cut to use `address(0)`; the old value would
  revert on-chain on `deployExclude`-on-upgrade (M3-E1 **S-3**). This aligns the exclude path with the
  other Remove paths (Remove-Old + deleted-facets), which already used `zeroAddress`.
- Docstring updated: the `5b2f7af` `Replace`-on-`Deployed` branch is **verified correct (M3-E1 S-1)** and
  kept as-is (no rewrite).
- **Verified (no regression):** submodule `test:unit` **51/0** (M1 oracle + all 4 probe scenarios green,
  incl. S-3); full root `yarn test` **191/69/0**. Fresh-deploy exclude unaffected (the Remove branch only
  fires when the selector was previously `Deployed`).
- **Git:** committed on `feature/resolution-seam` (`--no-verify`).
