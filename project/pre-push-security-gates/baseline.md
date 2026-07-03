# Pre-Push Security Gates — Baseline

> **Project:** [pre-push-security-gates](pre-push-security-gates-project-plan.md) · **Captured:** 2026-07-03
> **Working tree at capture:** `packages/diamonds` on branch `chore/pre-push-security-gates`; only change vs `main` is a pre-existing `yarn.lock` modification + these new `project/` docs (no source/config/hook changed).
> This file is the living reference the whole project measures "green" against. **M0-E1** writes the *invocations* section below; **M0-E2** appends the *findings* + *rationale* sections.

## Reliable in-container invocations (M0-E1)

How to run each `.husky/pre-push` gate **inside the devcontainer** without tripping the yarn `findPackageLocation` node-modules state-file bug. Run from `packages/diamonds/`.

| Gate | Exact in-container command | Exit behavior (2026-07-03) | Hardened? | Notes |
|------|----------------------------|----------------------------|-----------|-------|
| **npm audit** | `yarn npm audit --severity moderate` | exit **1**; no `findPackageLocation` error | ✅ yes | Command runs reliably; exit 1 is *findings present* (the 2 lodash advisories), not a tooling failure. This is the exact hook flag. |
| **semgrep** | `semgrep scan --config .semgrep.yml --exclude-rule weak-encryption` | exit **0**, lists **10 findings**; no state error | ✅ yes | Direct binary (no `yarn`). The `semgrep:scan` script adds `--error`, which is what turns findings into a non-zero *blocking* result. |
| **git-secrets** | `git secrets --scan` | exit **0**, no output = **clean** | ✅ yes | Already passing. |
| **slither** | `slither . --config-file slither.config.json --ignore-compile` | exit **1** — crytic-compile `KeyError: 'output'` (**errors, does not run cleanly**) | ❌ best-effort | Not hardened. Does not run in-container as configured — evidence for the **M3** decommission decision. |
| **tests** | hook runs `yarn test` → **trips the state bug**; alt: `npx hardhat test --config hardhat.config.ts` | not re-run here (heavy) | ❌ best-effort | Not hardened; known current result 51/0 (submodule). Tests **leave the push gate in M4**. |

**Legend:** *Hardened* = a reliable in-container command exists for a gate that **remains** after this project. *best-effort* = current-state snapshot only; slither is removed (M3) and tests leave the gate (M4), so neither is hardened.

**Cross-check:** each command above mirrors its `.husky/pre-push` line + `package.json` script (`audit`, `semgrep:scan`, `git-secrets:scan`, `slither:scan`, `test`).

---

## Findings (M0-E2)

Captured 2026-07-03 via the M0-E1 invocations. Confirmed against the **committed** `yarn.lock` (the working-tree `yarn.lock` has a small unrelated diff that does **not** change the audit result).

### npm audit — ⚠️ 26 advisories: **13 high + 13 moderate**
- **Primary packages:** `axios` and `lodash` (+ transitive).
- lodash: prototype pollution — ids `1115810`, `1120370` (moderate); `lodash@4.17.21`, **no upstream 4.x patch**.
- axios (+ others): ids include `1116673`, `1117574` (moderate), `1117576`/`1117591`/`1117593`/`1117858`/`1118607`/`1119667`/`1120547`/`1120643`/`1120645`/`1120647` (high), etc.
- **⚠️ Correction to the project plan:** M1 was scoped as "2 lodash moderate → remove unused lodash." That "2" was a **truncation artifact** of the planning-phase scoping (`| tail -25`). The real audit gate is **26 advisories including 13 high**. **M1 must be re-scoped** to real dependency remediation (notably an `axios` upgrade + transitive fixes, plus lodash), not just removing lodash — see [project plan §5 M1](pre-push-security-gates-project-plan.md).

### semgrep — 10 findings, **all `typescript-any-usage`**, all in `src/cli/diamond-abi-cli.ts`
| # | rule id | file:line | prelim. class |
|---|---------|-----------|---------------|
| 1–10 | `typescript-any-usage` | `src/cli/diamond-abi-cli.ts` : 348, 350, 355, 359, 375, 394, 474, 477, 478, 479 | TS / `any` (code-quality) |

- **Not** Solidity-security rules on fixtures (the plan speculated that). All 10 are `any`-usage in one product-code CLI file. **Refines M2:** fix/annotate the 10 `any` usages, or tune the `typescript-any-usage` rule. Classes are *preliminary* — M2-E1 is authoritative.

### git-secrets — clean (exit 0, no output).

### slither (best-effort, not hardened) — **errors**: `crytic-compile KeyError: 'output'`; does not run cleanly in-container → evidence for the **M3** decommission.

### tests — `yarn test` trips the yarn state bug; alt `npx hardhat test`; known submodule result **51/0**. Leaves the push gate in **M4**.

## Tooling-repo rationale (M0-E2)

`@diamondslab/diamonds` is a **TypeScript library/tool**, not a smart-contract product. The in-repo Solidity contracts (`contracts/`) exist **only as test fixtures** for exercising the tooling. Contract-security analyzers (slither; any Solidity-targeting semgrep rules) are therefore applied with that lens — they are **not appropriate release gates** for a tooling repo. This is the shared justification cited by **M3** (removing slither as a blocking gate) and by **M2** for scoping any Solidity rule that fires on fixtures.

This is **not a blanket security waiver**: `npm audit` (real dependency risk — and it's *worse* than first thought, 26 advisories) and semgrep's **TypeScript** rules on **product code** (`src/`) stay fully enforced. *(Note: the current 10 semgrep findings are all `typescript-any-usage` in product code, so **none** are scoped out by this rationale — it currently applies only to slither.)*

---

## M1 — Audit remediation triage (M1-E1, 2026-07-03)

**Unused confirmation (widened):** `axios` + `lodash` have **0 usages** across `src`/`scripts`/`test`, **0** in config files (`hardhat.config.ts`, `tsconfig*.json`, `.mocharc*`), and are **not re-exported** by `src/index` or `package.json` `exports`. `yarn why axios` and `yarn why lodash` both show **`@diamondslab/diamonds@workspace:.` as the sole (direct) dependent** — nothing else pulls them.

**Advisory enumeration (26 total):** every advisory's vulnerable package **is `axios` or `lodash` itself** (not a transitive dep beneath them):
| Package | Advisories | Severity | Dependent | Direct/Transitive | Clears on removal? |
|---------|-----------|----------|-----------|-------------------|--------------------|
| `axios` (`1.12.2`) | 23 (ids 1116673, 1117574–1117595, 1117858, 1118607, 1119404, 1119667, 1120125, 1120547, 1120643–1120652) | mostly high | `@diamondslab/diamonds` (only) | **Direct** | ✅ yes |
| `lodash` (`4.17.21`) | 3 (1115806, 1115810, 1120370) | moderate | `@diamondslab/diamonds` (only) | **Direct** | ✅ yes |

**✅ GO — clears-on-removal: ALL 26.** Removing `axios` + `lodash` from `dependencies` clears every advisory. **0 residual transitive advisories expected** → the M1-E3 owner gate **OP-M1-1 will not fire** unless the post-removal re-audit surprises us.

### M1-E2 result (2026-07-03): audit gate GREEN

- Removed `axios` + `lodash` from `packages/diamonds/package.json` `dependencies` (2 lines); regenerated the lockfile from a clean committed base (`git checkout yarn.lock` → standalone `yarn install`).
- **`yarn npm audit --severity moderate` → exit 0 (26 → 0 advisories).** The audit gate passes.
- **Nuance:** `yarn why axios`/`lodash` still show them in the tree (transitive pulls via **devDependencies** — e.g. tooling). They are no longer **direct production dependencies**, so the production audit ignores them and the **published package no longer ships them** — which is exactly what the gate (and consumers) care about. *(The hook's `yarn npm audit --severity moderate` does not audit the dev-transitive tree; if `--all` were ever added it could resurface — out of scope here.)*
- **0 residual advisories** → M1-E3 is verification-only; **OP-M1-1 does not fire.**
- Diff scoped to `package.json` (2 lines) + `yarn.lock` (regenerated); no source change.

### M1-E3 verification — M1 CLOSED (2026-07-03)

- **Audit gate:** `yarn npm audit --severity moderate` → exit 0 ✅
- **Build:** `npm run build` → exit 0 (green) ✅
- **Tests:** `npm run test:unit` → **19 passing / 0 failing** ✅ — **no regression** (removing 0-import deps can't affect tests; build confirms compilation).
- **Test-count clarification:** the "51/0" recorded above was carried over from the **`feature/resolution-seam`** branch (which adds the deployInclude resolution-seam unit tests — PR #12, not yet on `main`). This project's branch (`chore/pre-push-security-gates`) is off **`main`**, where `test:unit` = **19/0**. Not a regression — a branch difference.
- **✅ Milestone M1 DONE:** audit gate green (26 → 0), no residual, build + tests green, no source change.
