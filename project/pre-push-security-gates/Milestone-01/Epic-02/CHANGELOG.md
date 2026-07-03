# Changelog — M1-E2 Remove Unused Deps

## 2026-07-03 — Audit gate GREEN: axios + lodash removed (26 → 0)

- Removed the unused `axios` (`^1.12.0`) + `lodash` (`^4.17.21`) from `packages/diamonds/package.json` `dependencies`.
- Regenerated `yarn.lock` from a clean committed base (`git checkout yarn.lock` → standalone `yarn install` inside `packages/diamonds`) to keep the diff scoped (excludes the pre-existing unrelated lock diff).
- **`yarn npm audit --severity moderate` → exit 0 (26 → 0 advisories).** Audit gate passes.
- **Nuance (recorded in `baseline.md`):** axios/lodash remain in the tree only as **transitive devDependency** pulls; they are no longer direct production deps, so the production audit + published package are clean — which is what the hook gate checks.
- **0 residual** → M1-E3 is verification-only; owner gate **OP-M1-1 does not fire**.
- Diff: `package.json` (2 lines) + `yarn.lock` (regenerated); no source changes. Reversible via `git checkout package.json yarn.lock`.
