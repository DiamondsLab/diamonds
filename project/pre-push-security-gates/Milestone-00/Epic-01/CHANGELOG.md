# Changelog — M0-E1 Reproduce Gates In-Container

## 2026-07-03 — Reliable in-container invocations established (read-only)

- Ran every `.husky/pre-push` gate in the devcontainer and recorded a **reliable invocation** for each *remaining* gate into [`baseline.md`](../../baseline.md):
  - **npm audit** — `yarn npm audit --severity moderate` runs cleanly (exit 1 = the 2 lodash findings, **not** a tooling failure); no `findPackageLocation` state error.
  - **semgrep** — `semgrep scan --config .semgrep.yml --exclude-rule weak-encryption` runs cleanly (exit 0, 10 findings; the `--error` flag is what makes findings blocking).
  - **git-secrets** — `git secrets --scan` clean (exit 0).
- Recorded **best-effort** (not hardened) current behavior:
  - **slither** — `slither . --config-file slither.config.json --ignore-compile` **errors** (crytic-compile `KeyError: 'output'`); does not run cleanly in-container → evidence for the **M3** decommission.
  - **tests** — `yarn test` trips the yarn state bug; alt `npx hardhat test`; known 51/0. Tests **leave the gate in M4**.
- **No source, config, or hook changed** — the only new file is `baseline.md` (plus the project planning docs from the pipeline). The pre-existing `yarn.lock` change is unrelated and excluded from the commit.
- **Follow-up:** M0-E2 appends the *findings* and *tooling-repo rationale* sections to the same `baseline.md`.
