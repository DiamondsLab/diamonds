# Changelog — M2-E2 Disposition → Gate Green

## 2026-07-03 — Semgrep gate GREEN (10 → 0); M2 CLOSED

- Applied the owner's **mix** posture in `src/cli/diamond-abi-cli.ts` (type-level only, no runtime change):
  - **8 fixed:** 348/350/355/359 (ethers `Fragment` callbacks — `: any` dropped, inference; `(f as any).format()` → `f.format()`); 474 (`artifact: { abi?: { type: string }[] }`) → 477/478/479 `item` infers.
  - **2 annotated:** `hre` (375) + dynamic `result` (394) with inline `// nosemgrep: typescript-any-usage -- <reason>`. (`result` annotated rather than force-typed — 6+ dynamic fields; file already declares `any` intentional.)
- **`yarn semgrep:scan` (`--error`) → exit 0, 0 findings.** `npm run build` green; `npm run test:unit` 19/0 (no regression).
- Diff limited to `src/cli/diamond-abi-cli.ts` (11+/9−). Reversible via `git checkout`.
- **✅ Milestone M2 DONE** — semgrep gate green. No `.semgrep.yml` change.
