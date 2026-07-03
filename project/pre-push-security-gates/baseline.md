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

*To be appended by M0-E2 — per-gate current findings (audit advisory ids, the 10 semgrep findings by rule/file/line, git-secrets clean, slither best-effort, tests count).*

## Tooling-repo rationale (M0-E2)

*To be appended by M0-E2 — the shared justification (diamonds is a TS tool; in-repo contracts are test fixtures) cited by M2 (semgrep scoping) and M3 (slither removal).*
