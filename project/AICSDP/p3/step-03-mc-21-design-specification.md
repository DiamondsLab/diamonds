# Design Specification Artifact — MC-21 brief

**Brief ID:** MC-21 brief
**Source MC(s):** MC-21 (Private key refactored out of RPCDeploymentStrategy constructor)
**Origin:** Plan §6.2 (primary)
**Primary Artifact Type:** Refactor
**Secondary Type:** None
**Specification Date:** 2026-05-26
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Improvement Plan Version:** v1.0 (2026-05-22, no amendments)
**Step 02 Register Reference:** Step 02 §2.2 (MC-21 brief)
**Status:** Draft — Pending Practitioner Final Review

> ⚠️ This artifact specifies the chosen mechanism at design level.
> It is Phase-5-implementable without further design work. Phase 4
> architecture decisions, Phase 5 implementation details, and Phase
> 6 verification execution are out of scope.

---

## §1 — Brief Intake Confirmation

| Field                                                                                      | Value                                                                                                                                                                                                  | Confirmed                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| Brief ID                                                                                   | MC-21 brief                                                                                                                                                                                            | Yes                                  |
| Phase 2 chosen mechanism (full text)                                                       | "Clean break — v2.0 `RPCDeploymentStrategy` constructor takes `signer: Signer` instead of `privateKey`; no shim." (Plan §6.2)                                                                          | Yes                                  |
| Plan §6.2 design questions                                                                 | Q1: Exact `Signer` interface signature; Q2: Signer source examples; Q3: Internal-architecture implications; Q4: Interaction with MC-04 contract                                                        | Yes — all four addressed in §2 below |
| Inherited constraints                                                                      | SR-03 (private-key-in-constructor risk); MK-01 (deployment record format unchanged)                                                                                                                    | Yes                                  |
| Verification method named in Plan                                                          | v2.0 constructor type signature accepts no `privateKey`; Signer-injection works with `Wallet`, mock Signer, and one external Signer source; deployment records byte-identical to v1.3.2 for same input | Yes                                  |
| Artifact type (primary)                                                                    | Refactor — confirmed against Step 02 §2.2 classification                                                                                                                                               | Yes                                  |
| Step 01 §11.1 gap carryover (if any) — resolved                                            | None                                                                                                                                                                                                   | Yes                                  |
| Step 02 §7 carryover (VG-P3-U-01 — Phase 2 Step 03 §2 detail missing for MC-21) — resolved | Inferred rejected alternative (deprecation cycle with shim) made explicit in §2.5 Rejected Approaches                                                                                                  | Yes                                  |

---

## §2 — Design Specification

### §2.1 — Pre-Refactor Interface

**Design specification:** Anchored in `src/strategies/RPCDeploymentStrategy.ts` at v1.3.2.

| Element                        | v1.3.2 shape                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Class name                     | `RPCDeploymentStrategy`                                                                                                                                            |
| Constructor signature          | `constructor(rpcUrl: string, privateKey: string, gasLimitMultiplier: number = 1.2, maxRetries: number = 3, retryDelayMs: number = 2000, verbose: boolean = false)` |
| Private key validation         | `/^0x[a-fA-F0-9]{64}$/` regex in `validateConstructorInputs(...)`                                                                                                  |
| Provider construction          | `this.provider = new JsonRpcProvider(rpcUrl)` inside constructor body                                                                                              |
| Signer construction            | `this.signer = new ethers.Wallet(privateKey, this.provider)` inside constructor body                                                                               |
| Public methods exposing Signer | `getSigner(): Signer` — already public                                                                                                                             |
| Configuration exposure         | `getConfig()` returns `{ rpcUrl, signerAddress, gasLimitMultiplier, maxRetries, retryDelayMs, verbose }`                                                           |

**v1.3.2 invariants the pre-refactor interface provides:**

1. **MK-01:** Same deployment config + same network state produces deployment records with the same JSON schema (structure)
2. **Signer identity:** The Signer used for all on-chain calls is derived from the constructor's `privateKey`; single-Signer discipline
3. **RPC connection:** All on-chain calls go through the constructor's `rpcUrl` via the bound Provider
4. **Validation:** Constructor rejects invalid `privateKey` formats, invalid `gasLimitMultiplier` ranges, invalid retry counts, invalid retry delays — fails fast

**Current consumers (within Diamonds repo; no external adopters per Phase 1 baseline):**

- Test fixtures in `tests/`
- Example deployment scripts in `examples/`
- Zero production consumers external to Diamonds

### §2.2 — Post-Refactor Interface

**Design specification (v2.0):**

```typescript
class RPCDeploymentStrategy extends BaseDeploymentStrategy {
  constructor(
    signer: Signer, // ethers Signer abstract type
    gasLimitMultiplier: number = 1.2,
    maxRetries: number = 3,
    retryDelayMs: number = 2000,
    verbose: boolean = false,
  );

  getSigner(): Signer; // unchanged
  getProvider(): Provider; // base type (was JsonRpcProvider)
  getConfig(): {
    signerAddress: string; // unchanged (derived from signer.getAddress())
    gasLimitMultiplier: number;
    maxRetries: number;
    retryDelayMs: number;
    verbose: boolean;
    // rpcUrl REMOVED
  };
  // ... lifecycle methods inherited from BaseDeploymentStrategy (unchanged)
}
```

**Constructor changes:**

| Change                                                                 | Detail                                                                                                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Replace `rpcUrl: string, privateKey: string`                           | with `signer: Signer` (ethers v6 abstract type)                                                                                                                     |
| Remove `validateConstructorInputs` rpcUrl check                        | (no longer needed)                                                                                                                                                  |
| Remove `validateConstructorInputs` privateKey regex check              | (no longer needed)                                                                                                                                                  |
| Add `validateConstructorInputs` signer.provider null check             | Throws clear error: "Signer must have a Provider. Did you pass a disconnected Wallet? Use `new ethers.Wallet(privateKey, provider)` or `signer.connect(provider)`." |
| Remove Provider construction (`new JsonRpcProvider(rpcUrl)`)           | Provider derived from `signer.provider`                                                                                                                             |
| Remove Signer construction (`new ethers.Wallet(privateKey, provider)`) | Signer is passed in directly                                                                                                                                        |

**Internal field changes:**

- Remove `private rpcUrl: string`
- Remove `private privateKey: string` (was already implicitly removed — the field was a constructor parameter shorthand)
- Keep `private signer: Signer` (assigned from constructor parameter)
- Keep `private provider: Provider` (derived from `signer.provider`)

**Public accessor changes:**

- `getSigner(): Signer` — return type unchanged; returns the injected Signer
- `getProvider(): Provider` — return type changed from `JsonRpcProvider` to `Provider` (base type); honestly reflects that any Provider-backed Signer is accepted
- `getConfig()` — drops the `rpcUrl` field entirely; the v2.0 class isn't RPC-URL-driven and the field is misleading

**Class name decision:** **Keep `RPCDeploymentStrategy`** for v2.0. Renaming a second class on top of MC-21's other changes adds churn for low semantic benefit. The class name reflects its dominant use case (RPC-backed deployments) even though the constructor accepts any Provider-backed Signer. A future cycle could rename if external adopters surface and the framing becomes confusing.

### §2.3 — Invariants Preserved

**Three invariants preserved through the refactor:**

#### Invariant 1: MK-01 structural byte-identity

> **Statement:** The `deployedDiamondData.json` produced by `RPCDeploymentStrategy` v2.0 has byte-identical _structure_ to v1.3.2 (same JSON keys, same nesting, same field types) for the same `Diamond` configuration. Field _values_ (addresses, tx hashes) differ between deployment instances by definition of on-chain deployment.

**What's preserved:**

- Same set of `DeployedFacets` keys (facet names)
- Same field set per facet (`{ address, tx_hash, version, funcSelectors }`)
- Same selector arrays per facet (depend on facet ABI, not Signer identity)
- Same `protocolVersion` field
- Same `DeployerAddress` field name (value will be the new Signer's address; field name preserved)

**What's not preserved (and isn't expected to be):**

- `tx_hash` values (deployment-instance-specific)
- `address` values for newly-deployed contracts (nonce-dependent)
- `DeployerAddress` _value_ (different Signer → different address)

**Verification instrument (refined in Step 05):** A test deploys the same `Diamond` config under v1.3.2 RPCDeploymentStrategy and v2.0 RPCDeploymentStrategy in two separate Hardhat forks; the resulting `deployedDiamondData.json` files are compared by JSON-structure equality (keys, types, array lengths) but not by value equality for address/tx_hash fields. The Phase 6 verification step runs this comparison and reports pass/fail.

#### Invariant 2: SR-03 closure

> **Statement:** The v2.0 `RPCDeploymentStrategy` constructor accepts no private key. The caller is responsible for Signer construction (and therefore key management). This closes Phase 1 finding SR-03 by design — the type signature makes it structurally impossible for a private key to enter Diamonds' process memory through this class.

**Closure mechanism:**

- **TypeScript type system enforcement** — The constructor parameter type is `Signer` (an abstract class); no string parameter named `privateKey` exists. The type system prevents passing a string-typed private key.
- **JSDoc documentation** — Constructor JSDoc states: _"This strategy never accepts or stores a private key. The caller constructs the Signer (using their preferred key management approach) and passes it to the constructor. This closes Phase 1 finding SR-03 by design — the type signature makes it structurally impossible for a private key to enter Diamonds' process memory through this class."_
- **MC-04 conformance** — The conformance test suite (per MC-04 brief §2.4) verifies the contract surface; no test in the suite exercises a `privateKey` parameter because none exists.

**No new CI infrastructure required** — the closure is structural, not test-verified.

#### Invariant 3: Wallet-equivalent performance

> **Statement:** When constructed with an `ethers.Wallet`-backed Signer, performance characteristics are equivalent to v1.3.2. With externally-managed Signers (KMS, hardware wallet), per-transaction signing latency may be higher; this is outside the strategy's control and depends on the Signer source's characteristics.

**Documentation location:** Constructor JSDoc.

**No benchmark verification** — performance is not the refactor's primary axis; benchmarks would add brittle CI tests for a property the refactor doesn't intend to change.

### §2.4 — Migration Path

**Internal landing sequence: atomic single-PR.**

The full refactor lands in a single v2.0 PR containing:

- `RPCDeploymentStrategy` class changes (constructor, validation, fields, accessors, JSDoc)
- Test fixture updates throughout `tests/` (mechanical search-and-update for `new RPCDeploymentStrategy(...)` construction sites)
- Example script updates in `examples/` (same mechanical pattern)
- Migration doc co-authored with MC-04 brief (single artifact at `examples/migration-v1-to-v2.md`)
- Co-authored alongside MC-04's `IDeploymentStrategy` rename PR (Step 04 coordination work will formalize the coordinated landing cohort — MC-04 + MC-21 + MC-22 + MC-13 per Plan §5.2)

**Why atomic landing:** Aligns with MC-21's clean-break discipline (Plan §6.2: "no shim"). No intermediate broken state on the feature branch; CI verifies the full refactor before merge.

**Consumer migration steps (for external future adopters):**

| Step                  | v1.3.2 code                                                                             | v2.0 code                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1. Construct Provider | (implicit — strategy constructed it from rpcUrl)                                        | `const provider = new JsonRpcProvider(rpcUrl)` (or other Provider)                                     |
| 2. Construct Signer   | (implicit — strategy constructed Wallet from privateKey)                                | `const signer = new ethers.Wallet(privateKey, provider)` (or KMS Signer, hardware-wallet Signer, etc.) |
| 3. Construct strategy | `new RPCDeploymentStrategy(rpcUrl, privateKey, gasMultiplier, retries, delay, verbose)` | `new RPCDeploymentStrategy(signer, gasMultiplier, retries, delay, verbose)`                            |

**Migration doc structure (jointly authored with MC-04 brief; lives at `examples/migration-v1-to-v2.md`):**

1. **Interface rename** (MC-04 coverage) — `DeploymentStrategy` → `IDeploymentStrategy`; import path updates
2. **Signer injection** (MC-21 coverage) — constructor signature change with rationale (SR-03 closure)
3. **Signer source examples** (MC-21 coverage):
   - **`ethers.Wallet`** — the v1.3.2 equivalent. Code example showing private-key-backed Signer construction.
   - **Mock Signer for tests** — for Diamonds' own test suite + downstream test suites. Code example.
   - **AWS KMS Signer** — the external Signer demonstration. Code example showing KMS configuration + Signer construction + Diamond deployment. Realistic production use case; demonstrates SR-03 closure benefit concretely.

**Internal-architecture cascade analysis (Plan §6.2 design question 3):**

Reading of `src/strategies/RPCDeploymentStrategy.ts` and `src/strategies/BaseDeploymentStrategy.ts` reveals:

1. `privateKey` is referenced in exactly three places within `RPCDeploymentStrategy.ts`: constructor parameter, constructor body's `new ethers.Wallet(privateKey, this.provider)`, and `validateConstructorInputs` regex check. All three are replaced or removed by the refactor.
2. The class does NOT store `privateKey` as a field after construction.
3. Internal code paths use `this.signer` (a `Signer`), not anything privateKey-derived. All operations are `Signer`-interface calls, identical for any `Signer` implementation.
4. `BaseDeploymentStrategy` makes no `privateKey` assumptions; it accesses the Signer via `diamond.getSigner()`.
5. `Diamond.getSigner()` returns whatever Signer the strategy was given; the abstraction is already in place throughout.

**Conclusion: Internal-architecture cascade is minimal.** The `privateKey` concept is localized to the constructor + `validateConstructorInputs`. Removing it doesn't cascade. The Signer abstraction was already established throughout the codebase.

**Phase 5 pre-implementation task:** Phase 5 implementation does a final search-and-update pass on test files, example scripts, and any other consumers when the constructor signature changes. The pass is mechanical; compile errors flag every consumer that needs updating.

**Migration doc work attribution:** The migration doc work is attributed entirely to MC-04 brief's estimate (which captured "migration doc jointly authored with MC-21 brief's migration coverage" in MC-04 §3). For MC-21, the migration coverage is _coordinated_ but not separately _estimated_ — preventing double-counting across briefs. Step 04 Coordination Register will formalize this in the Shared Decisions section.

### §2.5 — Rejected Approaches

#### Mechanism-level rejected alternatives (inferred from Plan §6.2 + Phase 2 Step 03 §3.1 dependency table; explicit because Phase 2 Step 03 §2 detail for MC-21 is missing — see VG-P3-U-01)

| Alternative                                                                                                                                                                                                     | Why rejected                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Deprecation cycle with shim** — v2.0 accepts both old (`rpcUrl, privateKey`) and new (`signer`) constructor signatures, with the old signature emitting a deprecation warning; v3.0 removes the old signature | Diamonds has zero external adopters per Phase 1 baseline; the cost of carrying a shim (code maintenance, documentation burden, deprecation tracking) is non-zero while the user-facing benefit (smoother migration for external adopters) is essentially nil; clean break aligns with v2.0's coherent migration narrative (one v2.0 break covering MC-04 interface rename + MC-21 Signer injection, not multiple deprecation windows) |
| **Additive: keep `privateKey` constructor + add `signer` constructor overload** — Both constructors valid in v2.0+; users choose                                                                                | Same rationale as above (no external adopters; carrying the additive surface costs maintenance); also weakens the SR-03 closure because a `privateKey`-accepting constructor remains in the API surface                                                                                                                                                                                                                               |
| **Factory pattern** — Remove the public constructor entirely; replace with `RPCDeploymentStrategy.fromPrivateKey(...)` and `RPCDeploymentStrategy.fromSigner(...)` static factories                             | Larger surface change than Plan §6.2 specifies; the `fromPrivateKey` factory perpetuates SR-03 in a renamed form; doesn't actually close the finding                                                                                                                                                                                                                                                                                  |

#### Specification-level rejected alternatives (during this Step 03 design walkthrough)

| Decision                               | Alternatives Considered                                                                                                | Selected Option | Why Other Options Rejected                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signer interface signature             | (i) ethers `Signer` as-is; (ii) Diamonds-specific `IDiamondSigner` wrapper; (iii) Structural type                      | **(i)**         | (ii) over-abstraction for zero-external-adopter project; (iii) too low-level for constructor signature; (i) matches Plan §6.2 chosen mechanism and ethers v6 idiom                                                     |
| Provider relationship                  | (i) Provider from Signer; (ii) Constructor takes both; (iii) `rpcUrl` kept                                             | **(i)**         | (ii) two-parameter mismatch risk; (iii) `rpcUrl` doesn't generalize to non-RPC Signers (mock, KMS) which Plan §6.2 verification explicitly names                                                                       |
| Provider absence handling              | (i) Validate at construction; (ii) Validate at first use; (iii) TypeScript type narrowing                              | **(i)**         | (ii) defers failure unhelpfully; (iii) imposes type-narrowing burden on callers for marginal benefit; (i) matches existing `validateConstructorInputs` convention                                                      |
| `getProvider()` return type            | (i) Keep `JsonRpcProvider`; (ii) Return base `Provider`; (iii) Generic over Provider type                              | **(ii)**        | (i) contradicts B.2.2's "any Signer-with-Provider" framing; (iii) over-engineering for negligible benefit; (ii) honestly reflects what the v2.0 class accepts                                                          |
| `getConfig().rpcUrl` field             | (a) Drop entirely; (b) Best-effort derived; (c) Replace with `providerType`                                            | **(a)**         | (b) misleading when Provider isn't `JsonRpcProvider`; (c) adds a field for marginal benefit; (a) honestly reflects that the v2.0 class isn't RPC-URL-driven                                                            |
| Class name                             | Rename to e.g., `SignerDeploymentStrategy`; **Keep `RPCDeploymentStrategy`**                                           | **Keep**        | Renaming a second class on top of MC-21's other changes adds churn; class still talks to chains via RPC in the dominant case; existing `RPCStepRecord` / `RPCDeploymentStore` infrastructure aligns with the kept name |
| MK-01 byte-identity interpretation     | (i) Byte-identical including addresses; (ii) Structural identity; (iii) Replay-determinism                             | **(ii)**        | (i) unachievable for on-chain (nonce-dependent addresses); (iii) requires deterministic test env that's a higher bar than Plan §6.2 intends; (ii) is the actually-verifiable property                                  |
| SR-03 closure mechanism                | (i) JSDoc + code review; (ii) JSDoc + CI grep check; (iii) JSDoc + type system + MC-04 conformance                     | **(iii)**       | (i) too light on enforcement; (ii) brittle CI check; (iii) leverages existing mechanisms (TypeScript types, MC-04 conformance) without new infrastructure                                                              |
| Performance characteristics            | (i) Wallet-parity claim documented; (ii) No invariant, qualitative documentation; (iii) Benchmark in MC-04 conformance | **(i)**         | (ii) loses the "if not changing Signer source, performance unchanged" message; (iii) benchmarks are noisy and verify a non-changing property; (i) sets correct expectations                                            |
| Signer source examples (migration doc) | (i) KMS-backed; (ii) Hardware-wallet (Ledger); (iii) Browser-injected; (iv) Custom abstract mock                       | **(i)**         | (ii) Phase 6 verification needs hardware; (iii) mismatched to deployment scripts; (iv) too abstract; (i) realistic production case with stable library ecosystem (AWS KMS specifically)                                |
| Internal-architecture verification     | (i) Confirmed as analyzed; (ii) Fetch test files to verify; (iii) Defer to Phase 5 pre-implementation task             | **(iii)**       | (i) leaves Phase 5 less-explicit task surface; (ii) marginal additional confidence at fetch cost; (iii) documents finding + names Phase 5 task                                                                         |
| Internal landing sequence              | (i) Atomic single-PR; (ii) Phased class-first-then-consumers; (iii) Phased tests-first-with-shim                       | **(i)**         | (ii) intermediate broken state on branch; (iii) test shim contradicts clean-break framing; (i) aligns with MC-21's clean-break discipline                                                                              |
| Migration doc location                 | (a) Single doc covering MC-04 + MC-21; (b) Two separate docs; (c) Inside MC-07 Layer 3                                 | **(a)**         | (b) fragments the v2.0 migration narrative; (c) couples to MC-07 IA design that doesn't exist yet; (a) standalone artifact that MC-07's IA can reference                                                               |

### §2.6 — Phase 5 Estimate Refinement Outcome

**No refinement.** Phase 2's estimate of 2.4 maint-hrs ESTIMATED confirmed.

Design walkthrough surfaced no scope-changing edge cases. The refactor is genuinely localized to `RPCDeploymentStrategy.ts` constructor + `validateConstructorInputs`, with mechanical consumer updates in test/example files. The migration doc work is attributed to MC-04 brief's estimate to prevent double-counting (Step 04 Coordination Register formalizes this).

| Quantity                              | Phase 2 Estimate | Phase 3 Refined Estimate | Tag       |
| ------------------------------------- | ---------------: | -----------------------: | --------- |
| Dev-hours                             |              7.2 |      **7.2** (unchanged) | ESTIMATED |
| AI-acceleration multiplier (category) |  3× novel-design |      **3× novel-design** | BELIEVED  |
| Derived maintainer-hours              |              2.4 |      **2.4** (unchanged) | ESTIMATED |
| Token-count (derived)                 |             ~43K |     **~43K** (unchanged) | ESTIMATED |
| Token-cost (derived)                  |           ~$1.08 |   **~$1.08** (unchanged) | ESTIMATED |

---

## §3 — Phase 5 Estimate Refinement

See §2.6 above. Outcome: no refinement to MC-21's estimate; Plan §6.2's central estimate holds. Migration doc work attributed to MC-04 brief.

---

## §4 — Cross-Brief References

| Related Brief             | Relationship                                                                                                | Reference                                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MC-04 brief**           | Provides the contract surface; this refactor's post-state IS the contract; migration doc co-authored        | The 15 lifecycle methods in MC-04's contract reflect the post-MC-21 `RPCDeploymentStrategy` interface; the migration doc at `examples/migration-v1-to-v2.md` covers both MC-04 interface rename and MC-21 Signer injection |
| **MC-07 brief (Layer 3)** | Will produce reference docs for secure-key-handling and writing-a-new-strategy that reference this refactor | MC-07 Layer 3 secure-key-handling doc references the Signer-injection patterns; the writing-a-new-strategy doc references the post-refactor constructor pattern                                                            |
| **Observability brief**   | Will insert touchpoints at the refactored constructor / Signer-use points                                   | The constructor's `signer.provider` validation and the `validateConnection()` flow are natural observability insertion points; the Observability brief decides depth                                                       |
| **Verification brief**    | Refines the MK-01 structural byte-identity instrument into a Phase 6-executable form                        | Step 05's Verification Strategy refines the JSON-structure-equality test (test fixture choice, deterministic test environment configuration, comparison predicate)                                                         |
| **MC-12 brief**           | Release-evidence schema includes the v2.0 migration doc as part of release artifacts                        | MC-12's release-evidence artifact layout will name what release artifacts get bundled (the migration doc is one of them)                                                                                                   |

---

## §5 — Per-Artifact Principle Scorecard Contribution

| Principle                | Weight (Inherited) | Per-Artifact Rating | Rationale                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | -----------------: | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security                 |               1.5× | **PASS**            | §2.3 SR-03 closure via TypeScript type signature + JSDoc reference + MC-04 conformance — structural guarantee that private key never enters Diamonds' process memory through this class; the type system enforces what the original SR-03 finding asked Phase 2 to address                                                                                      |
| Maintainability          |               1.5× | **PASS**            | §2.2 post-refactor interface is cleaner than pre-refactor (one parameter `signer: Signer` replaces two parameters `rpcUrl` + `privateKey`); §2.5 rejected approaches documented prevent future-cycle re-litigation; migration doc co-authored with MC-04 produces coherent v2.0 migration narrative; §2.4 internal-architecture analysis showed minimal cascade |
| Economics                |               1.0× | **PASS**            | §2.6 estimate refinement produced no change; Phase 2's 2.4 maint-hrs estimate confirmed; migration-doc attribution clarified to prevent double-counting in Step 04 coordination work                                                                                                                                                                            |
| Operations               |               1.0× | **PASS (baseline)** | Baseline weight preserved; refactor doesn't change deployment semantics or observability surface; Observability brief will produce touchpoint design for the refactored constructor and Signer-use points                                                                                                                                                       |
| Scoring & Metrics        |               1.0× | **PASS**            | Per-artifact scoring discipline applied (this scorecard); 13 sub-decisions captured with rejected alternatives in §2.5; MK-01 structural identity invariant is the measurable verification surface                                                                                                                                                              |
| Correctness Verification |               1.5× | **PASS**            | §2.3 MK-01 structural byte-identity is a Phase 6-verifiable invariant; §2.3 SR-03 closure is structurally verified by TypeScript types + MC-04 conformance; the Verification brief (later iteration) will refine these into Phase 6-executable instruments                                                                                                      |

**Weight-sensitivity flags:**

- **Highest sensitivity:** Security (1.5×) — §2.3 SR-03 closure framing was the central call; without explicit closure documentation, Security could have been CONDITIONAL
- **Medium sensitivity:** Maintainability (1.5×) and Correctness Verification (1.5×) — §2.2 clean-break design and §2.3 MK-01 framing were key calls
- **Lower sensitivity:** Economics, Operations, Scoring & Metrics — design decisions had limited material effect on these principle scores

**Below-threshold flags:** None. All six principles at PASS.

---

## §6 — Phase 2 Invalidation Check

| Field                                                          | Result         |
| -------------------------------------------------------------- | -------------- |
| Does this specification reveal Phase 2 mechanism invalidation? | **No**         |
| If Yes, invalidation report attached                           | Not applicable |

The Phase 2 chosen mechanism (clean break — v2.0 constructor takes `signer: Signer`; no shim) was specifiable at design level. Each Phase 2 Plan §6.2 design question received a concrete answer:

- Q1 (exact Signer interface signature) → §2.2: ethers `Signer` abstract class as-is
- Q2 (Signer source examples for migration doc) → §2.4: `Wallet`, mock, AWS KMS
- Q3 (internal-architecture implications) → §2.4: minimal; localized; Phase 5 search-and-update pass for consumers
- Q4 (interaction with MC-04's extension contract) → §4 cross-brief references: contract reflects post-MC-21 interface; coordinated v2.0 landing

---

## §7 — Phase 5 Implementability Check

| Field                                                            | Result                                   |
| ---------------------------------------------------------------- | ---------------------------------------- |
| Can Phase 5 implement from this specification without ambiguity? | **Yes, with 2 pre-implementation tasks** |

### §7.1 — Phase 5 Pre-Implementation Tasks

| Pre-Implementation Task                                                                                                                                                                                                                                                                   | Type                  | Resolution                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search-and-update consumer files** — every test file and example script that constructs `RPCDeploymentStrategy(rpcUrl, privateKey, ...)` must change to `RPCDeploymentStrategy(new ethers.Wallet(privateKey, new JsonRpcProvider(rpcUrl)), ...)` (or equivalent for non-Wallet sources) | Mechanical task       | Phase 5 grep `RPCDeploymentStrategy(` across `tests/` and `examples/` and updates each construction site; §2.4 already established this is mechanical                                  |
| **AWS KMS Signer working example in migration doc** — the AWS KMS code example must be runnable; this requires choosing a specific KMS library (e.g., `aws-kms-ethers-signer` or building a minimal Signer subclass against AWS SDK) and producing a working example                      | Implementation detail | Phase 5 chooses the library based on current ecosystem state (Context7 lookup at implementation time recommended); the migration doc's KMS section is one of the last pieces to author |

Both items are appropriately deferred — tactical implementation choices, not design-level decisions.

---

## §8 — Forward Handoff Notes

| Recipient Phase               | What This Specification Provides                                                                                                                                                                                                                            | What Recipient Phase Must Do With It                                                                                                                                                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 4 (Architecture)**    | The post-refactor constructor signature; the `getProvider(): Provider` base-type accessor; the `getConfig()` field set without `rpcUrl`; the SR-03 closure framing                                                                                          | Phase 4 considers: whether the strategy class's module placement changes given the Signer-injection pattern (likely no — it stays in `src/strategies/`); whether `RPCStepRecord` / `RPCDeploymentStore` module boundary needs adjustment given the class name kept but the RPC framing softened (likely no) |
| **Phase 5 (Implementation)**  | The complete v2.0 spec: constructor change, validation rewrite, accessor changes, JSDoc covering SR-03 + performance + trust assumptions; atomic landing sequence; migration doc structure                                                                  | Phase 5 implements as a single coordinated PR: class changes + test/example updates + migration doc; co-authored with MC-04's brief work; CI verifies on the feature branch before merge                                                                                                                    |
| **Phase 6 (Testing & Audit)** | The MK-01 structural byte-identity verification instrument (JSON-structure-equality test); the SR-03 closure verification mechanism (TypeScript type system enforcement + MC-04 conformance); Wallet-equivalent performance is documented (not benchmarked) | Phase 6 executes the structural-identity test as part of v2.0 release validation; verifies MC-04 conformance suite passes (which covers the SR-03 closure structurally); reviews the JSDoc documentation for SR-03 + performance claims                                                                     |

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

- `src/strategies/RPCDeploymentStrategy.ts` [CONFIRM — fetched 2026-05-26 during this Step 03 iteration]
- `src/strategies/BaseDeploymentStrategy.ts` [CONFIRM — fetched 2026-05-26 during MC-04 Step 03 iteration]
- `src/strategies/DeploymentStrategy.ts` [CONFIRM — fetched 2026-05-26 during MC-04 Step 03 iteration]
- Internal consumer count (test files + example scripts) [AWARE — not enumerated by code search; P3-Obs-08 captured the `Github:search_code` "No approval received" friction; Phase 5 search-and-update pass handles enumeration]

---

## Version History

| Version | Date       | Source                                                   | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-05-26 | Initial Step 03 production via Sub-Template B (Refactor) | 13 specification-level decisions captured across B.2 (4 sub-decisions), B.3 (3), B.4 (3), and B.5 documentation; 12 specification-level + 3 mechanism-level rejected approaches in §2.5. Per-artifact principle scorecard: 6 PASS / 0 CONDITIONAL / 0 FAIL. Phase 2 invalidation: No. Phase 5 implementability: Yes with 2 pre-implementation tasks. Phase 5 estimate refinement: No change (Phase 2's 2.4 maint-hrs confirmed); migration doc work attributed to MC-04 brief to prevent double-counting. VG-P3-U-01 carryover resolved — deprecation-cycle-with-shim explicitly documented as inferred-rejected alternative in §2.5. |

---

_Part of the Phase 3 (Existing Projects) Design & Technical Analysis Tool Set — v1.0_
_AI-Centric Software Development Playbook_
_Companion file: `design-technical-analysis.existing-project.instructions.md`_
_Previous step: MC-04 brief Design Specification Artifact_
_Next brief in Step 03 iteration sequence: MC-12 brief (Schema sub-template)_
