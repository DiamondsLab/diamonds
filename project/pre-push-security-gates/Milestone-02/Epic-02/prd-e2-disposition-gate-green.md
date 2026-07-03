# Change Plan (PRD) — M2-E2 Disposition → Gate Green

> **Expands:** [`overview/e2-disposition-gate-green.md`](overview/e2-disposition-gate-green.md) · **Parent:** [Milestone 3 (M2)](../overview/milestone-03-semgrep-triage-disposition.md) · **Plan:** [`pre-push-security-gates-project-plan.md`](../../pre-push-security-gates-project-plan.md)
> **Type:** type-level source change (reversible) · **Status:** 📋 ready for `/generate-tasks` · **Date:** 2026-07-03 · **Depends on:** M2-E1 (classification) · **Owner posture:** MIX (fix + annotate)

## 1. Overview & Problem
The semgrep gate fails on 10 `typescript-any-usage` findings in `src/cli/diamond-abi-cli.ts`. Owner chose the **mix** posture: fix the cleanly-typable ones with real types, keep the one genuinely-justified `any` with an inline suppression. **Goal:** take `yarn semgrep:scan` to **0 blocking** via type-level edits (no runtime behavior change), then confirm no regression.

## 2. Goals
- G1 — `yarn semgrep:scan` → **0 blocking findings** (exit 0).
- G2 — 9 sites fixed with real types; 1 site (`hre`) annotated `// nosemgrep: typescript-any-usage`.
- G3 — `yarn build` (or `npm run build`) green; submodule `test:unit` still green (no regression).

## 3. Scope — Components & Services
- **Repo:** `packages/diamonds/` only. **File edited:** `src/cli/diamond-abi-cli.ts` (type annotations + 1 nosemgrep comment). No `.semgrep.yml` change (mix posture doesn't tune the rule).
- **Run:** `yarn semgrep:scan`, `yarn build`/`npm run build`, `npm run test:unit`.

## 4. Stakeholders & Impact
- **Engineer (agent):** executes. **Owner:** posture already decided (mix). **User-facing/production impact:** none — type-level edits to a CLI tool; runtime behavior unchanged.

## 5. Operational Requirements
Apply, in `src/cli/diamond-abi-cli.ts`:
1. **Lines 348, 350, 355, 359** — replace `(f: any)` with `(f: Fragment)` (import `Fragment` from `ethers`); adjust the `.slice`/`.forEach`/`.length` chains as needed (the existing `(f as any).format()` on 351 can become `(f as FunctionFragment).format()` or stay — keep minimal).
2. **Line 394** — replace `result: any` with the ABI-generator's result type (import it; it exposes `.stats.totalFunctions/totalEvents/totalErrors/facetCount`). If no exported type exists, define a minimal local interface.
3. **Line 474** — replace `artifact: any` with hardhat `Artifact` (import from `hardhat/types`) or a minimal `{ abi?: unknown[] }`.
4. **Lines 477, 478, 479** — type the ABI `item` with a minimal `{ type: string }` (e.g. `(item: { type: string })`).
5. **Line 375** — keep `hre: any` (deliberate — runtime `hre.ethers`); add an inline `// nosemgrep: typescript-any-usage -- hre.ethers is injected at runtime by hardhat-ethers` above/at the line.
6. Re-run `yarn semgrep:scan` (with `--error` as the hook does) → confirm 0 blocking.
7. Re-run `yarn build` + `npm run test:unit` → confirm green.
8. Make **no** `.semgrep.yml` change and no unrelated refactor.

## 6. Security & Compliance Considerations
- No secrets/credentials/elevated privileges. `typescript-any-usage` is code-quality; the one suppression is documented. This *improves* type safety.

## 7. Non-Goals (Out of Scope)
- Tuning `.semgrep.yml` / disabling the rule (mix posture doesn't).
- Refactoring `diamond-abi-cli.ts` beyond the flagged sites.
- The Solidity rules (no findings).

## 8. Risk, Rollback & Recovery
- **Backup/snapshot required:** no — a single reversible commit.
- **Risk:** a type fix changes behavior → **Mitigation:** edits are type-only; re-run `yarn build` + `test:unit`.
- **Risk:** `semgrep --error` still flags after annotation (wrong inline syntax) → **Mitigation:** verify the `// nosemgrep: <rule>` syntax; re-run to confirm 0.
- **Risk:** the ABI-generator result type isn't exported → **Mitigation:** define a minimal local interface with the `.stats` shape.
- **Rollback:** `git checkout src/cli/diamond-abi-cli.ts`.

## 9. Validation / Success Metrics
- `yarn semgrep:scan` → 0 blocking (exit 0).
- `yarn build` → green; `npm run test:unit` → green (prior count holds).
- `git diff` limited to `src/cli/diamond-abi-cli.ts` (+ imports).

## 10. Open Questions
- Whether the ABI-generator result type is exported (for line 394) — if not, use a minimal local interface. Resolved during execution.

**Next:** `/generate-tasks` against this PRD.
