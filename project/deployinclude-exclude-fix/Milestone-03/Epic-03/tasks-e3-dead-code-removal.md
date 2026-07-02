# Tasks — M3-E3 Dead-Code Removal

Execution checklist for [prd-e3-dead-code-removal.md](prd-e3-dead-code-removal.md). Remove the dead
`higherPrioritySplit`; strictly behavior-preserving.

## Relevant Files & Resources
- **Edit (submodule):** `packages/diamonds/src/resolution/selectorResolution.ts` (split block + `higherPriorityFacet` branch).
- **Edit (docs):** `…/deployinclude-exclude-fix-architecture.md` §1.1 (split now removed).
- **Append:** `…/Milestone-03/Epic-03/CHANGELOG.md`.

## Tasks
- [x] 0.0 Prepare — on `feature/resolution-seam`.
- [x] 1.0 Removed `registryHigherPrioritySplit` + the `higherPriorityFacet` branch (via script); override filter now `if(5b2f7af)/else(Add)`.
- [x] 2.0 Verified **identical**: submodule `test:unit` 51/0; full root `yarn test` 191/69/0. Nothing changed → confirmed dead.
- [x] 3.0 Oracle §1.1 + docstring updated; CHANGELOG written; committed `d1d8a01` (`--no-verify`).

> ✅ **M3-E3 COMPLETE.** Dead `higherPrioritySplit` removed, behavior identical (net −27 lines).