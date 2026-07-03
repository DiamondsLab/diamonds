# Epic 1 — Confirm Unused + Enumerate (M1-E1)

> **Parent milestone:** [Milestone 2 — Audit Gate: Remove Unused Vulnerable Deps (M1)](../../overview/milestone-02-audit-remove-unused-vulnerable-deps.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M1 → M1-E1
> **Owner:** Engineer · **Impact/blast radius:** read-only analysis; no code/dep change · **Estimated effort:** S · **Status:** 📋 planned

## 1. Objective
De-risk M1's removal before it happens: **prove** `axios` and `lodash` are genuinely unused across the whole package (not just `src/`), and **enumerate** all 26 npm-audit advisories, determining for each whether it will **clear on direct removal** (reached only via the direct axios/lodash declaration) or is **transitive** (reached via another dependency, so it survives removal). This produces the go/no-go evidence and the residual-work list for M1-E2/E3.

## 2. Acceptance criteria
- [ ] `axios` + `lodash` confirmed **0 usages** across `src/`, `scripts/`, `test/`, **config files** (hardhat.config, tsconfig, `.mocharc`, etc.), **dynamic `require(...)`**, and the package **barrel / `exports` / `index`** (no re-export).
- [ ] A table of all **26 advisories** (`advisory id | package | severity | direct or transitive | clears on removal?`), derived from `baseline.md` + `yarn npm audit`.
- [ ] A clear **go/no-go**: either "direct removal clears all 26" or "N residual transitive advisories → M1-E3 work list."
- [ ] No code, dep, or config changed (read-only).

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Grep `axios`/`lodash` across `src`, `scripts`, `test`, and root config files (imports, `require`, dynamic) | Engineer | 0 usages confirmed or usages listed |
| 2 | Check the package barrel / `src/index` + `package.json` `exports` for any re-export of axios/lodash | Engineer | confirmed not re-exported |
| 3 | Run `yarn npm audit --severity moderate`; map each of the 26 advisories to its package + severity | Engineer | advisory list captured |
| 4 | For each advisory, determine direct-vs-transitive (does the dependency path go only through the direct axios/lodash, or also via another dep?) | Engineer | direct/transitive column filled |
| 5 | Record the go/no-go + residual list into `baseline.md` (M1 section) | Engineer | table + verdict recorded |

## 4. Dependencies & owner gates
- **Upstream:** M0 (baseline + reliable `yarn npm audit` invocation) — done.
- **Owner gates:** none — read-only analysis.
- **Downstream:** M1-E2 (removal) + M1-E3 (residual disposition) consume this epic's go/no-go + residual list.

## 5. Risks
| Risk | Mitigation |
|------|------------|
| A usage exists via a path the grep missed (dynamic, config, re-export) | Explicitly check config files + `exports`/barrel + `require(` patterns, not just `import` |
| Advisory-to-package attribution ambiguous in audit output | Use `yarn npm audit` tree output (Dependents/Tree Versions) or `--json`; note where transitive |
| axios/lodash pulled transitively by another dep (won't clear) | This is exactly what task 4 finds — flag as residual for M1-E3, don't assume removal clears everything |

## 6. Notes
- Fully reversible — analysis + a doc update only.
- Baseline already shows `src/scripts/test = 0` imports for both; this epic **widens** the check to configs/dynamic/re-exports and adds the direct-vs-transitive determination that removal depends on.
- Feeds the conditional owner gate **OP-M1-1** (M1-E3): if task 4 finds residual transitive advisories with no clean fix, that's where owner sign-off enters.
