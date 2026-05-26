# Improvement Plan

# @diamondslab/diamonds — Phase 2 Cycle

**Plan Date:** 2026-05-22
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Phase 1 Completion Date:** 2026-04-20
**Phase 2 Completion Date:** 2026-05-22
**Subject Version at Plan Date:** v1.3.2 (re-verified; no drift since Phase 1)

---

## Section 1: Executive Summary

### 1.1 The Cycle in One Paragraph

`@diamondslab/diamonds` is a TypeScript library for deploying ERC-2535 Diamond Proxy smart contracts on Hardhat, currently at v1.3.2, published to npm 2026-01-03, used in three private DiamondsLab production projects with zero external adopters. Phase 1 established that the library _works_ but cannot _prove_ it works to external Solidity developers or auditors. This Phase 2 Improvement Plan transforms the 22 Must-Changes from Phase 1 into a sequenced, principle-weighted, cost-modeled productization arc: 11 floor MCs that ship as v2.0 with verifiable release evidence, plus 11 stretch MCs that land as post-v2.0 patch releases. The full plan represents approximately 42 maintainer-hours over an open-ended timeline, with HC-08's capacity envelope (<5 hr/week ecosystem, Diamonds-minority-share) as the binding constraint and HC-03's amended two-layer budget (commercial-tools $0; AI-usage ~$32 total ESTIMATED) comfortably bounded.

### 1.2 The Plan's Defining Mechanism

> **Narrow the claims-vs-proof gap through a sequenced productization arc.**

Phase 1's worst-case synthesis named **the gap between what Diamonds claims and what Diamonds can prove** as the cycle's organizing mechanism. The Plan operationalizes this into three sequential steps:

1. **Tier 1 (Foundation) clears cognitive surface.** Broken gates fixed (MC-02), orphan tooling retired (MC-19), CVE exposure closed (MC-01), CHANGELOG mechanism established (MC-13), test debt resolved (MC-15/16/17/20), cadence policy authored (MC-18). After Tier 1, the codebase is honestly what it claims to be.

2. **Tier 2 (Coordinated Breaking-Change Block) ships v2.0 with verifiable release evidence.** CI pipeline lands (MC-11). The Coordinated Block (MC-05 + MC-04 + MC-21 + MC-22 + MC-13 v2.0 entry) lands together as a single v2.0 release. After Tier 2, the library is in its productized shape with a clean public API, a formal extension contract, security-best-practice key handling, and a CI pipeline visibly enforcing every gate.

3. **Tier 3 (Productization) completes the adoption-readiness claim.** TypeDoc + MkDocs + layered narrative docs + README rewrite + publish-with-provenance/SBOM. After Tier 3, an external developer or auditor can adopt and verify Diamonds without practitioner support.

### 1.3 Principal Tensions Carried Forward

- **Operations 1.0× deprioritization (explicit).** This cycle accepts Operations as baseline; future cycle (likely next) elevates Operations to address external-adoption ops-burden. Carried forward as Phase 7 watch + next-cycle re-weighting.
- **Documentation-heavy plan implication (explicit).** Maintainability 1.5× + Correctness Verification 1.5× combined elevation loads MC-06/07/08/10/12 with substantial doc-authorship work. MC-07 alone is 23% of plan cost; AI-acceleration (8× multiplier) makes this feasible.
- **Coordinated Block load-bearing concentration (structural).** Step 04 Section 5.2 named "load-bearing concentration" as the common mechanism producing all worst-case plan-failure branches. Mitigated through floor design, MC-04 Phase 3 design brief discipline, MC-07 per-doc cut staging, and Phase 7 feature-branch-staleness watch-trigger.

### 1.4 Plan-vs-Capacity Fit

**Plan fits the capacity envelope with the floor-as-v2.0 + stretch-as-patch-releases framing.** Floor (11 MCs, ~14 maintainer-hours) ships as v2.0 in approximately 7 weeks of focused work at 2 hr/wk Diamonds capacity. Stretch (11 MCs, ~28 maintainer-hours) lands as v2.0.x patch releases over subsequent months. Full plan completion in 5-10 calendar months consistent with HC-02 open-ended timeline.

### 1.5 Principle-Weighted Posture

This is a **pre-production-productization brownfield posture** — Maintainability 1.5×, Security 1.5×, Correctness Verification 1.5× all elevated because productization for external adopters and auditors loads all three; Economics 1.0×, Operations 1.0×, Scoring & Metrics 1.0× baseline because no current commercial pressure and no current ops burden. Operations deprioritization is explicit with elevation deferred to next cycle.

---

## Section 2: The Plan

### 2.1 Tier 1 — Foundation

**Principle-weighted rationale:** Foundation MCs clear cognitive surface for subsequent work, fix broken gates before they get ported, address Security 1.5× concerns with the highest urgency-to-cost ratio. Each is independent enough to land in any order within the tier (with the named exceptions).

| MC                            | Chosen Mechanism                                                                                                        |  Maint-hrs (Tag) | Verification Method                                                                              | Dependencies    | Phase 3 Design Brief? |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------: | ------------------------------------------------------------------------------------------------ | --------------- | :-------------------: |
| MC-02                         | Two specific code fixes in `.husky/pre-push` (Snyk auth check + OSV output capture)                                     |  0.4 (ESTIMATED) | Both gates demonstrably fail-closed on injected vulnerability                                    | None            |          No           |
| MC-19                         | Single-sweep atomic PR: delete `scripts/devops/` + `scripts/` + 6 unused devDeps + 2 `.npmignore` lines + 1 git URL pin |  0.6 (ESTIMATED) | No-functional-change diff verified by review; full test suite passes; no new audit advisories    | MC-02           |          No           |
| MC-01                         | Replace lodash with `es-toolkit/compat` drop-in + bump axios to `^1.15.0`                                               |  1.2 (ESTIMATED) | `yarn npm audit` zero High/Critical on dependencies; OSV total ≥30% reduction from F-29 baseline | None            |          No           |
| MC-13 (mech)                  | CHANGELOG.md skeleton + Keep-a-Changelog format + v1.3.2-baseline entry                                                 |  0.6 (ESTIMATED) | File exists; format validates; baseline entry present                                            | None            |          No           |
| MC-14 (tooling-adoption half) | Install nyc + Istanbul; capture baseline coverage; CI floor half deferred to Tier 2                                     |  0.8 (ESTIMATED) | Baseline coverage number recorded as MEASURED row before MC-15 reorganization                    | None            |          No           |
| MC-15                         | Per-test move-or-reconfigure across 7 misplaced tests                                                                   |  2.7 (ESTIMATED) | All 7 tests pass in their final placement; no test regression in `yarn test`                     | MC-14 tooling   |          No           |
| MC-16                         | Net-new test file for external-libraries functionality                                                                  |  2.0 (ESTIMATED) | Test file exists; tests pass; Issue #9 closeable                                                 | None            |          No           |
| MC-17                         | Test additions + doc clarification for `deployInclude` behavior                                                         |  1.3 (ESTIMATED) | Test added; doc updated; Issue #10 closeable                                                     | None            |          No           |
| MC-18                         | Written cadence policy artifact (CADENCE.md or in CONTRIBUTING.md)                                                      | 0.25 (ESTIMATED) | Policy document exists; references CHANGELOG mechanism                                           | MC-13 mechanism |          No           |
| MC-20 (config half)           | ESLint config alignment + pre-commit hook; CI half lands Tier 2                                                         |  0.6 (ESTIMATED) | Lint runs clean across codebase; Issue #5 closeable                                              | None            |          No           |

**Tier 1 subtotal:** 10.45 maintainer-hours; ~$7.40 token cost; calendar projection ~5-6 weeks at 2 hr/wk.

### 2.2 Tier 2 — Capability + Coordinated Breaking-Change Block

**Principle-weighted rationale:** Tier 2 contains the Coordinated Breaking-Change Block (MC-04 + MC-05 + MC-21 + MC-22 + MC-13 v2.0 entry) plus capability work that depends on Tier 1. Coordinated landing is more valuable than piecemeal under Maintainability 1.5× (one breaking-change event for adopters).

**Tier 2 capability work (lands before/with the Block):**

| MC                    | Chosen Mechanism                                                                                                        | Maint-hrs (Tag) | Verification Method                                                                                     | Dependencies        | Phase 3 Design Brief? |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------: | ------------------------------------------------------------------------------------------------------- | ------------------- | :-------------------: |
| MC-11                 | Three simpler-GitHub-Actions workflows: `ci.yml`, `publish.yml` shell, `dev-env-smoke.yml`. No DevContainer dependency. | 2.4 (ESTIMATED) | All three workflows complete <5min each; PR with broken security gate is blocked, verifying enforcement | MC-02, MC-19        |          No           |
| MC-14 (CI floor half) | Coverage-floor check added to `ci.yml`                                                                                  | 0.4 (ESTIMATED) | Coverage below floor blocks merge                                                                       | MC-11               |          No           |
| MC-20 (CI half)       | Lint gate added to `ci.yml`                                                                                             | 0.2 (ESTIMATED) | Lint failure blocks merge                                                                               | MC-11, MC-20 config |          No           |
| MC-03                 | `.github/dependabot.yml` config; lockfile-refresh PRs with evidence trail                                               | 0.4 (ESTIMATED) | Dependabot PRs appear; lockfile refreshes produce CI-validated PRs                                      | MC-11               |          No           |

**Coordinated Breaking-Change Block (lands together as v2.0 release):**

| MC                 | Chosen Mechanism                                                                                                                                                                |     Maint-hrs (Tag) | Verification Method                                                                                                                                                                                  | Dependencies                                      | Phase 3 Design Brief? |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | :-------------------: |
| MC-05              | Cascade-delete OZDefenderDeploymentStrategy file + tests + scripts + deps + references                                                                                          |     0.8 (ESTIMATED) | No remaining Defender code references; full test suite passes                                                                                                                                        | None                                              |          No           |
| MC-09              | Delete Defender docs (`README-DEFENDER.md` + `defender-integration.md`); selectively rewrite `monitoring-troubleshooting.md` salvage                                            |     0.4 (ESTIMATED) | No remaining Defender doc references; salvaged content reviewed                                                                                                                                      | MC-05                                             |          No           |
| **MC-04**          | Formal TypeScript `IDeploymentStrategy` interface + lifecycle methods + JSDoc security-boundary annotations + contract conformance test suite + worked sibling-strategy example | **8.0** (ESTIMATED) | Contract conformance test passes against worked example; reference external strategy produces auditor-reproducible deployment records; TypeScript interface JSDoc covers security boundaries         | MC-05                                             |        **YES**        |
| MC-21              | Clean break — v2.0 constructor takes `signer: Signer` instead of `privateKey`; no shim                                                                                          |     2.4 (ESTIMATED) | v2.0 constructor type signature accepts no `privateKey`; Signer-injection works with Wallet, mock Signer, and one external Signer source; deployment records byte-identical to v1.3.2 for same input | None (coordinates with MC-05)                     |        **YES**        |
| MC-22              | New `dev-env-smoke.yml` workflow invoking diamonds-dev-env test suite; verifies post-MC-04 + post-MC-21 state                                                                   |     2.7 (ESTIMATED) | Smoke workflow runs on every PR; failures block merge; cross-repo regression caught before v2.0 ships                                                                                                | MC-04, MC-05, MC-21 (verifies their joint effect) |          No           |
| MC-13 (v2.0 entry) | CHANGELOG entry documenting v2.0 breaking changes (MC-05 + MC-04 + MC-21) with migration steps                                                                                  |   0.125 (ESTIMATED) | Entry present at v2.0 release; migration steps validated against documentation                                                                                                                       | All Block items                                   |          No           |

**Tier 2 subtotal:** 17.8 maintainer-hours; ~$10.60 token cost; calendar projection ~9-10 weeks at 2 hr/wk. **Coordinated Block alone:** ~13 maintainer-hours (73% of Tier 2).

### 2.3 Tier 3 — Productization

**Principle-weighted rationale:** Tier 3 is the documentation-heavy chain Step 02 explicitly accepted. Maintainability 1.5× drives the layered structure; Correctness Verification 1.5× drives the verification methods (AI proxy-reader tests, link checking, auditor-persona checks).

| MC                                                                        | Chosen Mechanism                                                                                                                |                                     Maint-hrs (Tag) | Verification Method                                                                                                | Dependencies                                      |        Phase 3 Design Brief?         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------: | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | :----------------------------------: |
| MC-06                                                                     | TypeDoc config + initial generation; integrated into MC-08 navigation                                                           |                                     0.8 (ESTIMATED) | TypeDoc output present; no JSDoc gaps in public API; v2.0 stable interface tooled                                  | Coordinated Block complete                        |                  No                  |
| MC-08                                                                     | MkDocs + Material for MkDocs + GitHub Pages deploy + link-checker plugin                                                        |                                     1.6 (ESTIMATED) | Site deploys on every main merge; link-checker passes; search index covers all content                             | MC-06                                             |                  No                  |
| MC-07 Layer 1 (Quickstart)                                                | Single Quickstart page + minimal working example script                                                                         |                                    0.75 (ESTIMATED) | ~5-minute path from clone to working diamond deployment; example runs in MC-22 smoke                               | MC-08                                             | **YES** (IA brief covers all layers) |
| MC-07 Layer 2 (Core Concepts)                                             | 5-6 concept docs (ERC-2535, BaseDeploymentStrategy lifecycle, strategy variants, deployment-record reproducibility, Zod config) |                                     3.0 (ESTIMATED) | Concept docs reviewable; cross-links work; AI proxy-reader answers 5 questions at ≥80%                             | MC-08                                             |         YES (same IA brief)          |
| MC-07 Layer 3 (Reference, 4 docs at ~8 dev-hr each with per-doc variance) | 4 reference docs: writing-a-new-strategy, secure-key-handling, dev-env-integration, auditor-verification                        | 4.0 (ESTIMATED) — **per-doc cut staging available** | Each reference doc reviewable; auditor-persona check produces correct deployment-record verification steps         | MC-04, MC-21, MC-22                               |         YES (same IA brief)          |
| MC-07 examples/                                                           | Working example scripts in `examples/` directory; runnable via MC-22 smoke                                                      |                                     1.0 (ESTIMATED) | Examples run on every PR via MC-22; no example drift from code                                                     | MC-04 (extension example), MC-21 (Signer example) |                  No                  |
| MC-10                                                                     | README productization rewrite; links to MC-07 Layer 1 + MC-08 site + MC-21 post-refactor code snippets                          |                                    0.75 (ESTIMATED) | README serves as productization first-read; code snippets compile against v2.0                                     | MC-07, MC-08, MC-21                               |                  No                  |
| MC-12                                                                     | npm `--provenance` + cyclonedx-npm SBOM + lockfile snapshot + release-evidence artifact in `publish.yml`                        |                                     1.6 (ESTIMATED) | v2.0 publish produces verifiable provenance; SBOM valid CycloneDX 1.5; release-evidence attached to GitHub release | MC-11 publish workflow shell                      |               **YES**                |

**Tier 3 subtotal:** 13.5 maintainer-hours; ~$14.20 token cost; calendar projection ~7 weeks at 2 hr/wk (full Layer 3) or ~5 weeks (Layer 3 partially cut).

### 2.4 Single-Mechanism MC Verification Methods (Inheritance from Step 03)

For the 14 single-mechanism MCs forwarded from Step 03 Section 1.2, the verification method is the per-MC method named above in §2.1-2.3. No additional verification authoring required for synthesis; Phase 6 inherits as drafted.

---

## Section 3: Cost Summary

### 3.1 Per-Tier Totals

| Tier      | Dev-hrs | Maint-hrs |    Tokens |  Token Cost | Tag Distribution                               | Cost-Concentration                                 |
| --------- | ------: | --------: | --------: | ----------: | ---------------------------------------------- | -------------------------------------------------- |
| Tier 1    |      50 |     10.45 |      300K |       $7.40 | All ESTIMATED (dev-hrs), BELIEVED (multiplier) | MC-15 (2.7), MC-16 (2.0), MC-17 (1.3)              |
| Tier 2    |      72 |      17.8 |      432K |      $10.60 | All ESTIMATED, BELIEVED                        | **MC-04 (8.0) is 45% of Tier 2**                   |
| Tier 3    |      96 |      13.5 |      576K |      $14.20 | All ESTIMATED, BELIEVED                        | **MC-07 (9.75 across sub-items) is 72% of Tier 3** |
| **TOTAL** | **218** | **41.75** | **1.31M** | **~$32.20** | —                                              | **MC-07 + MC-04 = 42% of plan**                    |

### 3.2 Floor and Stretch Splits

- **Floor (11 MCs):** 13.975 maint-hrs; ~$17 token cost; ~7 weeks at 2 hr/wk
- **Stretch (11 MCs):** 27.8 maint-hrs; ~$15 token cost; ~14 weeks additional at 2 hr/wk
- **Promotion recommendation:** Promote MC-06 to near-floor (+0.8 hrs); ships v2.0 with TypeDoc API reference

### 3.3 Capacity-vs-Envelope Assessment

**Plan fits the capacity envelope with the floor-as-v2.0 + stretch-as-patch-releases framing.** HC-08 (capacity) is the binding constraint, not HC-03 (token cost ~$32 trivial vs. any meaningful budget anchor).

---

## Section 4: Principle-Weighted Scorecard

### 4.1 Phase 1 Scoring & Metrics CONDITIONAL — Resolved

Phase 1 Step 06 flagged Scoring & Metrics as CONDITIONAL because principle weights were not assigned. **This Plan resolves that CONDITIONAL:** weights are assigned in Step 02 (Section 4.2 below), applied across mechanism choices (Step 03), sequencing (Step 04), and cost modeling (Step 05).

### 4.2 Principle Weights (Reference)

| Principle                | Weight | Source                                                                                   |
| ------------------------ | -----: | ---------------------------------------------------------------------------------------- |
| Security                 |   1.5× | Step 02 §1 — auditor persona + 7 of 22 MCs security-bearing                              |
| Maintainability          |   1.5× | Step 02 §1 — solo maintainer + HC-08 + 16 of 22 MCs touch Maintainability                |
| Economics                |   1.0× | Step 02 §1 — no commercial pressure; capacity envelope binds via Maintainability         |
| Operations               |   1.0× | Step 02 §1 — pre-production state; **explicit deprioritization; future-cycle elevation** |
| Scoring & Metrics        |   1.0× | Step 02 §1 — standard baseline                                                           |
| Correctness Verification |   1.5× | Step 02 §1 — auditor persona consumes verifiable correctness                             |

---

## Section 5: Minimum-Viable Floor and Stretch Scope

### 5.1 Minimum-Viable Floor (from Step 04 §3)

**Floor MCs (11):** MC-02, MC-19, MC-01, MC-13, MC-11, MC-22, MC-21, MC-05, MC-09, MC-10, MC-12.

**Principle-weighted rationale:** The floor is the subset that materially narrows the claims-vs-proof gap. After the floor ships, v2.0 presents to external evaluators with: clean CVE-free deps, npm artifact with provenance + SBOM, CHANGELOG documenting changes, productization-framed README, clean codebase without orphan tooling, CI pipeline enforcing gates, dev-env smoke test confirming consumer-project compatibility, ethers Signer convention (no raw private keys). **Defensible. Not complete — but defensible.**

### 5.2 Stretch Scope

**Stretch MCs (11):** MC-04, MC-06, MC-08, MC-07, MC-03, MC-14, MC-15, MC-16, MC-17, MC-18, MC-20.

**Cut order if capacity exhausts in stretch:** MC-18 → MC-15 → MC-14 → MC-20 → MC-16 → MC-17 → MC-03 → MC-07 partial-Layer-3 → MC-06 → MC-08 → MC-04 (last-cut; cutting it forces NTI-03 to wait one cycle).

### 5.3 MC-07 Per-Layer Staging (from Step 05 §2.4)

| Sub-item                       | Maint-hrs | Floor/Stretch      | Cut Order Within Layer 3                  |
| ------------------------------ | --------: | ------------------ | ----------------------------------------- |
| Layer 1 (Quickstart)           |      0.75 | Floor-load-bearing | Last to cut                               |
| Layer 2 (Core Concepts)        |       3.0 | Floor-load-bearing | Last to cut                               |
| Layer 3 writing-a-new-strategy |       1.0 | Stretch            | #4 (load-bearing for MC-04 ecosystem use) |
| Layer 3 secure-key-handling    |       1.0 | Stretch            | #3 (load-bearing for MC-21)               |
| Layer 3 dev-env-integration    |       1.0 | Stretch            | #2                                        |
| Layer 3 auditor-verification   |       1.0 | Stretch            | #1 (most synthesis-able)                  |
| examples/                      |       1.0 | Floor-load-bearing | Last to cut                               |

---

## Section 6: Phase 3 Design Briefs

Four MCs require Phase 3 design briefs before Phase 5 implementation. Each brief addresses specific design questions surfaced by the mechanism choice.

### 6.1 Brief for MC-04 (Strategy Extension Contract)

**Chosen Mechanism (Step 03):** Formal TypeScript `IDeploymentStrategy` interface + lifecycle methods + JSDoc security-boundary annotations + contract conformance test suite + worked sibling-strategy example.

**Design questions Phase 3 must resolve:**

- What are the specific lifecycle methods in `IDeploymentStrategy`? Pre-deploy, deploy, post-deploy, record-write, error-recovery?
- What security-boundary semantics must JSDoc cover? Specifically: how does an external strategy provably _not_ bypass the deployment-record-writing path that supports auditor reproducibility (F-41)?
- What is the conformance test suite's scope? At minimum: partial-deployment handling, deployment-record migration across diamond cuts, multi-call atomicity.
- What's the worked sibling example? A minimal but functional external strategy that exercises the contract end-to-end.
- How does the contract interact with NTI-03 (`diamonds-safe` consumer)? The contract should be designed knowing diamonds-safe is the most concrete near-term consumer, but not exclusively for diamonds-safe.

**Constraints inherited from Phase 1:**

- MK-08 (ERC-2535 conformance) — contract cannot weaken ERC-2535 guarantees
- HC-05 (v2.0 breaking changes acceptable per-item justified) — breaking is acceptable, capricious is not
- F-41 (auditor reproducibility) — extension contract must preserve this property

**Verification method (for Phase 6 forward awareness):** Contract conformance test passes against worked example; reference external strategy produces auditor-reproducible deployment records.

**Phase 5 implementation note:** Estimate uncertainty is wider than other MCs (24 ± 12 dev-hours plausible per Step 04 Branch 1). Phase 3 design brief completeness should surface estimate refinement before Phase 5 starts.

### 6.2 Brief for MC-21 (Signer-Injection Refactor)

**Chosen Mechanism (Step 03):** Clean break — v2.0 `RPCDeploymentStrategy` constructor takes `signer: Signer` instead of `privateKey`; no shim.

**Design questions Phase 3 must resolve:**

- What is the exact `Signer` interface signature? ethers' `Signer` abstract class as-is, or a Diamonds-specific wrapper?
- What Signer source examples should the migration doc cover? At minimum: ethers `Wallet` (private-key-backed), mock Signer (for tests), and one external Signer source (KMS-backed or hardware-wallet-backed).
- What internal-architecture implications follow? Does any other code path in Diamonds make assumptions about private-key access that the Signer abstraction will break?
- How does the new constructor interact with MC-04's extension contract? The contract must reflect the post-MC-21 interface, not the pre-MC-21 one.

**Constraints inherited from Phase 1:**

- SR-03 (private-key-in-constructor risk) — refactor must close this finding
- MK-01 (deployment record format unchanged) — refactor must preserve byte-identical deployment records for same logical input

**Verification method:** v2.0 constructor type signature; Signer-injection tested against three Signer sources; deployment records byte-identical to v1.3.2 for same input.

### 6.3 Brief for MC-07 (Information Architecture)

**Chosen Mechanism (Step 03):** Three-layer structure (Quickstart / Core Concepts / Reference) + colocated working examples.

**Design questions Phase 3 must resolve:**

- What is the exact concept-doc list in Layer 2? Step 03 sketched 5-6 docs; Phase 3 finalizes the list and ordering.
- What is the cross-link structure between Layers? Specifically: which Layer 2 concepts link forward to which Layer 3 reference docs?
- What is the doc-authoring style guide? Voice, code-block conventions, cross-link conventions, "you" vs. "the developer" addressing, etc. — affects AI-acceleration efficiency in Phase 5.
- What is the per-doc scope for Layer 3 reference docs? Each Layer 3 doc has per-doc variance (per Step 05 §2.4 acknowledgment); Phase 3 firms up scope per doc.

**Constraints inherited from Phase 1:**

- F-25, F-40 (docs-vs-code gap) — narrative must close this gap, not deepen it
- F-41 (auditor reproducibility) — auditor-verification reference doc must surface this property

**Verification method:** AI proxy-reader test against deployed site, 5 questions at ≥80% success rate.

### 6.4 Brief for MC-12 (Release Evidence Schema)

**Chosen Mechanism (Step 03):** npm `--provenance` + cyclonedx-npm SBOM + lockfile snapshot + release-evidence artifact.

**Design questions Phase 3 must resolve:**

- What is the exact release-evidence artifact layout? File list, archive format, naming convention.
- What SBOM contents are required? CycloneDX 1.5 baseline; any Diamonds-specific extensions?
- What is the lockfile-snapshot format? Raw yarn.lock + content hash, or processed dependency tree?
- How does an auditor _use_ the release-evidence artifact? The schema should be designed for auditor consumption, not just for archival.

**Constraints inherited from Phase 1:**

- HC-06 (no external certification required) — schema is for verifiability, not for SLSA Level 2 certification
- F-41 (auditor reproducibility) — release-evidence is how reproducibility surfaces as a feature

**Verification method:** Auditor-persona check: fresh AI session given npm URL + GitHub release URL verifies published code matches released source without practitioner support.

---

## Section 7: Phase 5 Task-List Seed

Tasks ordered by Step 04 sequencing, with Step 05 cost tags and Step 03 acceptance criteria seeds. Phase 5 refines into formal tasks; this seeds the work.

### 7.1 Tier 1 Task Seeds

| Task ID | Source MC     | Description                                       | Acceptance Criteria Seed                                                   | Maint-hrs (Tag) |
| ------- | ------------- | ------------------------------------------------- | -------------------------------------------------------------------------- | --------------: |
| T1-001  | MC-02         | Fix Snyk auth check in `.husky/pre-push`          | Gate fails-closed when Snyk auth missing                                   |       0.2 (EST) |
| T1-002  | MC-02         | Fix OSV output capture in `.husky/pre-push`       | Gate fails-closed when OSV reports critical                                |       0.2 (EST) |
| T1-003  | MC-19         | Single-sweep cleanup PR                           | No-functional-change diff; full test suite passes; no new audit advisories |       0.6 (EST) |
| T1-004  | MC-01         | Replace lodash → es-toolkit/compat                | All existing lodash imports resolved; tests pass                           |       0.8 (EST) |
| T1-005  | MC-01         | Bump axios to ^1.15.0                             | npm audit zero High/Critical                                               |       0.4 (EST) |
| T1-006  | MC-13 mech    | Author CHANGELOG.md skeleton                      | File exists; Keep-a-Changelog format; v1.3.2 baseline                      |       0.6 (EST) |
| T1-007  | MC-14 tooling | Install nyc + Istanbul; capture baseline coverage | Coverage number recorded as MEASURED row                                   |       0.8 (EST) |
| T1-008  | MC-15         | Per-test move-or-reconfigure (7 tests)            | All 7 tests pass in final placement                                        |       2.7 (EST) |
| T1-009  | MC-16         | Net-new external-libraries test file              | Test file present; tests pass; Issue #9 closeable                          |       2.0 (EST) |
| T1-010  | MC-17         | deployInclude test + doc clarification            | Tests + doc added; Issue #10 closeable                                     |       1.3 (EST) |
| T1-011  | MC-18         | Written cadence policy                            | CADENCE.md or CONTRIBUTING.md section                                      |      0.25 (EST) |
| T1-012  | MC-20 config  | ESLint config alignment + pre-commit              | Lint clean; Issue #5 closeable                                             |       0.6 (EST) |

### 7.2 Tier 2 Task Seeds

| Task ID | Source MC  | Description                                                                                       | Acceptance Criteria Seed                                                                           |                  Maint-hrs (Tag) |
| ------- | ---------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------: |
| T2-001  | MC-11      | Author `ci.yml` (PR gates)                                                                        | Build/test/lint/security scans block merge on failure                                              |                        1.0 (EST) |
| T2-002  | MC-11      | Author `publish.yml` shell (extended by MC-12)                                                    | Release-triggered; reuses gates                                                                    |                        0.4 (EST) |
| T2-003  | MC-11      | Author `dev-env-smoke.yml` shell (extended by MC-22)                                              | PR-triggered; smoke test placeholder                                                               |                        0.4 (EST) |
| T2-004  | MC-11      | Iterative CI debug                                                                                | All three workflows complete <5min                                                                 |                        0.6 (EST) |
| T2-005  | MC-14 CI   | Add coverage-floor check to ci.yml                                                                | Below floor blocks merge                                                                           |                        0.4 (EST) |
| T2-006  | MC-20 CI   | Add lint gate to ci.yml                                                                           | Lint failure blocks merge                                                                          |                        0.2 (EST) |
| T2-007  | MC-03      | Author dependabot.yml                                                                             | Dependabot PRs appear; CI validates                                                                |                        0.4 (EST) |
| T2-008  | MC-05      | Cascade-delete Defender                                                                           | No Defender references; tests pass                                                                 |                        0.8 (EST) |
| T2-009  | MC-09      | Delete Defender docs; salvage monitoring-troubleshooting.md                                       | No Defender doc references; salvage reviewed                                                       |                        0.4 (EST) |
| T2-010  | MC-04      | **Phase 3 design brief completion required first.** Then: implement IDeploymentStrategy interface | Interface compiles; JSDoc complete                                                                 | 2.0 (EST) — refined post Phase 3 |
| T2-011  | MC-04      | Author conformance test suite                                                                     | Test suite covers lifecycle, partial deployment, multi-call atomicity, deployment-record migration | 2.5 (EST) — refined post Phase 3 |
| T2-012  | MC-04      | Author worked sibling-strategy example                                                            | Example produces auditor-reproducible deployment                                                   | 2.5 (EST) — refined post Phase 3 |
| T2-013  | MC-04      | Conformance test runs against worked example                                                      | All conformance tests pass                                                                         |                        1.0 (EST) |
| T2-014  | MC-21      | **Phase 3 design brief completion required first.** Then: Signer interface design                 | Signer-injection design firm                                                                       | 0.8 (EST) — refined post Phase 3 |
| T2-015  | MC-21      | Constructor signature change + test rewrite                                                       | v2.0 constructor type signature accepts no privateKey; tests use Signer mocking                    |                        1.0 (EST) |
| T2-016  | MC-21      | Migration doc seed (for Layer 3)                                                                  | Migration doc drafted; three Signer-source examples present                                        |                        0.6 (EST) |
| T2-017  | MC-22      | Author dev-env-smoke.yml implementation                                                           | Invokes diamonds-dev-env suite; failures block merge                                               |                        2.7 (EST) |
| T2-018  | MC-13 v2.0 | CHANGELOG entry for v2.0                                                                          | Entry present at v2.0 release with migration steps                                                 |                      0.125 (EST) |
| T2-019  | All Block  | v2.0 release event                                                                                | Coordinated Block lands together; v2.0 ships                                                       |             (overhead, ~0.3 hrs) |

### 7.3 Tier 3 Task Seeds

| Task ID | Source MC  | Description                                                                                     | Acceptance Criteria Seed                                   |      Maint-hrs (Tag) |
| ------- | ---------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------: |
| T3-001  | MC-06      | TypeDoc config + initial generation                                                             | TypeDoc output present; integrated into MC-08 nav          |            0.8 (EST) |
| T3-002  | MC-08      | MkDocs + Material + GitHub Pages setup                                                          | Site deploys on main merge                                 |            1.0 (EST) |
| T3-003  | MC-08      | Link-checker plugin + search index validation                                                   | Link checker clean; search covers all content              |            0.6 (EST) |
| T3-004  | MC-07 L1   | Quickstart doc + example                                                                        | ~5-min path from clone to deploy                           |           0.75 (EST) |
| T3-005  | MC-07 L2   | Concept docs (5-6 docs)                                                                         | All concept docs reviewable; cross-links work              |            3.0 (EST) |
| T3-006  | MC-07 L3   | Reference: writing-a-new-strategy                                                               | Doc reviewable; reference external strategy works          |            1.0 (EST) |
| T3-007  | MC-07 L3   | Reference: secure-key-handling                                                                  | Doc reviewable; covers Signer-injection patterns           |            1.0 (EST) |
| T3-008  | MC-07 L3   | Reference: dev-env-integration                                                                  | Doc reviewable; matches MC-22 smoke flow                   |            1.0 (EST) |
| T3-009  | MC-07 L3   | Reference: auditor-verification                                                                 | Doc reviewable; auditor-persona AI check passes            |            1.0 (EST) |
| T3-010  | MC-07 ex   | Example scripts in examples/                                                                    | Examples run via MC-22 smoke; no code drift                |            1.0 (EST) |
| T3-011  | MC-10      | README productization rewrite                                                                   | Productization framing; links to L1 + site + v2.0 snippets |           0.75 (EST) |
| T3-012  | MC-12      | **Phase 3 release-evidence schema design required first.** Then: provenance flag in publish.yml | npm provenance attestation visible                         |            0.4 (EST) |
| T3-013  | MC-12      | cyclonedx-npm SBOM generation                                                                   | SBOM valid CycloneDX 1.5                                   |            0.6 (EST) |
| T3-014  | MC-12      | Lockfile-snapshot capture + release-evidence artifact                                           | Evidence bundle attached to GitHub release                 |            0.6 (EST) |
| T3-015  | All Tier 3 | First v2.0 publish-with-provenance event                                                        | Provenance + SBOM + evidence present at npm/release        | (overhead, ~0.2 hrs) |

---

## Section 8: Worst-Case Plan-Failure Narrative (Preserved from Step 04 §5)

### 8.1 Failure Branches

**Branch 1 — Coordinated Block stalls on unforeseen MC-04 complexity.** Tier 1 lands; MC-11 lands; MC-05/MC-21 progress cleanly; MC-04 contract design surfaces edge cases (partial deployment, deployment-record migration, multi-call atomicity) not enumerated in Phase 1. Two-week MC-04 estimate becomes six-week reality. v2.0 doesn't ship by available focus window. Cycle becomes "Tier 1 + Tier 2 partial."

**Branch 2 — Doc-heavy Tier 3 exceeds capacity; Layer 3 quietly disappears.** Tiers 1-2 land. Tier 3 begins. MC-06, MC-08, MC-07 L1+L2 land. Layer 3 reference docs (4 of them, each non-trivial) sit at end of cycle as "next-week" items for several next-weeks. Cycle declared complete on Layer 1+2; auditor-verification doc never written; claim of "auditor-adoption-ready" turns out to be Layer 1+2-adoption-ready.

**Branch 3 — Burst-then-dormant cadence reasserts.** Tier 1 lands in 3-week focused burst. Tier 2 begins. Practitioner attention shifts to a different DiamondsLab project (F-37 pattern). Diamonds enters partial-completion holding for 2-3 months. Feature branch ages; AI session context evaporates; rebase work required when attention returns. Cycle limps to completion 6-12 months later or doesn't complete.

### 8.2 Common Mechanism

> **Load-bearing concentration.** Multiple Phase 2 outcomes depend on a small number of high-leverage MCs reaching completion in the right order. The plan has too few "natural pause points" — places where partial completion produces a coherent intermediate state. When complexity, capacity, or attention discontinuity hits, the plan tends to stall mid-block rather than mid-tier, because the blocks (Coordinated Breaking-Change, Layered Documentation) are themselves the smallest defensible units.

### 8.3 Plan Mitigation (from Step 04 §5.3)

1. **Floor design** is partial mitigation for Branch 3 — Tier 1 + Coordinated Block lands as natural pause point.
2. **MC-04 Phase 3 design brief discipline** mitigates Branch 1 — surface edge cases at design time, not implementation time.
3. **MC-07 Layer 3 per-doc cut staging** mitigates Branch 2 — cut decision is per-doc, not per-Layer.
4. **Phase 7 feature-branch-staleness watch-trigger** mitigates Branch 3 partially — >30 days during active cycle alerts attention-discontinuity.

### 8.4 Residual Risk

Branch 3 (attention discontinuity) is partially un-mitigable; the floor design mitigates _partial_ dormancy but a 6-month mid-Tier-2 dormancy is recoverable only if AI-session context can be reconstructed, feature branch can be rebased, and practitioner attention can re-engage. **Named for Phase 7 watch.**

---

## Section 9: Self-Evaluation Scorecard

Phase 2 deliverables rated against the six Core Principles using Step 02 weights.

| Principle                    | Weight | Rating          | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | -----: | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security**                 |   1.5× | **PASS**        | All security-bearing MCs have chosen mechanisms with documented trade-offs (MC-01, MC-02, MC-03, MC-11, MC-12, MC-21). Sequencing addresses security MCs in principle-weighted order (Tier 1 CVE remediation; Tier 2 Signer injection; Tier 3 provenance). Worst-case narrative branches 1 and 3 explicitly address security failure modes.                                                                                                                                                                                                                                                                                           |
| **Maintainability**          |   1.5× | **PASS**        | Every mechanism choice considers long-term maintainability (MC-04 formal contract testability, MC-08 markdown-first, MC-11 simpler-GitHub-Actions, MC-19 single-sweep). The Plan does not introduce maintainability debt that itself fails to resolve — Plan's own maintainability is preserved through structured task seeds, per-Layer staging, and per-MC verification methods.                                                                                                                                                                                                                                                    |
| **Economics**                |   1.0× | **PASS**        | Per-MC cost estimates with tags throughout (all ESTIMATED at v1.0; BELIEVED multipliers acknowledged). Plan fits envelope (floor at ~7 weeks; full plan at 5-10 months consistent with HC-02 open-ended). Cost concentrations (MC-07 + MC-04 = 42%) named and justified by Step 02 weights and Step 04 mitigations. Opportunity cost named implicitly via HC-08 minority-share framing.                                                                                                                                                                                                                                               |
| **Operations**               |   1.0× | **CONDITIONAL** | Sequencing keeps system operable throughout the cycle (no downtime; v2.0 is the only breaking-change event for current adopters = the practitioner). Coordinated Breaking-Change Block has explicit migration plans (MC-21 migration doc; MC-13 CHANGELOG entry). **However:** Operations was explicitly deprioritized this cycle (weight 1.0×) with elevation deferred to next cycle. Phase 3 should produce specific observability touchpoints for the chosen mechanisms in v2.0 _before_ external adoption begins, even though this cycle doesn't load it. **Resolution required in next cycle, not Phase 3 of this cycle.**       |
| **Scoring & Metrics**        |   1.0× | **PASS**        | Principle weights assigned, justified, traceable to project characteristics (resolves Phase 1 CONDITIONAL). Per-MC cost rows carry tags throughout (ESTIMATED on dev-hours; BELIEVED on multipliers — honest given no historical calibration). Acceptance criteria measurable per MC. Plan success checkable against Phase 1 baselines.                                                                                                                                                                                                                                                                                               |
| **Correctness Verification** |   1.5× | **CONDITIONAL** | Every mechanism choice has a verification method named in §2.1-2.3. Road not taken is documented for every Step 03 mechanism decision. Phase 6 verification plan is seeded via per-MC methods. **However:** Some verification methods are AI-proxy-reader-tests and auditor-persona-checks that are themselves novel verification mechanisms — Phase 3 should produce specific verification artifacts (the proxy-reader question set, the auditor-persona prompt, the conformance test scope) before Phase 5 implements. **Resolution path: Phase 3 produces verification-artifact specifications alongside the four design briefs.** |

**Overall Phase 2 self-assessment:** **4 PASS + 2 CONDITIONAL** — within the prompt's target range of 4-5 PASS + 1-2 CONDITIONAL.

**Phase 3 Readiness:** **READY WITH REMEDIATION** — both CONDITIONALs have named Phase 3 actions:

1. _Operations CONDITIONAL_ → Phase 3 produces observability touchpoint design for v2.0 chosen mechanisms; next-cycle Phase 2 re-weights Operations.
2. _Correctness Verification CONDITIONAL_ → Phase 3 produces verification-artifact specifications alongside design briefs for MC-04, MC-21, MC-07, MC-12.

---

## Section 10: Gaps and Forward Handoffs

### 10.1 Decisions Deferred to Phase 3

| Decision                                                                    | Phase 3 Activity            | Notes                                                                                |
| --------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| MC-04 contract surface specifics                                            | Phase 3 design brief §6.1   | Surface edge cases at design time (Branch 1 mitigation)                              |
| MC-21 Signer interface specifics                                            | Phase 3 design brief §6.2   | Three Signer source examples enumerated                                              |
| MC-07 Information Architecture finalization                                 | Phase 3 design brief §6.3   | Concept-doc list, cross-link structure, style guide                                  |
| MC-12 release-evidence schema                                               | Phase 3 design brief §6.4   | Artifact layout, SBOM schema, lockfile-snapshot format                               |
| Observability touchpoint design (Operations CONDITIONAL)                    | Phase 3 supplementary brief | v2.0 chosen mechanisms get observability hooks for future-cycle Operations elevation |
| Verification-artifact specifications (Correctness Verification CONDITIONAL) | Phase 3 supplementary brief | Proxy-reader question set, auditor-persona prompt, MC-04 conformance test scope      |

### 10.2 Decisions Deferred to Phase 5

| Decision                                                      | Phase 5 Activity               | Notes                                                  |
| ------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------ |
| MC-15 per-test move-or-reconfigure                            | Phase 5 per-test analysis      | Phase 2 single-mechanism; Phase 5 makes per-test calls |
| MC-07 Layer 3 per-doc cut decisions                           | Phase 5 ongoing capacity-check | Per-doc cut order in §5.3 if capacity exhausts         |
| Real estimate refinement for MC-04 after Phase 3 design brief | Phase 5 pre-implementation     | Wider uncertainty acknowledged in §6.1                 |

### 10.3 Items Acknowledged as Unresolved

| Item                                               | Rationale                                          | Phase 7 Watch-Trigger                                                                           |
| -------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Build reproducibility outside DevContainer (VG-05) | Acknowledged UNMEASURED; Phase 5 verification task | None this cycle                                                                                 |
| Time from clone to green test (adopter ramp-up)    | Phase 6 proxy measurement                          | Watch first external adopter ramp-up                                                            |
| External-contributor doc adequacy                  | Phase 6 AI-assisted proxy reader test              | Same                                                                                            |
| Hotfix MTTR                                        | UNMEASURED (no hotfix events recorded)             | Watch first hotfix event                                                                        |
| Operations elevation deferred to next cycle        | Explicit Step 02 deprioritization                  | Next-cycle Phase 2 re-weighting                                                                 |
| Feature-branch staleness during active cycle       | Branch 3 worst-case residual risk                  | Alert at >30 days during active cycle                                                           |
| AI-acceleration multiplier calibration (P2-Obs-04) | BELIEVED at v1.0; needs empirical data             | Phase 7 ops-tracking captures real dev-hour-to-maintainer-hour ratios; calibrates future cycles |

### 10.4 Forward Handoffs to Each Phase

- **Phase 3 (Design & Technical Analysis):** Four design briefs (§6) + two supplementary briefs (observability, verification artifacts) + the Phase 5 task-list seeds as anchoring inputs
- **Phase 4 (Architecture & Modular Design):** Coordinated Block (MC-04 + MC-21 + MC-22) module-boundary design uses the Phase 3 contract specifications
- **Phase 5 (Implementation):** Task-list seeds (§7) with per-MC acceptance criteria; per-Layer-3 staging cut order; MC-04 estimate refinement post Phase 3
- **Phase 6 (Testing & Audit):** Per-MC verification methods (§2) inherit directly; conformance tests + AI proxy-reader + auditor-persona checks are Phase 6 instruments
- **Phase 7 (Deployment & Evolution):** Run-cost projection (~$32 plan; ongoing per-MC empirical token measurement); v2.0 launch event; six watch-triggers from §10.3
- **Next-Cycle Phase 2:** Operations re-weighting; AI-acceleration multiplier calibration data; updated Phase 1 toolkit (per VG-02, VG-03, VG-04)

---

## Section 11: Source & Evidence Register

- **Phase 1 Current-State Information Report (Step 06 synthesis, completed 2026-04-20)** — primary upstream input
- **Phase 2 Step 01 (Phase 1 Input Validation, completed 2026-05-22)** — confirmed Phase 1 understanding; produced VG-01..05 register
- **Phase 2 Step 02 (Principle Weighting, completed 2026-05-22)** — weights applied throughout; resolved Phase 1 CONDITIONAL on Scoring & Metrics
- **Phase 2 Step 03 (Mechanism Decisions, completed 2026-05-22)** — chosen mechanisms, alternatives considered, verification methods, inter-MC dependencies
- **Phase 2 Step 04 (Sequencing and Tiering, completed 2026-05-22)** — tiered sequence, minimum-viable floor, stretch scope, worst-case-plan-failure narrative with common-mechanism naming
- **Phase 2 Step 05 (Cost Modeling and Capacity Check, completed 2026-05-22)** — per-MC cost rows with three-quantity model, capacity assessment, MC-06 promotion recommendation
- **Specify-time cost-model amendments (2026-05-22)** — three-quantity cost model with AI-acceleration multipliers, token-count projection, token-cost projection (captured as P2-Obs-01..03)
- **Context7 library lookups (2026-05-22)** — es-toolkit/compat (MC-01), MkDocs Material (MC-08)
- **GitHub MCP (2026-05-22)** — confirmed open-issue context
- **Practitioner confirmations throughout (2026-05-22)** — final authority on all 22 MC mechanism decisions, principle weights, sequencing, cost estimates, scorecard ratings
