# Principle Weighting

# @diamondslab/diamonds — Phase 2 Cycle

**Weighting Date:** 2026-05-22
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7

---

## 1. Weight Table

| Principle                    | Weight   | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Source Characteristic                                                                                                      |
| ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Security**                 | **1.5×** | The cycle's worst-case mechanism is the claims-vs-proof gap; the dominant failure modes are CVE exploitation (Branch 1) and auditor-flagged security posture (Branch 3). The objective explicitly names auditors as a target persona. 7 of 22 MCs are security-bearing.                                                                                                                                                                                                                                                                                                                                                                                                                                                | Phase 1 §1.3 worst-case mechanism + §2.3 target personas (Solidity developers + auditors) + 7 security-bearing MCs         |
| **Maintainability**          | **1.5×** | Solo maintainer (HC-01); <5 hr/week maintainer-time (HC-08); F-37's burst-then-dormant cadence is a maintainability symptom; 16 of 22 MCs touch Maintainability per Phase 1 §1.5. Productization _is_ a maintainability investment — closing the tribal-knowledge gap that prevents non-maintainer adoption.                                                                                                                                                                                                                                                                                                                                                                                                           | HC-01 + HC-08 + F-37 + F-38 + Phase 1 §1.5 principle-emphasis table                                                        |
| **Economics**                | **1.0×** | HC-03 amended to two-layer; commercial-tools layer is binding $0; AI-usage layer is open-ended ESTIMATED. No commercial pressure (F-39 zero adopters); no speed-to-market pressure (HC-02 open-ended). Economics is constraint-bound (capacity envelope is the real economic constraint) but not weighted-up as a decision driver.                                                                                                                                                                                                                                                                                                                                                                                     | HC-02 + HC-03 amended + F-39 + HC-08 (capacity envelope binds; Economics doesn't drive choices beyond capacity-fit)        |
| **Operations**               | **1.0×** | Pre-production state (F-39); ops burden currently low (3 practitioner-owned environments, no SLA exposure, no on-call burden). Operations _will become_ weight-bearing in the next cycle once external adoption begins, but during this cycle operational impact is limited. MC-11/12/22 are operational MCs but their value is mostly enabling-Maintainability. **Practitioner notes: this is the deprioritized principle for this cycle; future cycle (likely next) elevates Operations.**                                                                                                                                                                                                                           | F-39 (pre-production state) + Phase 1 §1.5 emphasis + explicit practitioner deferral of Operations elevation to next cycle |
| **Scoring & Metrics**        | **1.0×** | Standard baseline weight. The Phase 1 CONDITIONAL is _about_ this principle (weighting), not about its substantive weight. The discipline is preserved through Phase 5 (MC-14 coverage tooling) and Phase 6 (proxy measurements). No project characteristic argues for elevating beyond standard.                                                                                                                                                                                                                                                                                                                                                                                                                      | Phase 1 §9 CONDITIONAL on weighting (which this step resolves), not on weighting magnitude                                 |
| **Correctness Verification** | **1.5×** | The auditor persona makes correctness verification more than baseline — auditors _are_ a correctness-verification consumer; the deliverables they consume (deployment records, reproducible builds, ABI accuracy) require high verifiability. F-41 named auditor reproducibility as existing-but-not-yet-surfaced. The MK-08 ERC-2535 conformance requirement and MC-04 extension-contract verification work both load this principle. **Framing note: the weight reflects deliverable-load even though substantive verification infrastructure mostly exists** — the cycle's Correctness Verification work is largely _documenting and exposing existing capability_ rather than building new verification machinery. | F-41 + MK-08 + MC-04 + auditor persona from §2.3                                                                           |

**Aggregate posture (one sentence):** This is a **pre-production-productization brownfield posture** — Maintainability, Security, and Correctness Verification all elevated 1.5× because productization for external adopters and auditors loads all three; Economics and Operations baseline because there's no current commercial pressure and no current ops burden; the Operations deprioritization is explicit, with elevation deferred to the next cycle.

**Pattern match:** This matches the "Pre-production with productization goal" pattern from the Phase 2 prompt's common-weight reference table (Maintainability 1.5×, Security 1.5×, Correctness Verification 1.5×; others 1×).

---

## 2. Weight-Sensitivity Analysis

| Downstream Decision                                                               | Sensitivity | Reason                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MC-01 lodash mechanism** (Branch A patch vs. Branch B replace)                  | **High**    | Security 1.5× and Maintainability 1.5× both favor Branch B (permanent CVE-surface reduction; one fewer dependency to maintain). Branch A would look attractive under elevated Economics; Phase 2 weights pick B.                                                                             |
| **MC-08 doc-site tool selection**                                                 | **High**    | Maintainability 1.5× and Correctness Verification 1.5× favor docs-as-code (markdown-first, version-controlled, queryable). Operations 1.0× and Economics 1.0× don't elevate hosted-platform options.                                                                                         |
| **MC-04 strategy-extensibility mechanism**                                        | **High**    | Correctness Verification 1.5× favors mechanism with explicit contract testing (prototype-validated extension contract); Security 1.5× favors explicit security boundaries between core and extension. Simpler "ad-hoc extension" mechanism rejected under elevated Correctness Verification. |
| **MC-11 CI workflow mechanism** (simpler-GitHub-Actions vs. unified-DevContainer) | **High**    | Phase 1 PT-03 surfaced this tension. Maintainability 1.5× favors simpler (less to maintain). Weights tilt toward simpler-GitHub-Actions; Step 03 decides.                                                                                                                                    |
| **MC-21 sequencing** (breaking key refactor)                                      | **High**    | Security 1.5× argues for Tier 1; Maintainability 1.5× argues for coordinated landing with other breaking changes (MC-05) to minimize migration windows. Step 04 sequences.                                                                                                                   |
| **MC-07 cost ceiling** (documentation effort)                                     | **High**    | Maintainability 1.5× elevates docs investment; HC-08 caps total time; tension between weighted-importance and capacity. Step 05 cost modeling decides scope fit or staging.                                                                                                                  |
| **MC-22 smoke-test scope**                                                        | **Medium**  | Maintainability 1.5× argues for broader cross-repo verification. Operations 1.0× doesn't add weight. Practitioner judgment on scope.                                                                                                                                                         |
| **MC-12 release-evidence mechanism**                                              | **Medium**  | Security 1.5× and Correctness Verification 1.5× both elevate provenance + SBOM. Already in MC-12's amended scope from Phase 1 Step 04; weighting reinforces but doesn't change.                                                                                                              |
| **MC-03 lockfile-refresh sequencing**                                             | **Low**     | Phase 1 placed it in Tier 3 due to CI dependency. Security 1.5× may suggest moving earlier — Step 04 reconsiders.                                                                                                                                                                            |
| **MC-19 cleanup-scope decisions**                                                 | **Low**     | Cleanup is independent; weights affect ordering but not which items to retire.                                                                                                                                                                                                               |

**Most weight-sensitive Phase 2 outputs** (where Step 03/04/05 should explicitly document weighted rationale):

1. **MC-04 extension-contract mechanism choice** — Correctness Verification 1.5× plus Security 1.5× drives toward formally-specified contract
2. **MC-11 CI mechanism choice** — Phase 1 PT-03 tension; weights now provide deciding criterion
3. **MC-21 sequencing decision** — breaking-change with Security 1.5× value
4. **MC-07 scope-vs-capacity decision** — Maintainability 1.5× collides with HC-08; Step 05 must resolve

---

## 3. Sanity Check

**Coherence check result: Coherent.**

| Pair Checked                                          | Direction        | Note                                                                                                                                                                      |
| ----------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security 1.5× ↔ Maintainability 1.5×                 | Same direction   | Security-investment-that-lasts is maintainable security; maintainability investment includes gates and discipline producing ongoing security                              |
| Maintainability 1.5× ↔ Correctness Verification 1.5× | Same direction   | Verifiable correctness requires maintainable test infrastructure, contract documentation, traceability                                                                    |
| Security 1.5× ↔ Correctness Verification 1.5×        | Same direction   | Auditor persona consumes both (security posture + deployment-record correctness)                                                                                          |
| Three-elevated vs. Three-baseline                     | Coherent posture | Cycle accepts limits on Economics, Operations, Scoring & Metrics in service of the elevated three; capacity envelope (HC-08) enforces through Maintainability's weighting |

**No contradictions surfaced.** Three-elevated principles is more than typical solo-maintainer-OSS but matches the documented "Pre-production with productization goal" pattern.

**Sub-findings flagged for Phase 7 watch (not Phase 2 problems):**

- Security 1.5× × Operations 1.0× implies under-investment in incident-response capability. Acceptable at pre-production state with no SLA exposure; **future-cycle elevation of Operations addresses this.**
- Maintainability 1.5× × Economics 1.0× could imply over-investment in documentation relative to capacity. Self-correcting via HC-08 + Step 05 capacity check.

---

## 4. Comprehensiveness Check Result

Three questions asked; three confirmations received from practitioner:

1. **Operations deprioritization at 1.0×** — confirmed acceptable. Practitioner explicitly accepts Operations as the deprioritized principle for this cycle, with future-cycle elevation planned (likely next cycle).
2. **Correctness Verification 1.5× framing** — confirmed honest. The weighting reflects deliverable-load on this principle even though substantive verification infrastructure mostly exists; this is documented in the Source Characteristic column.
3. **Documentation-heavy plan implication** — confirmed acceptable. The aggregate weighting implies substantial documentation, narrative, and explanation work loaded across MC-06, MC-07, MC-08, MC-10, plus verification-method documentation. Step 05 cost modeling will surface this share; expected and accepted as the shape of productization.

**No weights revised in comprehensiveness check.** All six weights stand as drafted.

---

## 5. Resolves Phase 1 CONDITIONAL

Phase 1 Step 06 self-evaluation flagged Scoring & Metrics as CONDITIONAL because principle weights were not yet assigned. **This artifact resolves that CONDITIONAL:**

- Weights are now assigned (Section 1)
- Rationale is documented per principle (Section 1)
- Source characteristics are traceable to Phase 1 evidence (Section 1)
- Aggregate posture is named in one sentence (Section 1)
- Pattern-match to common weight patterns is identified (Section 1)
- Weight-sensitivity analysis identifies 4 most-sensitive downstream decisions (Section 2)
- Sanity check is conducted; coherent posture confirmed (Section 3)
- Comprehensiveness check is conducted; no weights revised (Section 4)

VG-01 from Step 01's validation gap register is now **closed.**

---

## 6. Forward Implications for Steps 03-06

### 6.1 Step 03 (Mechanism Decisions)

Apply weights particularly closely for the 4 high-sensitivity mechanism choices identified in Section 2:

- MC-01 lodash mechanism
- MC-08 doc-site tool
- MC-04 extension-contract mechanism
- MC-11 CI workflow mechanism

For each, document the weighted rationale explicitly in the Mechanism Decisions artifact.

### 6.2 Step 04 (Sequencing and Tiering)

Apply weights particularly closely for MC-21 sequencing (breaking change with Security 1.5× value) and MC-03 sequencing (Security 1.5× may suggest moving earlier than Phase 1's Tier 3 placement).

### 6.3 Step 05 (Cost Modeling and Capacity Check)

Apply weights particularly closely for MC-07 scope-vs-capacity (Maintainability 1.5× elevation may exceed HC-08 capacity at full scope). The documentation-heavy plan implication (Section 4 #3) means doc work will be a substantial share of total maintainer-time; Step 05 surfaces this honestly.

### 6.4 Step 06 (Synthesis)

The Plan's defining mechanism, when synthesized in Section 1.2 of the Improvement Plan, should incorporate the weighted-three-elevated posture as part of the executive framing. The aggregate weighting is part of the Plan's character.

---

## 7. Sources & Evidence Register

- **Phase 1 Input Validation artifact (Step 01)** — primary source for project characteristics
- **Phase 1 Current-State Information Report** — for finding references (F-37, F-38, F-39, F-41) and constraint envelope
- **Phase 2 prompt common-weight reference table** — for pattern-match confirmation
- **Practitioner confirmations 2026-05-22** — final authority on all six weights, three comprehensiveness-check questions
