# Changelog — M2-E1 Enumerate & Classify

## 2026-07-03 — 10 typescript-any-usage findings classified (read-only)

- Read all 10 flagged `any` sites in `src/cli/diamond-abi-cli.ts` and classified each (table in [`baseline.md`](../../baseline.md) M2 section):
  - **6 cleanly fixable** (348/350/355/359 = ethers `Fragment`; 394 = generator result type; 474 = hardhat `Artifact`).
  - **3 loosely-typed ABI items** (477–479 — fixable with a minimal `{ type: string }` or annotate).
  - **1 genuinely justified** (`hre: any`, line 375 — already commented; runtime `hre.ethers`).
- **Recommended posture:** *mix — fix + annotate* (fix the 6 clean + type the 3 ABI items; keep `hre` with one `// nosemgrep`). Alternatives: annotate-all (fastest) or tune-the-rule (exclude `src/cli/**`).
- **Owner decision** on posture surfaces next, before M2-E2. Read-only — no code/config changed.
