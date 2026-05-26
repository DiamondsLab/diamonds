# Sequencing and Tiering

# @diamondslab/diamonds — Phase 2 Cycle

**Sequencing Date:** 2026-05-22
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Step 02 Weights Applied:** Security 1.5× / Maintainability 1.5× / Economics 1.0× / Operations 1.0× / Scoring & Metrics 1.0× / Correctness Verification 1.5×

---

## 1. Tiered Sequence

### 1.1 Tier 1 — Foundation

**Principle-weighted rationale:** Foundation MCs clear cognitive surface for subsequent work, fix broken gates before they get ported, address Security 1.5× concerns with highest urgency-to-cost ratio, and are independent enough to land in any order within the tier. Maintainability 1.5× argues for clearing these first to prevent contamination of downstream work.

| MC                            | Brief Description                                | Rationale for Tier 1                                                                                          |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| MC-02                         | Fix 2 husky-gate silent-failure bugs             | **Must be first in tier.** Prerequisite for MC-11, MC-19, MC-12 — broken gates ported to CI gain nothing      |
| MC-19                         | Single-sweep cleanup PR                          | Depends on MC-02; clears `scripts/devops/` orphans before MC-11 CI authoring inherits broken inspiration      |
| MC-01                         | Replace lodash + bump axios                      | Independent; Security 1.5× elevates early landing — closes most material CVE exposure before any v2.0 publish |
| MC-13                         | CHANGELOG.md mechanism                           | Mechanism in place ready to capture breaking changes in Tier 2                                                |
| MC-14 (tooling-adoption half) | nyc + Istanbul + baseline measurement            | Before MC-15 so pre-reorganization coverage baseline is meaningful                                            |
| MC-15                         | 7 misplaced integration tests resolved           | After MC-14 tooling; resolves F-17 inheritance                                                                |
| MC-16                         | External-libraries functionality test (Issue #9) | Independent net-new test file                                                                                 |
| MC-17                         | `deployInclude` behavior test (Issue #10)        | Independent test + doc addition                                                                               |
| MC-18                         | Sustainable release cadence policy               | Independent written-policy artifact; activates after MC-13 mechanism                                          |
| MC-20                         | Linting alignment (config half)                  | Independent ESLint config + pre-commit alignment; resolves Issue #5; CI half lands in Tier 2                  |

**Tier 1 count:** 10 MCs (with MC-14 split-execution counted as Tier 1's first half).

### 1.2 Tier 2 — Capability + Coordinated Breaking-Change Block

**Principle-weighted rationale:** Tier 2 contains the Coordinated Breaking-Change Block (Step 03's MC-04 + MC-05 + MC-21 + MC-22 + MC-13 cluster) plus capability work that depends on Tier 1 foundation. Per Step 02 weights, breaking changes that improve Security (MC-21) and Correctness Verification (MC-04) are weighted high enough that landing them coordinated as a single v2.0 release is more valuable than landing them piecemeal. Maintainability 1.5× supports the coordinated block — one breaking-change event for adopters to navigate, not three.

**Tier 2 capability work (lands before or with the breaking-change block):**

| MC                    | Brief Description                        | Rationale                                                                                  |
| --------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| MC-11                 | GitHub Actions CI pipeline (3 workflows) | Lands between Tier 1 and the Block; enables MC-22 host workflow and MC-12 publish shell    |
| MC-14 (CI floor half) | TS coverage CI floor enforcement         | Lands with MC-11                                                                           |
| MC-20 (CI half)       | Lint gate in CI                          | Lands with MC-11                                                                           |
| MC-03                 | Lockfile-refresh Dependabot config       | Lifted from Phase 1 Tier 3 on Security 1.5× grounds; lands as soon as host workflow exists |

**Coordinated Breaking-Change Block (lands together as v2.0 release):**

| MC    | Brief Description                         | Within-Block Sequencing                                                                 |
| ----- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| MC-05 | OZDefenderDeploymentStrategy retired      | First within block — clears Defender from surface MC-04 designs against                 |
| MC-09 | Defender-related docs retired/replaced    | Lands with MC-05 (same retirement event)                                                |
| MC-04 | Strategy extensibility — formal contract  | Designs against post-MC-05 + post-MC-21 surface; contract + worked example land in v2.0 |
| MC-21 | Private key refactored — Signer injection | Coordinated breaking change with MC-05 in same v2.0 release                             |
| MC-22 | Dev-env integration smoke test            | Verifies dev-env diamonds work with post-MC-04 + post-MC-21 interface                   |
| MC-13 | CHANGELOG entry for v2.0 breaking changes | Documents block landings                                                                |

**Tier 2 count:** 10 MC-entries (counting MC-13's maintenance-instance and MC-14/MC-20's CI halves).

### 1.3 Tier 3 — Productization

**Principle-weighted rationale:** Tier 3 is the documentation-heavy chain Step 02 explicitly accepted as the cycle's shape. Maintainability 1.5× elevation drives this tier; Correctness Verification 1.5× drives the verification methods (proxy-reader tests, link checking, auditor-persona checks). The tier completes the productization arc — once Tier 3 lands, an external Solidity developer or auditor can adopt and verify Diamonds without practitioner support.

| MC    | Brief Description                         | Rationale for Tier 3 Placement                                                                            |
| ----- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| MC-06 | TypeDoc API reference                     | Depends on v2.0 stable interface from Tier 2; generates against post-MC-04 + post-MC-21 codebase          |
| MC-08 | MkDocs documentation site                 | Depends on MC-06 (integrates TypeDoc output into navigation)                                              |
| MC-07 | Layered narrative docs + working examples | Depends on MC-04, MC-06, MC-08, MC-21 — the entire post-Tier-2 surface                                    |
| MC-10 | README productization framing             | Depends on MC-07 (Layer 1 Quickstart links), MC-08 (docs site links), MC-21 (post-refactor code snippets) |
| MC-12 | Publish pipeline + provenance + SBOM      | Lands with first v2.0 release — final productization gate                                                 |

**Tier 3 critical-path observation:** MC-06 → MC-08 → MC-07 → MC-10 → MC-12 is a linear chain with limited parallelization. This is the structural shape of the documentation block from Step 03 Pattern 3. The chain length affects the minimum-viable-completion floor analysis (Section 3).

**Tier 3 count:** 5 MCs.

---

## 2. Inter-MC Dependencies (Restated from Step 03)

The full dependency table is in Step 03 Section 3.1. Sequencing respects the DAG verified in Step 03 Section 3.3. Sequencing rules applied:

- MC-02 before MC-11 (don't port broken gates)
- MC-05 first within Coordinated Block; MC-04 designs against post-MC-05 surface
- MC-22 before/with breaking-change work — smoke test catches cross-repo breakage at PR time
- MC-06 before MC-07 (API reference anchors narrative links)
- MC-07 before MC-10 (README references final narrative content)
- MC-13 maintained across Tier 2 (lands with first breaking change)
- MC-14 tooling-adoption before MC-15 (coverage baseline before test reorganization)

**Tight ordering noted:** MC-05 retire → MC-04 design against post-Defender + post-MC-21 state → MC-21 lands in same coordinated block alongside MC-04 contract test suite. MC-04 must not be scoped before MC-21's interface is firm.

---

## 3. Minimum-Viable-Completion Floor

### 3.1 Floor MCs (11)

| MC    | Why in the floor                                                                             |
| ----- | -------------------------------------------------------------------------------------------- |
| MC-02 | Foundation prerequisite; broken gates cannot ship into defensible outcome                    |
| MC-19 | Single-sweep cleanup; clears cognitive surface; cheap; necessary for honest claims           |
| MC-01 | CVE remediation; Branch 1 worst-case (exploitable CVE) is closed                             |
| MC-13 | CHANGELOG mechanism; most basic instrument of claims-vs-proof for any release                |
| MC-11 | CI pipeline; gates enforced server-side, not just locally                                    |
| MC-22 | Dev-env smoke test; verifies post-floor state still works with consumer projects             |
| MC-21 | Signer-injection refactor; SR-03 closed; v2.0 breaking change is justified by this alone     |
| MC-05 | Defender retirement; lands with MC-21 in v2.0 as one breaking-change event                   |
| MC-09 | Defender docs retire; lands with MC-05; cheap                                                |
| MC-10 | README productization framing; the _one_ document an external adopter reads first            |
| MC-12 | Publish + provenance + SBOM + lockfile snapshot; v2.0 lands with verifiable release-evidence |

### 3.2 Principle-Weighted Rationale for the Floor

The floor is **the subset that materially narrows the claims-vs-proof gap.** Each floor MC either:

- Closes a specific Phase-1 worst-case branch (MC-01, MC-21, MC-12)
- Removes orphan/broken artifacts that contaminate claims (MC-02, MC-19, MC-05, MC-09)
- Provides basic instruments of post-claim verifiability (MC-11, MC-12, MC-13, MC-22)
- Signals productization state to the first reader (MC-10)

After the floor lands, a Solidity developer or auditor encountering v2.0 sees:

- A clean, CVE-free dependency footprint
- An npm artifact with verifiable provenance + SBOM
- A CHANGELOG documenting what changed and why
- A README explaining what the library is and where to go for more
- A clean codebase without orphan tooling or Defender residue
- A CI pipeline visibly enforcing gates on every change
- A dev-env smoke test confirming the library works with consumer projects
- A v2.0 release using ethers' Signer convention (no raw private keys)

**Defensible. Not complete — but defensible.**

### 3.3 What Gets Cut First If Capacity Runs Out

Cut order goes by **least-load-bearing-first** within the 11-MC stretch scope:

1. MC-18 (cadence policy) — lowest impact
2. MC-15 (misplaced tests) — F-17 cosmetic; tests still pass
3. MC-14 (coverage tooling + CI floor) — UNMEASURED stays UNMEASURED
4. MC-20 (linting) — existing lint works; alignment cosmetic
5. MC-16 (external-libs test) — coverage gap; function works
6. MC-17 (deployInclude test) — same shape as MC-16
7. MC-03 (lockfile cadence) — manual discipline carries forward
8. **MC-07 partial-Layer-3 cut option** — Layer 1 + Layer 2 only; preserves Quickstart + Core Concepts; cuts heavier reference docs
9. MC-06 (TypeDoc) — auditor can read source
10. MC-08 (MkDocs site) — README + repo markdown serves as docs surface
11. MC-04 (extension contract) — keep as last-cut; if cut, NTI-03 (diamonds-safe) waits one cycle

**Note on MC-07 partial-Layer-3 staging:** Per Step 03 Phase D, MC-07's three-layer structure was flagged as the most likely scope-vs-capacity collision. The cut order treats partial-Layer-3 as a meaningful staging option _before_ full MC-07 retreats from stretch.

---

## 4. Stretch Scope

The stretch scope is the 11 MCs above the floor.

| Stretch MC | Weighted Value                                    | Why Not in Floor                                                         |
| ---------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| MC-04      | Correctness Verification 1.5× — high              | Floor delivers v2.0 without extension affordance; NTI-03 waits one cycle |
| MC-06      | Maintainability 1.5× — high                       | Floor delivers v2.0 with source-readable API                             |
| MC-08      | Maintainability 1.5× — high                       | Floor delivers v2.0 with README + repo docs                              |
| MC-07      | Maintainability 1.5× — high; heaviest single item | Highest doc-investment; stretch by capacity-cost                         |
| MC-03      | Security 1.5× — moderate                          | Manual lockfile-refresh carries forward at floor                         |
| MC-14      | Scoring & Metrics 1.0×                            | Baseline weight; tooling absent ≠ broken                                 |
| MC-15      | Maintainability 1.5× — cosmetic                   | F-17 inheritance cosmetic; floor passes tests                            |
| MC-16      | Correctness Verification 1.5× — moderate          | Open issue #9; library function works                                    |
| MC-17      | Correctness Verification 1.5× — moderate          | Open issue #10; library function works                                   |
| MC-18      | Maintainability 1.5× — low                        | Policy artifact; absence doesn't break                                   |
| MC-20      | Maintainability 1.5× — cosmetic                   | Open issue #5; existing lint works                                       |

**Floor-to-stretch ratio:** 11 / 11. Healthy capacity flex.

**Promotion candidates** (flag for Step 05 capacity-check):

- **MC-04** — if floor has headroom, promote: NTI-03 (diamonds-safe) is most concrete near-term ecosystem use
- **MC-06** — lightweight (config-edit 5× multiplier); cheap to promote

---

## 5. Worst-Case Plan-Failure Narrative

### 5.1 Failure Branches

**Branch 1 — Coordinated Block stalls on unforeseen MC-04 complexity.**

Tier 1 lands cleanly. MC-11 lands. The Coordinated Block begins. MC-05 retires Defender cleanly. MC-21 designs the Signer injection. MC-04 contract design starts — and the contract surface turns out to need more than the Phase 1 evidence suggested. The `BaseDeploymentStrategy` lifecycle methods need to expose deployment-record-writing semantics that the worked-sibling example forces us to make explicit, and the conformance test suite has to cover edge cases (partial deployment, deployment-record migration across diamond cuts, multi-call atomicity) we hadn't enumerated. Two weeks of estimated MC-04 work becomes six weeks of actual work. Tier 2 stalls. v2.0 doesn't ship by the practitioner's available focus window. The cycle becomes "Tier 1 complete + Tier 2 partial" and Tier 3 never starts.

**Branch 2 — Doc-heavy Tier 3 exceeds capacity and Layer 3 quietly disappears.**

Tier 1 and Tier 2 land. v2.0 ships. Tier 3 begins. MC-06 lands fast (config-edit 5× multiplier). MC-08 lands fast. MC-07 Layer 1 (Quickstart) lands. MC-07 Layer 2 (Core Concepts) lands. MC-07 Layer 3 (Reference) is supposed to cover writing-a-new-strategy + secure-key-handling + dev-env-integration + auditor-verification — four reference docs, each non-trivial. Capacity runs short. The practitioner intends to come back to Layer 3 "next week" for several next-weeks. Layer 3 silently slides out of scope; the cycle is declared complete on Layer 1+2; the auditor-verification doc never gets written; the cycle's claim of "auditor-adoption-ready" turns out to be Layer 1+2-adoption-ready, with auditors specifically left with source-reading as their workflow.

**Branch 3 — Burst-then-dormant cadence reasserts before completion (practitioner's Q3 worry from Specify).**

Tier 1 lands during a focused 3-week burst. Tier 2 begins. The practitioner's ecosystem attention shifts to a different DiamondsLab project (per the F-37 pattern that produced Phase 1's Diamonds 4-month dormancy). Diamonds enters a partial-completion holding pattern. v2.0 work sits half-finished on a feature branch for 2-3 months. When attention returns, the branch needs rebasing, the AI session context is gone, the half-finished work needs to be re-understood. The cycle limps to completion 6-12 months later than the original capacity math suggested, or it doesn't complete at all and another cycle begins on top of the half-finished v2.0 state.

### 5.2 Common Mechanism

**Load-bearing concentration.**

> **Multiple Phase 2 outcomes depend on a small number of high-leverage MCs reaching completion in the right order. The plan has too few "natural pause points" — places where partial completion produces a coherent intermediate state. When complexity, capacity, or attention discontinuity hits, the plan tends to stall mid-block rather than mid-tier, because the blocks (Coordinated Breaking-Change, Layered Documentation) are themselves the smallest defensible units.**

This is a _correct_ structural choice — coordinated breaking changes ARE better than serial breaking changes, layered docs ARE better than monolithic narrative — but the choice has a cost: fewer natural pause points means a stall mid-unit is more expensive than a stall between units.

### 5.3 Plan Mitigation

**Mitigation 1 — Floor design is partial mitigation for Branch 3.**
The minimum-viable floor in Section 3 is itself a pause-point design — Tier 1 + Coordinated Block (post-cleanup + v2.0 publish) is a coherent intermediate state. The floor exists to make a stall-after-Tier-2 less catastrophic.

**Mitigation 2 — De-risk MC-04 with disciplined Phase 3 design brief.**
Step 03 named MC-04 as requiring a Phase 3 design brief. The mitigation is to _take that brief seriously_ — surface edge cases (partial deployment, multi-call atomicity, deployment-record migration) at design time, not at implementation time.

**Mitigation 3 — Stage MC-07 Layer 3 explicitly as per-doc scope-flex.**
Phase 5 task seeds mark Layer 3 reference docs individually (writing-a-new-strategy / secure-key-handling / dev-env-integration / auditor-verification) so the cut decision is per-doc, not per-Layer.

**Mitigation 4 — Branch 3 residual risk named for Phase 7 watch.**
Burst-then-dormant cadence is project-life-cycle property. Phase 7 watch-trigger: "feature-branch staleness > 30 days during active cycle" as attention-discontinuity signal.

### 5.4 Residual Risk

- Branch 3 (attention discontinuity) is partially un-mitigable; the floor design mitigates _partial_ dormancy but a 6-month mid-Tier-2 dormancy is recoverable only if AI-session context can be reconstructed, feature branch can be rebased, and practitioner attention can re-engage. **Named for Phase 7 watch; not a Phase 2 plan revision.**

---

## 6. Comprehensiveness Check Result

**Q-Compr-1 — Any placement that worries you?** Practitioner confirmed no placement worries. Three flagged items (MC-14 split-execution, MC-03 lifted to Tier 2, MC-12 placement in Tier 3) all accepted as-drafted.

**Q-Compr-2 — Any unsurfaced dependency or mis-matched tier boundary?** Practitioner confirmed none. One forward-watch item flagged: the Tier 1 → Tier 2 boundary (CI pipeline landing) is the most consequential tier boundary in the plan; CI pipeline bugs at this boundary could stall progression. Worth Phase 7 watching, not Phase 2 revision.

---

## 7. Forward Implications

### 7.1 For Step 05 (Cost Modeling)

**Per-tier cost expectations:**

- **Tier 1:** 10 MCs, mostly mechanical-cleanup category (10× multiplier) and config-edit category (5× multiplier). Expected to be the lowest maintainer-time tier.
- **Tier 2:** 10 MC-entries including the Coordinated Block. MC-04 is the heaviest item (novel-design 3× multiplier — lowest acceleration in the cost model). Expected to dominate maintainer-time on the Coordinated Block.
- **Tier 3:** 5 MCs but includes MC-07 (heaviest doc-authorship work; 8× multiplier). Tier 3 may dominate total maintainer-time despite fewer MCs.

**Capacity-collision flag:** Step 03 Phase D and the cut-order analysis both identify MC-07 as the most likely scope-vs-capacity collision. Step 05 should produce per-MC cost rows for MC-07 _broken out by layer_ (Layer 1 / Layer 2 / Layer 3) so the partial-Layer-3 staging decision has cost data behind it.

**Promotion candidates for Step 05 capacity-check:**

- MC-04 — promote to floor if capacity has headroom
- MC-06 — lightweight; cheap to promote

### 7.2 For Step 06 (Synthesis)

**Defining mechanism for executive summary:** The cycle's Plan reduces to "narrow the claims-vs-proof gap through a sequenced productization arc — Foundation (clear cognitive surface) → Coordinated Breaking-Change Block (v2.0 with verifiable release evidence) → Documentation Block (auditor- and adopter-ready)." The common mechanism that organized Phase 1 ("the gap between what Diamonds claims and what Diamonds can prove") carries forward into Phase 2 as the organizing principle of the sequence.

**Sequencing decisions to highlight in executive summary:**

- The single-coordinated v2.0 release (not piecemeal breaking changes)
- The 11/11 floor-to-stretch split (defensible partial outcome possible)
- The MC-07 per-Layer-3 staging option (preserves Quickstart + Core Concepts under capacity pressure)

### 7.3 For Phase 5 (Execution)

**Specific Tier 1 quick-wins** (independent, parallelizable within tier):

- MC-02 (gate fixes) — must be first
- MC-19 (cleanup sweep) — second; clears `scripts/devops/`
- MC-01, MC-13, MC-16, MC-17, MC-18, MC-20 — independent in any order

**Tier 2 coordination block ordering:**

- MC-11 first (provides CI workflow hosts)
- MC-03, MC-14 (CI half), MC-20 (CI half) land with MC-11
- Coordinated Breaking-Change Block: MC-05 → MC-04 design → MC-21 + MC-22 → MC-13 entry → v2.0 publish

**Tier 3 final-polish ordering:**

- MC-06 → MC-08 → MC-07 (per-Layer; per-doc within Layer 3) → MC-10 → MC-12 (first v2.0-with-provenance publish)

### 7.4 For Phase 7 (Operational Watch-Triggers)

Named for Phase 7 forward handoff:

- **Operations elevation deferred to next cycle** — explicit practitioner deferral; next cycle's Phase 2 should re-weight Operations
- **Feature-branch staleness > 30 days during active cycle** — attention-discontinuity signal (Branch 3 residual risk)
- **Tier 1 → Tier 2 CI-boundary stall risk** — watch for CI pipeline bugs at boundary
- **Token-cost empirical validation** (P2-Obs-04) — Phase 7 should track real dev-hour-to-maintainer-hour and dev-hour-to-token ratios across Phase 5 execution to calibrate future Phase 2 cost models

---

## 8. Sources & Evidence Register

- **Phase 1 Input Validation artifact (Step 01)** — for constraint envelope and Phase 1 priority indications
- **Principle Weighting artifact (Step 02)** — for tier-rationale weighting; weight-sensitivity decisions
- **Mechanism Decisions artifact (Step 03)** — for inter-MC dependencies, structural patterns, and mechanism-induced sequencing constraints
- **Phase 1 Current-State Information Report** — for finding references (F-17, F-37, F-38, F-41, F-42, SR-03, NTI-03)
- **Practitioner confirmations 2026-05-22** — final authority on Phase A tier draft, Phase B floor, Phase C stretch, Phase D worst-case branches, Phase E mitigations, Phase F comprehensiveness check
