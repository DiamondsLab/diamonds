# Step 03 Design Specification — Verification Artifacts

> **Artifact type:** Verification (sub-template F) · **Subject:** `@diamondslab/diamonds` v2.0
> **Status:** ✅ **FINALIZED v1.0 — OP-6 ratified (question-by-question, Owner 2026-07-07)** · **Date:** 2026-07-07
> **Central discipline:** **instruments, not descriptions.** This brief produces instrument _specifications with worked examples_; **Step 05** refines them to full Phase-6-executable form. This is the **Correctness-Verification CONDITIONAL resolution path**.
> **Inputs:** the four primaries' verification methods (MC-04 conformance, MC-21 MK-01, MC-07 proxy-reader C.6, MC-12 four-spoke auditor); M0-E2 MC-12 grounding (real `release.yml`, provenance-only insufficient for F-41); toolkit sub-template F.
> **Owner decisions:** concreteness = shape + 2–3 worked examples, defer full enumeration to Step 05; execution = CI-gated code instruments + pre-release reader/auditor; MC-12 auditor targets the v2.0 six-file bundle (notes the 1.5.0 gap).

---

## §1 — Brief Intake Confirmation

Verification supplementary brief (Plan §10.1): produce the _instrument specifications_ for the four primaries' verification methods, resolving Phase 2's CV CONDITIONAL. Per OP-6, each instrument is specified as **shape + 2–3 fully-worked representative examples** — enough to be an instrument (not a description) while leaving full enumeration to Step 05. Dominant lens: **Correctness Verification 1.5×**.

## §2 — Design Specification

### F.1 — Verification Instrument Inventory

| Instrument                                              | Verifies                                      | Scope                                                          | Phase 6 execution                     |
| ------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------- | ------------------------------------- |
| **I-1 Conformance Suite** (F.2.A) + **Harness** (F.2.D) | MC-04 `IDeploymentStrategy` conformance       | 17 tests, 3 categories; any strategy subclass                  | **Per-PR CI** (block merge)           |
| **I-2 MK-01 Byte-Identity Test** (F.2.A)                | MC-21 refactor preserves deployment output    | Structural byte-identity of deploy artifacts pre/post refactor | **Per-PR CI** (block merge)           |
| **I-3 Proxy-Reader Question Set** (F.2.B)               | MC-07 IA reader-readiness                     | 5 questions ≥80% against deployed docs                         | **Pre-release** (fresh AI session)    |
| **I-4 Auditor-Persona Prompt** (F.2.C)                  | MC-12 release-evidence reproducibility (F-41) | Four-spoke flow over the v2.0 six-file bundle                  | **Pre-release** (external AI auditor) |

### F.2.A — Test Suite (I-1 Conformance + I-2 MK-01)

**I-1 Conformance Suite — 17 tests, 3 categories** (MC-04 §2.4):

- **Category 1 — Lifecycle (5):** each of the 5 phases invokes its pre/main/post hooks in order.
- **Category 2 — Post-condition (7):** each lifecycle method leaves the documented state.
- **Category 3 — Edge-case (5):** partial deployment, deployment-record migration, multi-call atomicity, etc.

_Worked examples (the pattern Step 05 enumerates fully):_

| ID           | Input                                      | Expected output                                            | Predicate                                                  |
| ------------ | ------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------- |
| C1-01        | A strategy subclass; run `deployDiamond()` | pre→main→post hooks fire in order for the Deploy phase     | assert call-order log == `[preDeploy, deploy, postDeploy]` |
| C2-03        | After `diamondCut()`                       | deployment record's facet selectors updated to the cut set | `record.selectors === expectedSelectors`                   |
| C3-02 (edge) | `diamondCut()` throws mid-multi-call       | no partial state persisted (atomicity)                     | `record` unchanged from pre-call snapshot                  |

- **Coverage targets:** all 15 lifecycle methods; the 3 documented edge cases from MC-04 Branch-1 mitigation.
- **Failure handling:** **block merge** (per-PR CI). Conformance output JSON (`diamonds-conformance-v1.0`) is the artifact MC-12's bundle references.

**I-2 MK-01 Byte-Identity Test** (MC-21):

- _Worked example:_ deploy a fixture diamond with the **v1.3.2** `RPCDeploymentStrategy` (via `ethers.Wallet`) and with the **v2.0** Signer-injected strategy (same Wallet as Signer); assert the produced deployment artifacts (addresses modulo nonce, selector sets, cut calldata) are **structurally byte-identical**.
- **Predicate:** `normalize(artifact_v1) === normalize(artifact_v2)` where `normalize` strips address/nonce nondeterminism.
- **Failure handling:** block merge — the refactor must not change deployment output.

### F.2.B — Proxy-Reader Question Set (I-3, MC-07)

- **Success criteria:** 5 questions, **≥80%** correct (4/5), against the deployed v2.0 docs (MC-07 IA).
- **Question-generation discipline:** one question per reader need — install, core concept, extension, migration, verification — spanning all three IA layers.

_Worked examples (2 of 5; Step 05 finalizes all 5 + answer keys):_

1. _(L1)_ "Following only the Quickstart, what command deploys a diamond locally, and where is the deployment record written?" — tests L1 self-sufficiency.
2. _(L3, auditor-adjacent)_ "Using only `reference/verify-a-release.md`, list the four verification spokes and which one checks SHA-256 integrity." — tests F-41 reader-readiness.

- **Grounds on** MC-07 §C.6; Step 05 turns these into executable question+answer-key pairs.

### F.2.C — Auditor-Persona Prompt (I-4, MC-12)

- **Persona:** an external smart-contract auditor, fresh AI session, **no practitioner support**, given only an npm package URL + a GitHub release URL; motivated to confirm the published code matches released source (F-41).
- **Target (per OP-6):** the **v2.0 six-file evidence bundle + four-spoke flow**. **Grounding note (M0-E2):** the shipped **1.5.0 `release.yml` produces `npm publish --provenance` only** — one of the six artifacts — which MC-12 §2.6 deemed insufficient for F-41. This instrument therefore verifies the _v2.0 target_ the six-file bundle is designed to reach, and its existence documents the gap between 1.5.0 (provenance-only) and the v2.0 auditor-reproducible target.

_Worked prompt skeleton (Step 05 finalizes full text + expected-output rubric):_

```
You are an external auditor. You have ONLY: <npm URL>, <GitHub release URL>.
No practitioner will answer questions. Using the release-evidence manifest as your
entry point, execute the four spokes:
  A Integrity   — verify each file's SHA-256 matches the manifest.
  B CommitIdentity — verify manifest.release.commit == GitHub release commit == npm provenance commit.
  C Content     — review the SBOM (CycloneDX 1.5), conformance output, and migration doc.
  D Reproduction — (optional) yarn install --frozen-lockfile against the lockfile; confirm SBOM consistency.
Report per spoke: verified / discrepancies-found / incomplete.
```

- **Expected output:** all four spokes "verified" for a well-formed release; a seeded discrepancy (e.g. mismatched SHA) must be caught by Spoke A.

### F.2.D — Conformance Harness (I-1)

- **Harness scope:** exercises the MC-04 conformance properties against _any_ `IDeploymentStrategy` implementation (self-conformance for Base/Local/RPC; regression detection; external-strategy conformance).
- **Input set:** the 3 built-in strategies + a property-based generator for hook-ordering sequences.
- **Verification predicate:** for every method, observed pre/main/post ordering and post-conditions satisfy the Category-1/2 specs; edge inputs satisfy Category-3.

### F.3 — Cross-Brief Integration

| Instrument                | Brief(s) verified                                                                | Method                               |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| I-1 Conformance + Harness | MC-04                                                                            | Per-PR CI; output feeds MC-12 bundle |
| I-2 MK-01                 | MC-21                                                                            | Per-PR CI byte-identity              |
| I-3 Proxy-Reader          | MC-07                                                                            | Pre-release AI session ≥80%          |
| I-4 Auditor-Persona       | MC-12 (+ transitively MC-04 conformance output, MC-21 migration doc via Spoke C) | Pre-release external auditor         |

Step 04 consumes this to line instruments up with the artifacts they verify; Step 05 refines each to executable form.

### F.4 — Rejected Verification Approaches

| Alternative                                | Why rejected                                                   |
| ------------------------------------------ | -------------------------------------------------------------- |
| Full enumeration in Step 03                | Duplicates Step 05; single-session fatigue risk (OP-6)         |
| Descriptions only (no worked examples)     | Reads as "descriptions not instruments" → CV stays CONDITIONAL |
| All instruments pre-release manual         | Loses per-PR regression protection on conformance + MK-01      |
| Auditor verifies 1.5.0 provenance-only     | Doesn't drive toward the F-41 target the brief exists for      |
| Human-only conformance review (no harness) | Not repeatable; fails regression-detection purpose             |

## §3 — Phase 5 Estimate Refinement

Instrument _specification_ is bounded; the variance lives in Step 05's full enumeration (17 cases, 5 questions, full prompt). No material Step-03 refinement.

## §4 — Rejected Alternatives at Specification Level

See F.4.

## §5 — Per-Artifact Principle Scorecard Contribution

| Principle                    | Wt       |  Verdict | Rationale                                                                                                                               |
| ---------------------------- | -------- | -------: | --------------------------------------------------------------------------------------------------------------------------------------- |
| Security                     | 1.5×     |     PASS | Auditor instrument verifies provenance/commit-identity; no secret handling                                                              |
| Maintainability              | 1.5×     |     PASS | Harness makes conformance repeatable; instruments are reusable                                                                          |
| Economics                    | 1.0×     |     PASS | CI-gated vs pre-release split matches cost to value                                                                                     |
| Operations                   | 1.0×     |     PASS | Pre-release auditor + CI gates are operational checkpoints (baseline)                                                                   |
| Scoring & Metrics            | 1.0×     |     PASS | ≥80% proxy-reader threshold; pass/fail conformance counts                                                                               |
| **Correctness Verification** | **1.5×** | **PASS** | Four concrete instruments with worked examples + predicates + execution discipline — **resolves the CV CONDITIONAL** (Step 06 confirms) |

**6 PASS.** CV instruments are concrete (not descriptions) → CV CONDITIONAL → **PASS** trajectory established; Step 05 refinement + Step 06 gate confirm.

## §6 — Phase 2 Invalidation Check

**No.** Instruments verify deferred v2.0 work; the MC-12 grounding is an update, not an invalidation (M0-E2). Amendment package stays empty.

## §7 — Phase 5 Implementability Check

Implementable: conformance suite + harness are standard TS tests; MK-01 is a fixture+predicate; proxy-reader/auditor are AI-session runbooks. Step 05 produces the executable content. No blocking gaps.

## §8 — Forward Handoff Notes

- **Step 05 (Verification Strategy):** enumerate I-1's 17 cases fully; write I-3's 5 questions + answer keys; write I-4's full prompt + expected-output rubric; refine I-2 to a concrete fixture+predicate.
- **Step 06:** this brief + Step 05 are what move CV CONDITIONAL → PASS.
- **Phase 6:** wire I-1/I-2 into per-PR CI; schedule I-3/I-4 pre-release.

## §9 — Cross-Brief References

- **MC-04** — 17-test conformance suite + harness (I-1); conformance output feeds MC-12 bundle.
- **MC-21** — MK-01 structural byte-identity (I-2).
- **MC-07** — proxy-reader question set (I-3) grounds on §C.6.
- **MC-12** — auditor-persona (I-4) targets the v2.0 six-file bundle; carries the M0-E2 provenance-only gap note.

## §10 — Confidence and Code-Access Notes

Verification methods grounded on Session 1 briefs `[CONFIRM]`; MC-12 grounding on M0-E2 + real `release.yml` `[CONFIRM]`; instrument shapes ratified `[CONFIRM via OP-6]`. Full instrument _content_ intentionally deferred to Step 05 `[AWARE]`.

## Version History

| Version | Date       | Change                                                                                                                                                                             |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-07-07 | Initial authoring; OP-6 ratified (shape+worked-examples; CI/pre-release split; auditor targets v2.0 bundle w/ 1.5.0 gap note). 6 PASS; CV CONDITIONAL→PASS trajectory established. |
