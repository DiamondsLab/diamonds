# Design Specification Artifact — MC-04 brief

**Brief ID:** MC-04 brief
**Source MC(s):** MC-04 (Strategy extensibility for external multi-party modules)
**Origin:** Plan §6.1 (primary)
**Primary Artifact Type:** Contract
**Secondary Type:** None
**Specification Date:** 2026-05-26
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Improvement Plan Version:** v1.0 (2026-05-22, no amendments)
**Step 02 Register Reference:** Step 02 §2.1 (MC-04 brief)
**Status:** Draft — Pending Practitioner Final Review

> ⚠️ This artifact specifies the chosen mechanism at design level.
> It is Phase-5-implementable without further design work. Phase 4
> architecture decisions, Phase 5 implementation details, and Phase
> 6 verification execution are out of scope.

---

## §1 — Brief Intake Confirmation

| Field                                                                  | Value                                                                                                                                                                                                                                                                                                                                                                                  | Confirmed                            |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Brief ID                                                               | MC-04 brief                                                                                                                                                                                                                                                                                                                                                                            | Yes                                  |
| Phase 2 chosen mechanism (full text)                                   | "Formal extension contract — TypeScript interface (IDeploymentStrategy) with explicit lifecycle methods, plus a contract conformance test suite that external strategy implementations can run against. Document the contract as a versioned interface, with a worked sibling-strategy example (one minimal but functional external strategy) that proves the contract is sufficient." | Yes                                  |
| Plan §6.1 design questions                                             | Q1: Specific lifecycle methods; Q2: JSDoc security-boundary semantics; Q3: Conformance test suite scope; Q4: Worked sibling example shape; Q5: NTI-03 interaction                                                                                                                                                                                                                      | Yes — all five addressed in §2 below |
| Inherited constraints                                                  | MK-08 (ERC-2535 conformance); HC-05 (v2.0 breaking changes per-item justified); F-41 (auditor reproducibility)                                                                                                                                                                                                                                                                         | Yes                                  |
| Verification method named in Plan                                      | Contract conformance test passes against worked example; reference external strategy produces auditor-reproducible deployment records; TypeScript interface JSDoc covers security boundaries                                                                                                                                                                                           | Yes                                  |
| Artifact type (primary)                                                | Contract — confirmed against Step 02 §2.1 classification                                                                                                                                                                                                                                                                                                                               | Yes                                  |
| Step 01 §11.1 gap carryover (if any) — resolved                        | None                                                                                                                                                                                                                                                                                                                                                                                   | Yes                                  |
| Step 02 §7 carryover (VG-P3-U-02 NTI cycle-vs-future-cycle) — resolved | Yes — diamonds-safe NOT being built this cycle; contract + worked sibling example + migration doc enable future-cycle work                                                                                                                                                                                                                                                             | Yes (stated explicitly in §2.5)      |

---

## §2 — Design Specification

### §2.1 — Method Surface

**Design specification:**

The v2.0 contract is the TypeScript interface **`IDeploymentStrategy`** (renamed from v1.3.2's `DeploymentStrategy`), formalizing all 15 lifecycle methods currently exposed by `DeploymentStrategy.ts`:

| Phase                             | pre Method                                                           | main Method                                                       | post Method                                                           |
| --------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| Deploy Diamond                    | `preDeployDiamond(diamond: Diamond): Promise<void>`                  | `deployDiamond(diamond: Diamond): Promise<void>`                  | `postDeployDiamond(diamond: Diamond): Promise<void>`                  |
| Deploy Facets                     | `preDeployFacets(diamond: Diamond): Promise<void>`                   | `deployFacets(diamond: Diamond): Promise<void>`                   | `postDeployFacets(diamond: Diamond): Promise<void>`                   |
| Update Function Selector Registry | `preUpdateFunctionSelectorRegistry(diamond: Diamond): Promise<void>` | `updateFunctionSelectorRegistry(diamond: Diamond): Promise<void>` | `postUpdateFunctionSelectorRegistry(diamond: Diamond): Promise<void>` |
| Perform Diamond Cut               | `prePerformDiamondCut(diamond: Diamond): Promise<void>`              | `performDiamondCut(diamond: Diamond): Promise<void>`              | `postPerformDiamondCut(diamond: Diamond): Promise<void>`              |
| Run Post-Deploy Callbacks         | `preRunPostDeployCallbacks(diamond: Diamond): Promise<void>`         | `runPostDeployCallbacks(diamond: Diamond): Promise<void>`         | `postRunPostDeployCallbacks(diamond: Diamond): Promise<void>`         |

**Stratified JSDoc treatment.** The 15 methods receive different JSDoc rigor based on extension role:

- **5 main methods** (`deployDiamond`, `deployFacets`, `updateFunctionSelectorRegistry`, `performDiamondCut`, `runPostDeployCallbacks`) get full JSDoc:
  - Purpose
  - Parameter contract
  - Post-conditions (per §2.3 below)
  - Idempotency posture (per §2.2 below)
  - Trust assumptions (per §2.3 below)
  - Edge case handling guidance
- **10 pre/post hook methods** get brief JSDoc:
  - Purpose ("extension point for X before/after the main phase")
  - Empty-default-implementation note (the base class implementation does nothing; override if your strategy needs to take action)

**Import surface:**

- v2.0 publishes the interface as `IDeploymentStrategy` only
- No alias for the old `DeploymentStrategy` name (hard break)
- Migration doc (jointly authored with MC-21 brief's migration coverage; lives in `examples/migration-v1-to-v2.md` or equivalent per MC-07 IA decisions) walks the rename:
  - Before (v1.3.2): `import { DeploymentStrategy } from '@diamondslab/diamonds'`
  - After (v2.0): `import { IDeploymentStrategy } from '@diamondslab/diamonds'`
- HC-05's "v2.0 breaking changes per-item justified" discipline: the rename's justification = consistent TypeScript interface naming convention; bundled with MC-21's Signer-injection break into one coherent v2.0 migration narrative

**Phase 5 implementation note:** Phase 5 renames `src/strategies/DeploymentStrategy.ts` → `src/strategies/IDeploymentStrategy.ts` and updates all internal imports. The 15 method signatures match the existing `DeploymentStrategy.ts` shape; only the name changes at this stage.

### §2.2 — Lifecycle Semantics

**Design specification:**

**Phase ordering (interface-level JSDoc):**

> "When invoked by `DiamondDeployer`, the 5 phases execute in this order:
>
> 1. Deploy Diamond
> 2. Deploy Facets
> 3. Update Function Selector Registry
> 4. Perform Diamond Cut
> 5. Run Post-Deploy Callbacks
>
> Within each phase, the pre/main/post methods execute in that order."

**Idempotency posture per method:**

| Method                               | Idempotency                | Annotation                                                                                                                                                                                                                                           |
| ------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `preDeployDiamond`                   | Idempotent in steady state | "Default implementation is idempotent (no-op). Overrides should preserve idempotency where the strategy's semantics permit."                                                                                                                         |
| `deployDiamond`                      | **NOT IDEMPOTENT**         | "This method deploys a new Diamond contract on-chain. Calling twice with the same input deploys two Diamonds. Implementers should guard against accidental re-invocation (e.g., by checking `deployedDiamondData.DiamondAddress` before deploying)." |
| `postDeployDiamond`                  | Idempotent in steady state | Same as `preDeployDiamond`.                                                                                                                                                                                                                          |
| `preDeployFacets`                    | Idempotent in steady state | Same.                                                                                                                                                                                                                                                |
| `deployFacets`                       | Idempotent in steady state | "The default implementation checks `deployedVersion` vs `upgradeVersion` per facet and is a no-op for facets already at target version. Overrides should preserve this property."                                                                    |
| `postDeployFacets`                   | Idempotent in steady state | Same as `preDeployFacets`.                                                                                                                                                                                                                           |
| `preUpdateFunctionSelectorRegistry`  | Idempotent in steady state | Same.                                                                                                                                                                                                                                                |
| `updateFunctionSelectorRegistry`     | Idempotent in steady state | "Applies registry updates from the current in-memory state. Applying twice produces the same result."                                                                                                                                                |
| `postUpdateFunctionSelectorRegistry` | Idempotent in steady state | Same.                                                                                                                                                                                                                                                |
| `prePerformDiamondCut`               | Idempotent in steady state | Same.                                                                                                                                                                                                                                                |
| `performDiamondCut`                  | **NOT IDEMPOTENT**         | "This method submits an on-chain diamondCut transaction. Calling twice attempts the same cuts; result depends on the diamond's current on-chain state (may revert or no-op). Implementers should guard against accidental re-invocation."            |
| `postPerformDiamondCut`              | Idempotent in steady state | Same.                                                                                                                                                                                                                                                |
| `preRunPostDeployCallbacks`          | Idempotent in steady state | Same.                                                                                                                                                                                                                                                |
| `runPostDeployCallbacks`             | Implementation-dependent   | "Idempotency depends on the callbacks registered. Implementer is responsible for documenting callback idempotency."                                                                                                                                  |
| `postRunPostDeployCallbacks`         | Idempotent in steady state | Same.                                                                                                                                                                                                                                                |

**Atomicity across phases:**

> "The contract does NOT guarantee atomicity across phases. If a strategy execution fails partway through, the implementer's pre/main/post hooks for the last completed phase have run, but no subsequent phase has. Recovery is the implementer's responsibility — typically by reading `deployedDiamondData` to determine the last completed state and resuming from there."

**Implicit state semantics:**

> "Each method receives the `Diamond` object with state mutations from all prior methods in the lifecycle already applied. Implementers may read the state freely. State mutations within a method MUST go through the `Diamond` object's public methods (`updateDeployedDiamondData`, `registerFunctionSelectors`, etc.) — direct field manipulation is forbidden by contract."

**Error recovery:**

> "Methods may throw on failure. The contract does NOT specify error recovery semantics — strategies that need transactional recovery (e.g., retry-on-error with exponential backoff) implement recovery within their own method bodies. Implementers should not assume the caller will retry; methods should leave `deployedDiamondData` in a consistent state even when throwing (mutations made before the throw are visible)."

### §2.3 — Security Boundaries

**Design specification:**

**Architecture:** Contract specifies **post-conditions** that conforming implementations must satisfy; `BaseDeploymentStrategy` extension is the **recommended-but-not-required** implementation pattern. External strategies that implement `IDeploymentStrategy` directly are valid as long as they satisfy contract post-conditions.

**Post-conditions per method:**

| Method                                     | Post-condition                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deployDiamond` (returns)                  | `diamond.getDeployedDiamondData().DiamondAddress` is set to a non-zero address; `DeployedFacets['DiamondCutFacet']` is populated with `{ address, tx_hash, version: 0, funcSelectors }`                                                                                                  |
| `deployFacets` (returns)                   | For each facet in `getDeployConfig().facets` with a target version > current deployed version: `getNewDeployedFacets()[facetName]` is populated with `{ priority, address, tx_hash, version, funcSelectors, deployInclude, deployExclude, initFunction, verified }`                      |
| `updateFunctionSelectorRegistry` (returns) | `diamond.functionSelectorRegistry` reflects all new facet additions; any selectors for retired facets carry `RegistryFacetCutAction.Remove`; no orphaned selectors (selectors with `Add`/`Replace`/`Deployed` action whose `facetName` matches another entry with a different `address`) |
| `performDiamondCut` (returns)              | The diamond contract on-chain reflects all facet cuts in the registry; `deployedDiamondData.DeployedFacets` is updated to reflect the post-cut state; `deployedDiamondData.protocolVersion` matches the config's protocolVersion                                                         |
| `runPostDeployCallbacks` (returns)         | All registered callbacks for facets in the new deployment have executed (or the strategy threw mid-callback)                                                                                                                                                                             |
| All 10 `pre*` and `post*` hooks            | No post-conditions (extension hooks; implementer-defined behavior)                                                                                                                                                                                                                       |

**Trust assumptions (interface-level JSDoc — visible to auditors):**

The contract assumes implementers honor these properties. The contract cannot enforce them at the type or runtime level; making the assumptions explicit lets auditors assess specific implementers against them.

| Assumption                              | What it means for implementers                                                                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Honest about state mutations**        | The implementer doesn't construct a "shadow" `Diamond` object and update the real one with falsified data. The implementer uses the real `diamond` parameter as the state surface. |
| **Correct about on-chain transactions** | If the implementer claims a transaction succeeded (records a tx hash), it did. The recorded tx hash is real.                                                                       |
| **Single-Signer discipline**            | All on-chain calls go through `diamond.getSigner()`. The implementer doesn't construct a separate Signer mid-execution.                                                            |
| **Lifecycle ordering respected**        | Within a phase, pre/main/post are called by `DiamondDeployer` in order; the implementer doesn't reorder them via its own logic.                                                    |

**Phase 6 verification note:** The conformance test suite (§2.4) verifies the post-conditions mechanically. The trust assumptions are not mechanically verifiable; they are auditor-relevant context.

### §2.4 — Conformance Scope

**Design specification:**

**Conformance test suite: 17 tests across 3 categories.**

#### Category 1 — Lifecycle compliance (5 tests)

| Test ID | What it verifies                                                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-L-01  | All 15 lifecycle methods are present on the strategy implementation (TypeScript type-check)                                                                                         |
| C-L-02  | Methods are called in the contract-specified order when invoked through `DiamondDeployer`                                                                                           |
| C-L-03  | Within each phase, pre → main → post ordering holds                                                                                                                                 |
| C-L-04  | Methods marked idempotent return without error when called twice with same input; observable state is identical                                                                     |
| C-L-05  | Methods marked non-idempotent (`deployDiamond`, `performDiamondCut`) may throw on second invocation OR are guarded by the implementer; the test verifies guard or accepts the throw |

#### Category 2 — Post-condition compliance (7 tests)

| Test ID | What it verifies                                                                       |
| ------- | -------------------------------------------------------------------------------------- |
| C-P-01  | After `deployDiamond`, `deployedDiamondData.DiamondAddress` is a non-zero address      |
| C-P-02  | After `deployDiamond`, `DeployedFacets['DiamondCutFacet']` is populated                |
| C-P-03  | After `deployFacets`, `getNewDeployedFacets()` is populated for each upgradeable facet |
| C-P-04  | After `updateFunctionSelectorRegistry`, no orphaned selectors exist                    |
| C-P-05  | After `performDiamondCut`, the on-chain diamond reflects all facet cuts                |
| C-P-06  | After `performDiamondCut`, `deployedDiamondData.protocolVersion` matches config        |
| C-P-07  | After `runPostDeployCallbacks`, all registered callbacks have executed                 |

#### Category 3 — Edge case handling (5 tests)

| Test ID | What it verifies                                                                                                                                                                                                           |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-E-01  | **Partial-deployment recovery** — strategy invoked twice with a `Diamond` where Phase 1+2 completed but Phase 3 was interrupted; second invocation completes the deployment without re-deploying Phase 1+2 artifacts       |
| C-E-02  | **Deployment-record migration** — strategy invoked against a `Diamond` with v1 `deployedDiamondData`; strategy produces v2 `deployedDiamondData` with v1 data preserved appropriately and v2 changes applied               |
| C-E-03  | **Multi-call mid-phase failure (deployFacets)** — within `deployFacets`, simulate one facet deployment failing; verify `deployedDiamondData` reflects the facets that did deploy and doesn't claim the failed one deployed |
| C-E-04  | **Multi-call mid-phase failure (performDiamondCut)** — within `performDiamondCut`, simulate cut transaction failure; verify `deployedDiamondData` doesn't claim a cut that didn't happen                                   |
| C-E-05  | **Empty deployment** — strategy invoked with a `Diamond` config that has zero facets; verify the strategy doesn't throw and produces a valid (empty-facets) deployment record                                              |

**Conformance harness location:**

- Lives in the Diamonds repo at `src/strategies/__conformance__/` (or equivalent — Phase 5 implementation detail)
- Published as `@diamondslab/diamonds/conformance` sub-export (Phase 5 chooses the npm packaging mechanism)
- Implementation-agnostic: tests verify the contract surface, not the inheritance pattern; works for any class claiming to implement `IDeploymentStrategy`

**Three purposes the conformance suite serves:**

1. **Self-conformance** — Diamonds' own CI runs the suite against `LocalDeploymentStrategy`, `RPCDeploymentStrategy`, and `LoggingDeploymentStrategy` (the worked sibling example). If any fails conformance, Diamonds caught it before release.
2. **Contract regression detection** — when Diamonds changes the contract in a future cycle, Diamonds' own strategies must still pass. If they don't, the contract change broke `BaseDeploymentStrategy` or its subclasses, and the contract-change cost becomes visible.
3. **External conformance** — external strategy authors run the same suite against their implementations. They get verifiable evidence of conformance, and when Diamonds updates the contract (new version of `@diamondslab/diamonds`), external authors run their conformance against the updated suite to find any new breakage.

**Conformance suite versioning:**

- v2.0 contract ships v1.0 of the conformance suite
- Future v2.1 that adds a new lifecycle method ships v1.1 of the conformance suite (additive — old strategies still pass)
- Future v3.0 that changes contract semantics ships v2.0 of the conformance suite (breaking — old strategies must update to claim v3.0 conformance)

**Execution discipline:**

- **Per-PR (Diamonds CI):** Category 1 (C-L-_, 5 tests) + Category 2 (C-P-_, 7 tests) = 12 tests
- **Pre-release (Diamonds CI on tag push or release branch):** Category 3 (C-E-\*, 5 tests) = 5 tests
- **Release-evidence (MC-12 brief):** Full 17-test run output included in v2.0 release-evidence artifact

External strategy authors are encouraged to follow the same execution discipline against their implementations.

### §2.5 — Worked Reference Implementation

**Design specification:**

**Strategy: `LoggingDeploymentStrategy`**

- Extends `BaseDeploymentStrategy`
- Demonstrates extension via pre/post lifecycle hooks
- Useful real-world artifact: structured logging for debugging deployment workflows

**Logging scope:**

| What is logged                                      | When                                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Lifecycle event: method entry                       | At the start of each of the 15 lifecycle methods                                              |
| Lifecycle event: method exit                        | At successful return of each of the 15 lifecycle methods                                      |
| Lifecycle event: method throw                       | At thrown error from any method (with error class + message; not full stack trace by default) |
| State transition: deployment-record update          | Each call to `diamond.updateDeployedDiamondData(...)`                                         |
| State transition: function-selector-registry update | Each `Add`/`Replace`/`Remove` operation on the registry                                       |
| On-chain transaction hash                           | Each `deploy()`, `diamondCut()`, callback transaction submission                              |

**Log format:** Structured (specific format — JSON, key-value, structured-text — is a Phase 5 implementation choice based on existing `BaseDeploymentStrategy` logging conventions). Each log line includes: timestamp, diamond name, phase, method, event type, structured payload.

**Sensitive-field redaction:** Not in scope for v2.0. The worked example logs raw addresses and tx hashes. (A future strategy could add redaction discipline — this is intentional v1.0 scope.)

**Repository location:**

- **Ships in `src/strategies/`** alongside `LocalDeploymentStrategy` and `RPCDeploymentStrategy`
- External users `import { LoggingDeploymentStrategy } from '@diamondslab/diamonds'`
- **Brief walkthrough in `examples/logging-strategy/`** (1-2 pages): how `LoggingDeploymentStrategy` uses the extension hooks; the design decisions; conformance run output for the example

**Diamonds CI:** Conformance suite runs against `LoggingDeploymentStrategy` per the §2.4 execution discipline.

**NTI-03 / `diamonds-safe` framing (resolving VG-P3-U-02):**

> **The worked sibling example is NOT `SafeDeploymentStrategy` and is NOT the realization of NTI-03 / `diamonds-safe`.** It is a deliberately minimal example whose purpose is to **prove the contract is sufficient for external implementers**. Future-cycle work builds `diamonds-safe` once the contract exists in v2.0. This cycle produces:
>
> - The `IDeploymentStrategy` contract (the surface external strategies implement)
> - The worked sibling example (`LoggingDeploymentStrategy`) proving the contract is sufficient
> - The how-to-write-a-new-strategy reference doc (MC-07 brief Layer 3) referencing this contract + worked example
>
> Together these enable future-cycle `diamonds-safe` work without requiring this cycle to build it.

### §2.6 — Rejected Alternatives at Specification Level

| Decision                       | Alternatives Considered                                                                                                                        | Selected Option                                               | Why Other Options Rejected                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Method surface partition       | (i) Formalize all 15; (ii) Reduce to 5 main methods; (iii) Formalize all 15 with stratified JSDoc                                              | **(iii)**                                                     | (i) over-specifies; (ii) breaks existing extenders by dropping pre/post hooks from contract; (iii) preserves consumer expectations and gives clear extension partition |
| Interface naming               | (i) `IDeploymentStrategy`; (ii) Keep `DeploymentStrategy`; (iii) Rename to `DiamondDeploymentLifecycle`                                        | **(i)**                                                       | (ii) inconsistent with Plan §6.1 framing; (iii) outside MC-21's stated scope; (i) matches Plan                                                                         |
| Import surface                 | (i) Hard break only; (ii) Soft alias re-export; (iii) Hard break + migration doc                                                               | **(iii)**                                                     | (ii) accumulates technical debt + violates MC-21's clean-break discipline; (iii) is (i) with HC-05's per-item-justification discipline made explicit                   |
| Lifecycle ordering             | (i) 15-method strict order; (ii) 5-phase ordered, pre/main/post within-phase convention; (iii) Phase-only, pre/post implementation-dependent   | **(ii)**                                                      | (i) over-specifies; (iii) under-specifies; (ii) matches `BaseDeploymentStrategy` actual behavior                                                                       |
| Idempotency                    | (i) No idempotency guarantee; (ii) Per-method specification with two non-idempotent exceptions; (iii) Implementer's responsibility to document | **(ii)**                                                      | (i) loses retry-on-failure property; (iii) leaves readers without contract picture; (ii) captures `BaseDeploymentStrategy` behavior faithfully                         |
| Security boundary architecture | (i) JSDoc-only; (ii) JSDoc + protected method enforcement; (iii) JSDoc + post-condition conformance assertions                                 | **(iii)** at contract level + **(ii)** as recommended pattern | (i) doesn't help direct implementers; (ii) alone doesn't help non-Base implementers; (iii) provides "provably not bypass" at conformance test surface                  |
| Conformance test categories    | Various enumerations                                                                                                                           | **17 tests across 3 categories** (5 + 7 + 5)                  | Walkthrough produced consensus on the 17-test list; no alternative warranted separate elaboration                                                                      |
| Conformance harness location   | (i) Diamonds sub-export with runner; (ii) Reusable copy-into-own-repo pattern; (iii) Diamonds-internal only with documented pattern            | **(i)**                                                       | (ii) test logic drifts; (iii) doesn't produce verifiable evidence for externals; (i) is the only architecture producing "claims-vs-proof gap" narrowing                |
| Test execution discipline      | (i) All 17 per-PR; (ii) 12 per-PR + 5 pre-release; (iii) All 17 per-PR + nightly extended                                                      | **(ii)**                                                      | (i) per-PR runtime cost; (iii) two CI surfaces under HC-08 capacity envelope; (ii) pragmatic middle                                                                    |
| Worked example shape           | (i) `LoggingDeploymentStrategy`; (ii) `ExternalSignerDeploymentStrategy`; (iii) `MockDeploymentStrategy`; (iv) `JSONFileDeploymentStrategy`    | **(i)**                                                       | (ii) HW/KMS dimension grows beyond minimal; (iii) "fake the contract" wrong message; (iv) novel and untested; (i) clean demonstration + useful artifact                |
| Logging scope                  | (i) Lifecycle-only; (ii) Lifecycle + state transitions; (iii) Lifecycle + state + redaction                                                    | **(ii)**                                                      | (i) doesn't demonstrate A.3 state-mutation surface; (iii) redaction is own design exercise; (ii) shows both lifecycle and contract's state-mutation surface            |
| Worked example location        | (i) Ships in `src/strategies/`; (ii) Lives in `examples/`; (iii) Hybrid — ships + brief walkthrough                                            | **(iii)** with soft take                                      | (i) misses educational opportunity; (ii) less integrated; (iii) class ships + brief 1-2 page walkthrough in examples/                                                  |

---

## §3 — Phase 5 Estimate Refinement

**Three-quantity cost model refinement** (per Phase 2 v1.1 discipline; multipliers BELIEVED at v1.0):

| Quantity                              | Phase 2 Estimate | Phase 3 Refined Estimate | Tag       | Rationale                                                                                                                                                                                                                                                                               |
| ------------------------------------- | ---------------: | -----------------------: | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dev-hours                             |        24 (± 12) |             **26 (± 4)** | ESTIMATED | Decomposition: interface JSDoc authoring 6 dev-hrs; conformance suite 17 tests at ~1 dev-hr each = 17 dev-hrs; `LoggingDeploymentStrategy` + walkthrough 3 dev-hrs. Refinement narrowed the uncertainty band because the 17-test enumeration and worked-example shape are now concrete. |
| AI-acceleration multiplier (category) |  3× novel-design |      **3× novel-design** | BELIEVED  | Specification-heavy work; novel-design category continues to apply. No Phase 5 calibration data yet to upgrade tag.                                                                                                                                                                     |
| Derived maintainer-hours              |              8.0 |                 **~8.7** | ESTIMATED | 26 ÷ 3 = 8.67. Within Plan §6.1's stated ±12 dev-hour band, slightly above the 8.0 central estimate.                                                                                                                                                                                    |
| Token-count (derived)                 |             144K |                **~156K** | ESTIMATED | 26 dev-hrs × 6,000 tokens/hr = 156K.                                                                                                                                                                                                                                                    |
| Token-cost (derived)                  |            $3.50 |               **~$3.90** | ESTIMATED | 156K × $2.50/100K = $3.90.                                                                                                                                                                                                                                                              |

**Net effect of refinement:** Estimate central value rose ~9% (8.0 → 8.7 maint-hrs), but the uncertainty band narrowed from ±12 dev-hours to ±4 dev-hours. The refinement reduces cost _risk_ without reducing cost — consistent with Plan §6.1's Branch 1 mitigation intent (surface edge cases at design time, not implementation time).

**Capacity impact:** Diamonds' ~2 hr/week share — 8.7 maint-hrs is ~4 weeks of work for MC-04 alone. Fits within Plan §3's Tier 2 envelope (~12 weeks total).

**Multiplier graduation note:** The 3× novel-design multiplier remains BELIEVED. Phase 5 execution of MC-04 will produce the first empirical data point for novel-design category multiplier (per Plan §10.4 Phase 7 Calibration Handoff). If Phase 5 actual dev-hours-vs-maint-hours ratio differs from 3×, that's calibration data for graduating BELIEVED → ESTIMATED → MEASURED.

---

## §4 — Cross-Brief References

| Related Brief             | Relationship                                                                         | Reference                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MC-21 brief**           | Provides post-refactor interface that this contract reflects                         | §2.1 method surface inherits post-MC-21 `RPCDeploymentStrategy` shape; the contract IS the post-MC-21 interface                                                                                            |
| **MC-07 brief (Layer 3)** | Receives this specification as input for "how-to-write-a-new-strategy" reference doc | MC-07's Layer 3 reference doc set will include a writing-a-new-strategy guide referencing this contract spec; `examples/logging-strategy/` walkthrough sits adjacent to MC-07's example-colocation pattern |
| **Observability brief**   | Will insert touchpoints at this contract's lifecycle methods                         | The 15 lifecycle methods are natural observability insertion points; the Observability brief chooses which methods get touchpoints at what depth                                                           |
| **Verification brief**    | Refines the 17 conformance tests into Phase 6-executable instruments                 | Step 05's Verification Strategy refines test enumeration (test cases, inputs, expected outputs, verification predicates) for each of the 17; this Step 03 specification is the source                      |
| **MC-12 brief**           | Release-evidence schema includes conformance suite version + run output              | MC-12's release-evidence artifact layout will include conformance run results; this Step 03 specification provides the "what gets included" half                                                           |

---

## §5 — Per-Artifact Principle Scorecard Contribution

| Principle                | Weight (Inherited) | Per-Artifact Rating | Rationale                                                                                                                                                                                                                                                                        |
| ------------------------ | -----------------: | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security                 |               1.5× | **PASS**            | §2.3 post-condition specification provides "provably not bypass" via conformance test; trust assumptions enumerated explicitly in JSDoc; conformance test Category 2 verifies deployment-record-writing path is exercised                                                        |
| Maintainability          |               1.5× | **PASS**            | §2.1 stratified JSDoc partitions "must understand" (5 main methods) from "may extend" (10 pre/post hooks); §2.4 conformance harness as sub-export = contract-regression detection mechanism; §2.6 rejected alternatives documented prevent future-cycle re-litigation            |
| Economics                |               1.0× | **PASS**            | §3 Phase 5 estimate refinement produced; refined estimate within Plan §6.1's ±12 dev-hour band; capacity envelope (Plan §3) preserved                                                                                                                                            |
| Operations               |               1.0× | **PASS (baseline)** | Baseline weight preserved (no silent elevation); Observability brief will produce touchpoint design for this contract's lifecycle methods; contract's lifecycle methods are natural observability insertion points                                                               |
| Scoring & Metrics        |               1.0× | **PASS**            | Per-artifact scoring discipline applied (this scorecard); §2.4 conformance test count (17) and execution discipline (12 PR + 5 release) provide measurable artifacts; §3 estimate refinement produces measurable cost-vs-budget evidence                                         |
| Correctness Verification |               1.5× | **PASS**            | §2.4 conformance suite is the central CV instrument — produces verifiable evidence of contract conformance; §2.3 post-conditions are the verification predicates; the Verification brief (later Step 03 iteration) will further refine the 17 tests into Phase 6-executable form |

**Weight-sensitivity flags:**

- **Highest sensitivity:** Security (1.5×) and Correctness Verification (1.5×) — A.3 + A.4 decisions could have moved these scores materially. A weaker A.3 (Option i JSDoc-only) or smaller A.4 conformance scope would have produced CONDITIONAL. The strong A.3 + A.4 decisions hold both at PASS.
- **Medium sensitivity:** Maintainability (1.5×) — A.1 stratification was the key call; without it, the contract surface could have ended up either over-rigid or under-specified, moving Maintainability to CONDITIONAL.
- **Lower sensitivity:** Economics, Operations, Scoring & Metrics — design decisions had limited material effect on these principle scores at the artifact level.

**Below-threshold flags:** None. All six principles at PASS.

---

## §6 — Phase 2 Invalidation Check

| Field                                                          | Result         |
| -------------------------------------------------------------- | -------------- |
| Does this specification reveal Phase 2 mechanism invalidation? | **No**         |
| If Yes, invalidation report attached                           | Not applicable |

The Phase 2 chosen mechanism (Formal TypeScript `IDeploymentStrategy` interface + lifecycle methods + JSDoc security-boundary annotations + contract conformance test suite + worked sibling-strategy example) was specifiable at design level. Each Phase 2 Plan §6.1 design question received a concrete answer:

- Q1 (lifecycle methods specifics) → §2.1 + §2.2: 15 methods formalized with 5-phase ordering
- Q2 (JSDoc security-boundary semantics) → §2.3: post-conditions + trust assumptions
- Q3 (conformance test scope) → §2.4: 17 tests across 3 categories
- Q4 (worked sibling example shape) → §2.5: `LoggingDeploymentStrategy`
- Q5 (NTI-03 interaction) → §2.5 + Step 01 Category 11 clarification: diamonds-safe NOT built this cycle; contract + example + migration doc enable future-cycle work

---

## §7 — Phase 5 Implementability Check

| Field                                                            | Result                                      |
| ---------------------------------------------------------------- | ------------------------------------------- |
| Can Phase 5 implement from this specification without ambiguity? | **Yes, with five pre-implementation tasks** |

### §7.1 — Implementability Pre-Implementation Tasks

| Pre-Implementation Task                                                                                      | Type                  | Resolution                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact TypeScript signatures for the 15 methods (return types, parameter type imports)                        | Implementation detail | Phase 5 reads `BaseDeploymentStrategy.ts` and matches existing signatures; only the interface name changes to `IDeploymentStrategy`                                                                     |
| JSDoc tag formatting conventions (`@since`, `@param`, `@returns`, `@throws`)                                 | Implementation detail | Phase 5 follows existing TypeScript JSDoc conventions in the Diamonds codebase; MC-07 brief Layer 3 reference doc style guide may inform                                                                |
| Conformance test framework choice (Mocha + Chai vs Jest vs Vitest)                                           | Implementation detail | Phase 5 reads existing test setup (per `docs/testing-guide.md`) and continues with the established framework                                                                                            |
| Conformance suite sub-export build configuration (`package.json` `exports` field, separate `tsconfig`, etc.) | Implementation detail | Phase 5 chooses the npm packaging mechanism for the `@diamondslab/diamonds/conformance` sub-export; the design specification states "sub-export," not the packaging mechanism                           |
| `LoggingDeploymentStrategy` log format (JSON vs key-value vs structured-text)                                | Implementation detail | Phase 5 chooses based on existing logging patterns in `BaseDeploymentStrategy` (which currently uses `chalk` + `console.log`); the design specification states "structured logs," not a specific format |

These five items are Phase 5 implementation choices, not design-level decisions. Phase 5 can begin implementation without re-litigating design.

---

## §8 — Forward Handoff Notes

| Recipient Phase               | What This Specification Provides                                                                                                                                                                                            | What Recipient Phase Must Do With It                                                                                                                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 4 (Architecture)**    | The contract surface (15 methods, ordering, post-conditions, trust model) anchors the module-boundary discussion for the v2.0 strategies subsystem; the conformance suite sub-export location anchors the package structure | Phase 4 decides: where in the module structure the conformance harness lives; how the sub-export integrates with existing package boundaries; module-boundary changes that flow from the `DeploymentStrategy` → `IDeploymentStrategy` rename                                |
| **Phase 5 (Implementation)**  | The complete design specification: methods, ordering, semantics, security boundaries, conformance scope, worked example shape, rejected alternatives                                                                        | Phase 5 implements the `IDeploymentStrategy` interface, the JSDoc, the conformance suite (17 tests), `LoggingDeploymentStrategy`, the `examples/logging-strategy/` walkthrough, and the migration doc (jointly with MC-21 brief's migration coverage)                       |
| **Phase 6 (Testing & Audit)** | The 17 conformance tests are the verification instruments (Step 05 will further refine into Phase 6-executable form); the test execution discipline (12 PR + 5 pre-release) is the gate definition                          | Phase 6 executes the 17-test suite as part of v2.0 release validation; verifies the conformance suite catches at least the 12 + 5 tests at the appropriate gate; runs the suite against `LocalDeploymentStrategy`, `RPCDeploymentStrategy`, and `LoggingDeploymentStrategy` |

---

## §9 — Cross-Brief References (Detailed)

See §4 above. Step 04 (Inter-Artifact Coordination) consumes this section to verify bidirectional consistency with other briefs.

---

## §10 — Confidence and Code-Access Notes

| Field                            | Value                                          |
| -------------------------------- | ---------------------------------------------- |
| Code-access mode (from Step 00)  | Hybrid with explicit flags                     |
| Code-derived claims flagged with | [CONFIRM] / [AWARE] / [QUESTION] as applicable |
| Overall specification confidence | High                                           |
| Specific low-confidence sections | None                                           |

**Code references in this specification:**

- `src/strategies/DeploymentStrategy.ts` [CONFIRM — fetched 2026-05-26]
- `src/strategies/BaseDeploymentStrategy.ts` [CONFIRM — fetched 2026-05-26]
- `src/strategies/LocalDeploymentStrategy.ts` [AWARE — code search result; not separately fetched]
- `src/strategies/RPCDeploymentStrategy.ts` [AWARE — code search result; not separately fetched]
- `src/core/DiamondDeployer.ts` [AWARE — code search result; inferred lifecycle invocation pattern from `BaseDeploymentStrategy.ts`]

---

## Version History

| Version | Date       | Source                                                   | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------- | ---------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-05-26 | Initial Step 03 production via Sub-Template A (Contract) | 17 specification-level decisions captured across A.1–A.6 (Method Surface 3; Lifecycle Semantics 3; Security Boundaries 2; Conformance Scope 3; Worked Reference Implementation 3; Rejected Alternatives 12 in summary table). Per-artifact principle scorecard: 6 PASS / 0 CONDITIONAL / 0 FAIL. Phase 2 invalidation: No. Phase 5 implementability: Yes with 5 pre-implementation tasks. Phase 5 estimate refinement: 8.0 → 8.7 maint-hrs (~9% increase, ±4 dev-hour band narrowed from ±12). VG-P3-U-02 carryover resolved (diamonds-safe NOT built this cycle; explicitly stated in §2.5). |

---

_Part of the Phase 3 (Existing Projects) Design & Technical Analysis Tool Set — v1.0_
_AI-Centric Software Development Playbook_
_Companion file: `design-technical-analysis.existing-project.instructions.md`_
_Previous step: `step-02-design-brief-triage.prompt.md`_
_Next brief in Step 03 iteration sequence: MC-21 brief (Refactor sub-template)_
