# Invariant ↔ Test Traceability Matrix (M4-E3)

> Every oracle invariant (INV-1…9) mapped to a **real, non-vacuous** test, or marked **deferred → validator**.
> Suite state: root `yarn test` **190 passing / 70 pending / 0 failing**; submodule `test:unit` **51/0**.
> Unit = `packages/diamonds/test/unit/`; integration = `test/deployment/` (root, deploys via `LocalDiamondDeployer` → workspace diamonds).

| Invariant | Unit test (`file :: name`) | Integration test (`file :: name`) |
|-----------|----------------------------|-----------------------------------|
| **INV-1** exclude independence (excluded never owned by F) | `selectorResolution.test.ts :: Fixture A — exclude config` | `DeployIncludeExclude.test.ts :: testDeployExclude() (0xdc38f9ab) is NOT registered with ExampleTestDeployExclude` |
| **INV-2** include override (lower-priority include wins) | `selectorResolution.test.ts :: Fixture B — include config` | `DeployIncludeExclude.test.ts :: ExampleTestDeployExclude facet is deployed with include config` + `:: facetAddress() … owns each selector`; `DeployAdditive.test.ts :: INV-3 additivity …` |
| **INV-3** additive (facet keeps non-included selectors) | `selectorResolution.test.ts :: INV-3 additivity: deployInclude keeps the facet other selectors` | `DeployAdditive.test.ts :: INV-3 additivity: ExampleTestDeployInclude also owns testDeployExclude()` |
| **INV-4** single owner / clean Add·Replace cut (incl. upgrade) | `selectorResolutionUpgrade.test.ts :: S-1 … S-4` (incl. S-3 Remove→address(0)) | `DeployIncludeExclude.test.ts :: facetFunctionSelectors() … at runtime` + `:: facetAddress() … owns each selector` |
| **INV-5** no schema change / legacy both-sides ≡ single-sided | _(implicit — config shape unchanged; the M2-E1 fix doesn't touch the schema)_ | _(implicit — the symmetric fixtures still pass; legacy both-sides not separately tested — **minor honest gap**)_ |
| **INV-6** absence when unclaimed (`facetAddress == 0`) | `selectorResolution.test.ts :: Fixture A` (registry has no entry for `0xdc38f9ab`) | `DeployIncludeExclude.test.ts :: testDeployExclude() (0xdc38f9ab) is owned by NO facet — absent (INV-6)` (rewritten, non-vacuous) |
| **INV-7** same-facet include+exclude → hard error | _deferred → validator (DR-3)_ | `DeployIncludeExclude.test.ts :: INV-7 … invalid — enforcement deferred to validator` (**pending/skip** placeholder) |
| **INV-8** dual-include → hard error | _deferred → validator (DR-3)_ | — (not exercised by any fixture; validator's responsibility) |
| **INV-9** non-existent selector → no-op | `selectorResolution.test.ts :: INV-9: a non-existent exclude signature is a no-op` | `DeployIncludeExclude.test.ts :: handle non-existent function in deployExclude` + `:: … in deployInclude` (tightened to direct assertions, M4-E1) |

## Coverage summary
- **Fully covered (unit + integration), non-vacuous:** INV-1, INV-2, INV-3, INV-4, INV-6, INV-9.
- **Deferred → `basestrategy-fulfillment` validator (ratified DR-3):** INV-7, INV-8 — by design, not this project's enforcement.
- **Minor honest gap:** INV-5 is *implicit* (the config schema is unchanged and the symmetric fixtures pass), but there is **no dedicated test** that a legacy both-sides config yields the same result as single-sided. Low risk (the fix is additive + schema-frozen); a 1-case unit test could close it if the Owner wants it.

## Cross-strategy (M4-E2)
The fix reaches `LocalDeploymentStrategy` (tested via integration) and `RPCDeploymentStrategy` (by
inheritance of the fixed `updateFunctionSelectorRegistryTasks`; not RPC-network-tested). OZDefender
deprecated (compiles). The hardhat-diamonds `signer` change is unrelated.

## Sign-off (OP-2) — ✅ CLEARED
- [x] **Owner signed off (2026-06-29):** the suite expresses the approved design — INV-1/2/3/4/6/9 fully
      covered (unit + integration, non-vacuous); INV-7/8 deferred → validator (DR-3, by design); INV-5
      accepted as a **low-risk implicit gap** (additive fix + frozen schema). → **PROJECT CLOSED.**
