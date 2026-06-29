# Changelog — M1-E3 Additivity Fixture

## 2026-06-29 — Additivity integration fixture (verified RED, skipped) — M1 complete

- **New (root):** `diamonds/ExampleDiamond/examplediamond-include-additive.config.json` — the include config
  **minus** `ExampleTestDeployExclude`, so `ExampleTestDeployInclude` @60 (`deployInclude:["testDeployInclude()"]`)
  exposes `testDeployExclude()` with **no higher-priority competitor**.
- **New (root):** `test/deployment/DeployAdditive.test.ts` — a green sanity test (deploy + own `0x7f0c610c`)
  plus the **additivity assertion** (`ExampleTestDeployInclude` owns BOTH `0x7f0c610c` and `0xdc38f9ab`),
  authored as **`it.skip`** with `TODO(M2)`.
- **Verified RED at HEAD (one-time un-skip):** the config deploys a valid diamond; the additivity test
  FAILS — `AssertionError: … expected '0x0000000000000000000000000000000000000000' to equal
  '0x5FC8…5707'` (`0xdc38f9ab` is absent; the deploy-time whitelist dropped it). Re-skipped after verifying.
- **Root stays green:** full `yarn test` = **190 passing / 70 pending / 0 failing** (skipped additivity →
  pending; sanity → passing). No source/contract changes — reused `ExampleTestDeployInclude`.
- **M1 (harness) COMPLETE:** E1 seam (`662a09c`) · E2 unit RED (`3bf37f6`) · E3 integration RED (skipped).
- **Handoff to M2:** un-skip `DeployAdditive.test.ts` + green the M1-E2 unit RED by making `deployInclude`
  additive (remove the deploy-time whitelist).
- **Git: left UNCOMMITTED (owner choice).** The 2 root files (config + skipped test) stay in the working
  tree for the owner to commit alongside the root's epic5 work / submodule-pointer bump — avoiding pollution
  of the unrelated `feature/epic5-security-scanning-pipeline` branch and its heavy pre-commit hook.
