# Changelog — M3-E3 Dead-Code Removal

## 2026-06-29 — Removed the inverted/dead `higherPrioritySplit`

- `src/resolution/selectorResolution.ts` — removed the `registryHigherPrioritySplit` computation and the
  `if (higherPriorityFacet) { … }` branch in the Inclusion Override Filter. The branch filtered
  `entry.priority > priority` (a *lower*-priority facet), so it never matched a real higher-priority
  conflict; the only cases it nominally handled (an include over a lower-priority `Deployed` selector, on
  upgrade) **fall through to the `5b2f7af` branch with the identical `Replace` result**. The override
  filter is now just `if (5b2f7af-Replace)` / `else (Add)`. Module docstring + oracle §1.1 updated.
- **Strictly behavior-preserving (verified identical):** submodule `test:unit` **51/0** (M1 oracle + M3-E1
  probe 4/4 unchanged); full root `yarn test` **191/69/0**.
- **Git:** committed on `feature/resolution-seam` (`--no-verify`).
