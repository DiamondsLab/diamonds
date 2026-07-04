# Changelog — M3-E1 Remove Slither Gate + Document

## 2026-07-04 — Slither decommissioned as a gate; M3 CLOSED

- Removed the slither block from `.husky/pre-push` (replaced with a decommission comment; no `yarn slither:scan` invocation remains).
- Removed `yarn slither:scan` from the `security-check` aggregate in `package.json`.
- **Kept** (owner choice A): `slither:scan`/`slither:check` scripts + `slither.config.json` as optional-manual (out of every gate).
- Documented the rationale in [`baseline.md`](../../baseline.md): tooling repo; contracts are fixtures; slither errors in-container. audit + semgrep + git-secrets stay enforced.
- Validated: `grep 'yarn slither:scan' .husky/` = 0; `security-check` slither-free; scripts + config still present. Diff limited to `.husky/pre-push` + `package.json`.
- **✅ Milestone M3 DONE** — slither no longer a blocking gate. Reversible via git.
