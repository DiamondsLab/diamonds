# Changelog — M3-E1 Upgrade-Scenario Test (PROBE)

## 2026-06-29 — Probe complete; found exactly one real bug (S-3)

- **New:** `packages/diamonds/test/unit/selectorResolutionUpgrade.test.ts` — 4 adversarial upgrade
  scenarios against the pure `resolveFunctionSelectorRegistry` (seeded `Deployed` registry state).
- **Results (measured):**
  - **S-1 include-override-on-upgrade → GREEN.** A selector `Deployed` by FacetA, then `deployInclude`d by
    FacetB, resolves to `Replace`@FacetB. **The `5b2f7af` branch is correct — now verified** (no rewrite needed).
  - **S-2 selector-moves-facets → GREEN.** Higher-priority FacetB wins a previously-`Deployed` selector → `Replace`@new.
  - **S-3 exclude-on-upgrade → RED (the one real bug).** When FacetA is redeployed with `deployExclude:[S]`,
    the Remove entry gets `address: currentFacetAddress` (non-zero). EIP-2535 requires a `Remove` cut to use
    `address(0)`, so this would **revert on-chain**. `AssertionError: a Remove cut must use the zero address`.
  - **S-4 facet-deleted → GREEN.** A deleted facet's selector → `Remove`@`ZeroAddress` (correct).
- **Findings → M3-E2 scope (small):** in `resolveFunctionSelectorRegistry`'s Exclusion Filter, set the
  Remove entry's `address` to `zeroAddress` (not `currentFacetAddress`). Confirm + document `5b2f7af`.
- **Git:** committed on `feature/resolution-seam` (`--no-verify`). S-3 is the **intentional RED** for M3-E2.
