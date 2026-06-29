# Changelog — M4-E1 Edge-Case Configs

## 2026-06-29 — Edge-case tests assert the oracle

- `test/deployment/DeployIncludeExclude.test.ts`:
  - **B15/B16** (`invalid-exclude`/`invalid-include`, INV-9): tightened from a broad `try/catch` to a
    **direct** assertion — a non-existent include/exclude signature is a no-op and the deploy succeeds
    (`DiamondAddress` matches `/^0x…{40}$/`). Both pass (the configs deploy cleanly).
  - **B17** (`include-and-exclude`, INV-7): reframed from `expect(DiamondAddress).to.exist` ("handled") to
    **`it.skip` (pending)** — per ratified INV-7 (hard error, DR-1) the config is **invalid**, and its
    enforcement is **deferred to the `basestrategy-fulfillment` validator** (DR-3/DR-4). TODO(validator):
    assert the config is rejected. No longer asserts "succeeds".
- **Verified:** `DeployIncludeExclude` 16 passing / 1 pending; full root `yarn test` **190 / 70 / 0** (B17
  → pending). Root stays green.
- **Git:** root test left uncommitted (convention).
