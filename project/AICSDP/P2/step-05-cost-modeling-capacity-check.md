# Cost Modeling and Capacity Check

# @diamondslab/diamonds — Phase 2 Cycle

**Cost Modeling Date:** 2026-05-22
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Cost Model:** Three-quantity model adopted in-line during Specify (P2-Obs-01, P2-Obs-02 captures the model gap in Phase 2 v1.0; v1.1 will formalize)

---

## 1. Cost Dimensions

| Dimension                  | Primary/Secondary | Tag                                          | Applies To | Definition                                                                                       |
| -------------------------- | ----------------- | -------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| Dev-hours                  | Primary           | MEASURED / ESTIMATED / BELIEVED / UNMEASURED | All MCs    | Senior Developer baseline, without AI assistance                                                 |
| AI-acceleration multiplier | Derivation        | BELIEVED at v1.0                             | All MCs    | Per-category default: mechanical cleanup 10×, doc authorship 8×, config edit 5×, novel design 3× |
| Maintainer-hours           | Derived           | (inherited from inputs)                      | All MCs    | dev-hours ÷ multiplier; what HC-08 caps                                                          |
| Token-count projection     | Derived           | BELIEVED                                     | All MCs    | dev-hours × 6,000 tokens/hr                                                                      |
| Token-cost projection      | Derived           | ESTIMATED                                    | All MCs    | tokens × ~$2.50/100K (Opus 4.7 mixed input/output midpoint)                                      |

**Cost dimensions not in this artifact (explicitly considered, deemed N/A or implicit):**

- **Opportunity cost** — captured implicitly by HC-08's "minority share" qualifier
- **On-call burden** — N/A (no SLA exposure per F-39)
- **Customer-facing disruption** — N/A (zero external adopters per F-39)
- **Coordination overhead** — implicit in MC-22 cost and Coordinated Block structural cost

---

## 2. Per-MC Cost Rows

### 2.1 Tier 1 — Foundation

| MC                | Dev-hrs | DH Tag    | Category & Multiplier                   | Maint-hrs |   Tokens | Token Cost | Rationale                                                                                                        |
| ----------------- | ------: | --------- | --------------------------------------- | --------: | -------: | ---------: | ---------------------------------------------------------------------------------------------------------------- |
| MC-02             |       2 | ESTIMATED | Config edit 5×                          |       0.4 |      12K |      $0.30 | Two specific bug fixes in `.husky/pre-push` per F-13/F-14; mechanical with verification                          |
| MC-19             |       6 | ESTIMATED | Mechanical cleanup 10×                  |       0.6 |      36K |      $0.85 | Single-sweep PR: delete `scripts/devops/` + `scripts/` + 6 unused devDeps + 2 `.npmignore` lines + 1 git URL pin |
| MC-01             |      12 | ESTIMATED | Mechanical cleanup 10× + config edit 5× |       1.2 |      72K |      $1.75 | es-toolkit/compat drop-in for lodash; axios `^1.15.0` patch bump                                                 |
| MC-13 (mech)      |       3 | ESTIMATED | Config edit 5×                          |       0.6 |      18K |      $0.45 | Author CHANGELOG.md skeleton + Keep-a-Changelog format + v1.3.2-baseline entry                                   |
| MC-14 (tooling)   |       4 | ESTIMATED | Config edit 5×                          |       0.8 |      24K |      $0.60 | Install nyc + Istanbul + capture baseline coverage; CI floor half deferred to Tier 2                             |
| MC-15             |       8 | ESTIMATED | Novel design 3×                         |       2.7 |      48K |      $1.20 | Per-test move-or-reconfigure across 7 misplaced tests; per-test fixture analysis                                 |
| MC-16             |       6 | ESTIMATED | Novel design 3×                         |       2.0 |      36K |      $0.90 | Net-new test file for external-libraries functionality (Issue #9)                                                |
| MC-17             |       4 | ESTIMATED | Novel design 3×                         |       1.3 |      24K |      $0.60 | Test additions + doc clarification for `deployInclude` (Issue #10)                                               |
| MC-18             |       2 | ESTIMATED | Doc authorship 8×                       |      0.25 |      12K |      $0.30 | Written cadence policy artifact                                                                                  |
| MC-20 (config)    |       3 | ESTIMATED | Config edit 5×                          |       0.6 |      18K |      $0.45 | ESLint config alignment + pre-commit hook (Issue #5)                                                             |
| **Tier 1 totals** |  **50** | —         | —                                       | **10.45** | **300K** |  **$7.40** | —                                                                                                                |

### 2.2 Tier 2 — Capability + Coordinated Breaking-Change Block

| MC                 | Dev-hrs | DH Tag    | Category & Multiplier              | Maint-hrs |   Tokens | Token Cost | Rationale                                                                                                                                                                                                                       |
| ------------------ | ------: | --------- | ---------------------------------- | --------: | -------: | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MC-11              |      12 | ESTIMATED | Config edit 5×                     |       2.4 |      72K |      $1.75 | Three GitHub Actions workflows (`ci.yml`, `publish.yml` shell, `dev-env-smoke.yml`); iterative debug                                                                                                                            |
| MC-14 (CI floor)   |       2 | ESTIMATED | Config edit 5×                     |       0.4 |      12K |      $0.30 | Coverage-floor check added to `ci.yml`; trivial extension                                                                                                                                                                       |
| MC-20 (CI half)    |       1 | ESTIMATED | Config edit 5×                     |       0.2 |       6K |      $0.15 | Lint gate added to `ci.yml`; trivial                                                                                                                                                                                            |
| MC-03              |       2 | ESTIMATED | Config edit 5×                     |       0.4 |      12K |      $0.30 | `.github/dependabot.yml` config; convention-following                                                                                                                                                                           |
| MC-05              |       8 | ESTIMATED | Mechanical cleanup 10×             |       0.8 |      48K |      $1.15 | Cascade-delete OZDefenderDeploymentStrategy + tests + scripts + deps + references                                                                                                                                               |
| MC-09              |       4 | ESTIMATED | Mechanical cleanup 10×             |       0.4 |      24K |      $0.60 | Delete Defender docs + selective rewrite of `monitoring-troubleshooting.md` salvage                                                                                                                                             |
| **MC-04**          |  **24** | ESTIMATED | Novel design 3×                    |   **8.0** |     144K |      $3.50 | **Heaviest single MC in Tier 2.** Formal TypeScript interface + lifecycle methods + JSDoc security boundaries + conformance test suite + worked sibling example. _Wider uncertainty range than other MCs per Step 04 Branch 1._ |
| MC-21              |      10 | ESTIMATED | Novel design 3× + mech cleanup 10× |       2.4 |      60K |      $1.50 | Signer interface design + constructor signature change + test rewrite for Signer mocking + migration doc seed                                                                                                                   |
| MC-22              |       8 | ESTIMATED | Novel design 3×                    |       2.7 |      48K |      $1.20 | New GitHub Actions workflow invoking diamonds-dev-env; cross-repo verification scaffolding                                                                                                                                      |
| MC-13 (v2.0 entry) |       1 | ESTIMATED | Doc authorship 8×                  |     0.125 |       6K |      $0.15 | CHANGELOG entry for v2.0 breaking changes                                                                                                                                                                                       |
| **Tier 2 totals**  |  **72** | —         | —                                  |  **17.8** | **432K** | **$10.60** | —                                                                                                                                                                                                                               |

### 2.3 Tier 3 — Productization

| MC                | Dev-hrs | DH Tag    | Category & Multiplier | Maint-hrs |   Tokens | Token Cost | Rationale                                                                                          |
| ----------------- | ------: | --------- | --------------------- | --------: | -------: | ---------: | -------------------------------------------------------------------------------------------------- |
| MC-06             |       4 | ESTIMATED | Config edit 5×        |       0.8 |      24K |      $0.60 | TypeDoc config + initial generation; AI debugs JSDoc gaps                                          |
| MC-08             |       8 | ESTIMATED | Config edit 5×        |       1.6 |      48K |      $1.20 | MkDocs + Material setup, navigation, GitHub Pages deploy, plugins                                  |
| MC-07 Layer 1     |       6 | ESTIMATED | Doc authorship 8×     |      0.75 |      36K |      $0.90 | Quickstart page + minimal working example                                                          |
| MC-07 Layer 2     |      24 | ESTIMATED | Doc authorship 8×     |       3.0 |     144K |      $3.50 | 5-6 concept docs; narrative authorship                                                             |
| MC-07 Layer 3     |      32 | ESTIMATED | Doc authorship 8×     |       4.0 |     192K |      $4.70 | 4 reference docs at ~8 dev-hrs each (per-doc variance acknowledged); per-doc cut staging available |
| MC-07 examples/   |       8 | ESTIMATED | Doc authorship 8×     |       1.0 |      48K |      $1.20 | Working example scripts; runnable via MC-22 smoke                                                  |
| MC-10             |       6 | ESTIMATED | Doc authorship 8×     |      0.75 |      36K |      $0.90 | README productization rewrite; productization framing                                              |
| MC-12             |       8 | ESTIMATED | Config edit 5×        |       1.6 |      48K |      $1.20 | Provenance + cyclonedx-npm SBOM + release-evidence packaging in `publish.yml`                      |
| **Tier 3 totals** |  **96** | —         | —                     |  **13.5** | **576K** | **$14.20** | —                                                                                                  |

### 2.4 MC-07 Per-Layer Breakout (Staging Reference)

Per Step 04 Mitigation 3 — partial-Layer-3 staging:

| MC-07 sub-item                   | Dev-hrs | Maint-hrs | Floor/Stretch      |                                           Cut Order |
| -------------------------------- | ------: | --------: | ------------------ | --------------------------------------------------: |
| Layer 1 (Quickstart)             |       6 |      0.75 | Floor-load-bearing |                                         Last to cut |
| Layer 2 (Core Concepts)          |      24 |       3.0 | Floor-load-bearing |                                         Last to cut |
| Layer 3 — writing-a-new-strategy |       8 |       1.0 | Stretch            | Cut order #4 (load-bearing for MC-04 ecosystem use) |
| Layer 3 — secure-key-handling    |       8 |       1.0 | Stretch            |               Cut order #3 (load-bearing for MC-21) |
| Layer 3 — dev-env-integration    |       8 |       1.0 | Stretch            |                                        Cut order #2 |
| Layer 3 — auditor-verification   |       8 |       1.0 | Stretch            |  Cut order #1 (most synthesis-able from other docs) |
| examples/                        |       8 |       1.0 | Floor-load-bearing |                       Last to cut (MC-22 runs them) |

---

## 3. Plan Summary

### 3.1 Full-Scope Total

| Tier                                    | Dev-hrs | Maint-hrs |    Tokens |  Token Cost |
| --------------------------------------- | ------: | --------: | --------: | ----------: |
| Tier 1 (Foundation)                     |      50 |     10.45 |      300K |       $7.40 |
| Tier 2 (Capability + Coordinated Block) |      72 |      17.8 |      432K |      $10.60 |
| Tier 3 (Productization)                 |      96 |      13.5 |      576K |      $14.20 |
| **Plan TOTAL**                          | **218** | **41.75** | **1.31M** | **~$32.20** |

### 3.2 Minimum-Viable Floor (11 MCs)

| Floor MC                  |                   Maint-hrs |
| ------------------------- | --------------------------: |
| MC-02                     |                         0.4 |
| MC-19                     |                         0.6 |
| MC-01                     |                         1.2 |
| MC-13 (mech + v2.0 entry) |                       0.725 |
| MC-11                     |                         2.4 |
| MC-22                     |                         2.7 |
| MC-21                     |                         2.4 |
| MC-05                     |                         0.8 |
| MC-09                     |                         0.4 |
| MC-10                     |                        0.75 |
| MC-12                     |                         1.6 |
| **Floor TOTAL**           | **13.975** maintainer-hours |

**Floor token cost:** ~$17 API total.

### 3.3 Stretch Delta

Stretch scope (11 MCs above floor) = **27.8 maintainer-hours**, **~$15 token cost**.

---

## 4. Capacity-vs-Envelope Comparison

**Envelope:** HC-08 = <5 hr/week ecosystem total, Diamonds-specific minority share. Working assumption: **~2 hr/week for Diamonds.**

**Plan demand at varying capacity rates:**

| Scope                                                                 | Maint-hrs | At 2 hr/wk continuous     | At 1 hr/wk (heavy ecosystem demand) |
| --------------------------------------------------------------------- | --------: | :------------------------ | :---------------------------------- |
| Floor (11 MCs)                                                        |    13.975 | **~7 weeks**              | ~14 weeks                           |
| Floor + most-load-bearing stretch (+MC-04, MC-06, MC-08, MC-07 L1-L2) |      27.1 | ~13-14 weeks              | ~27 weeks                           |
| Full plan                                                             |     41.75 | **~21 weeks (≈5 months)** | ~42 weeks (≈10 months)              |

### 4.1 Assessment

**Floor fits comfortably.** At 2 hr/wk continuous, floor completes in ~7 calendar weeks. Even accounting for one mid-cycle dormancy of 4-8 weeks (per F-37 burst-then-dormant pattern), floor-only completion in 3-4 months is achievable.

**Floor + Layer 1+2 docs + MC-04 fits with stretch awareness.** ~27 maintainer-hours at 2 hr/wk ≈ 3-4 months focused work. With one dormancy gap = 5-7 months. Acceptable per HC-02 open-ended timeline.

**Full plan is honestly out of single-burst capacity.** 42 hours at 2 hr/wk continuous = 5 months focused; realistic completion (per F-37 cadence) is 7-10 months. **This is consistent with HC-02 (open-ended) but full-plan completion in one continuous cycle is unrealistic.**

**Constraint that would bind first:** **HC-08 capacity envelope.** Not HC-03 (token cost ~$32 total is trivial vs. any budget anchor).

### 4.2 Capacity-Bound Recommendation

**Execute the plan as drafted, treating the floor as the v2.0 release milestone and stretch as ongoing post-v2.0 polish.**

The floor is the natural v2.0 ship-event. Stretch items land as patch releases (v2.0.x) over subsequent months. This matches MC-18 (sustainable cadence policy) by design — the cycle's release rhythm becomes the v2.0 launch + patch-release maintenance, not "one big release containing everything."

**Promotion candidates from Step 04 considered:**

- **MC-04** — already in floor (correct per Step 04 §3.1).
- **MC-06** — lightweight (0.8 maint-hrs); promote to "near-floor" for v2.0 publish-event. _Promotion recommended_ — adding 0.8 hrs to floor brings it to 14.8 hrs, still comfortable at 2 hr/wk = ~7.5 weeks; gains TypeDoc API reference at v2.0 ship-event.

---

## 5. Re-Sequencing Recommendation

**Plan fits capacity with the floor-as-v2.0 + stretch-as-patch-releases framing.** No fundamental re-sequencing required.

One adjustment recommended:

**Promote MC-06 to floor (near-floor adjacent to MC-12).** Adds 0.8 maintainer-hours; lets v2.0 ship with TypeDoc API reference available, which is one of the most asked-for affordances for external evaluation. Floor becomes 14.775 maint-hrs ≈ ~7.5 weeks at 2 hr/wk.

Other Step 04 promotion candidates (MC-04 already in floor):

- **MC-08 (MkDocs site)** — at 1.6 maint-hrs, also relatively cheap, but value depends on MC-07 Layer 1 being authored. Keep in stretch unless Layer 1 also promotes.

**Recommendation: Promote MC-06 only.** Keep MC-08 and MC-07 layers in stretch as drafted.

---

## 6. Cost-Concentration Analysis

| MC                                       | Maint-hrs | % of Plan | Justified?                                                                                                            |
| ---------------------------------------- | --------: | --------: | --------------------------------------------------------------------------------------------------------------------- |
| MC-07 (all layers + examples)            |      9.75 |   **23%** | Yes — Maintainability 1.5× elevation; Layer 3 per-doc staging mitigates                                               |
| MC-04                                    |       8.0 |   **19%** | Yes — Correctness Verification 1.5×; Step 04 Mitigation 2 (Phase 3 design brief discipline) addresses complexity risk |
| MC-15                                    |       2.7 |        6% | Yes — per-test analysis necessary                                                                                     |
| MC-22                                    |       2.7 |        6% | Yes — cross-repo verification scaffolding                                                                             |
| MC-11                                    |       2.4 |        6% | Yes — three workflows; standard CI authoring                                                                          |
| MC-21                                    |       2.4 |        6% | Yes — Signer design is real work                                                                                      |
| MC-16                                    |       2.0 |        5% | Yes — test design for novel feature                                                                                   |
| MC-12                                    |       1.6 |        4% | Yes — SBOM + release-evidence; new tooling integration                                                                |
| MC-08                                    |       1.6 |        4% | Yes — site infrastructure                                                                                             |
| MC-01                                    |       1.2 |        3% | Yes — migration plus verification                                                                                     |
| **Top 2 concentrations (MC-07 + MC-04)** | **17.75** |   **42%** | **Justified by Step 02 weights and Step 04 mitigations**                                                              |

**Phase 5 attention flags:**

- MC-07 Layer 3 per-doc completion tracking (use the per-Layer breakout from §2.4 as Phase 5 task-list seeds)
- MC-04 Phase 3 design brief completeness before Phase 5 implementation starts

---

## 7. Tag-Distribution Honesty Check

**Project profile:** Solo OSS (no time tracking; pre-production; <5 hr/week budget; AI-Centric SD practice).
**Expected tag-dominance:** ESTIMATED-dominant per Phase 2 prompt reference table.

**Actual tag-dominance in this plan:**

- Dev-hours: **100% ESTIMATED** (correct — no historical time tracking exists)
- AI-acceleration multipliers: **100% BELIEVED** (per-category defaults from v1.0 toolkit; no Diamonds-specific calibration yet)
- Token-count: **BELIEVED** (derived from BELIEVED multiplier × ESTIMATED dev-hours × default 6,000 tokens/hr)
- Token-cost: **ESTIMATED** (Opus 4.7 pricing has known range)

**Match: Honest.** No MEASURED tags claimed (correct given no time tracking). No UNMEASURED tags (every cost has at least ESTIMATED basis). No over-confident BELIEVED tags on items that could be ESTIMATED.

**Forward note for Phase 7 calibration (P2-Obs-04):** First Phase 5 execution of this plan should track:

- Actual dev-hour-to-maintainer-hour ratios per work category (validates the 10×/8×/5×/3× defaults against real practice)
- Actual token usage per MC (validates the 6,000 tokens/dev-hr default)
- Actual API cost per MC (validates the $2-3/100K-token mid-range)

Phase 7 ops-tracking should produce a calibration dataset that lets future Phase 2 cycles graduate from BELIEVED to ESTIMATED, and eventually to MEASURED on a per-category basis.

---

## 8. Comprehensiveness Check Result

**Q-Compr-1 — Cost dimension missing?** Practitioner confirmed all good. The five-dimension model is sufficient for solo OSS pre-production; opportunity/on-call/customer-disruption/coordination are correctly absent (N/A or implicit).

**Q-Compr-2 — Cost-estimate tagging feel wrong?** Practitioner confirmed all good. Two items I flagged for awareness, both accepted as-drafted:

- MC-04 ESTIMATED at 24 dev-hr has wider uncertainty range (24 ± 12 plausible per Step 04 Branch 1) — acknowledged
- MC-07 Layer 3 sub-items at uniform 8 dev-hr each have per-doc variance (4-12 hr range) — acknowledged

---

## 9. Forward Implications

### 9.1 For Step 06 (Synthesis)

**Key cost insights to highlight in the Improvement Plan's executive summary:**

1. **Floor is the natural v2.0 ship-event** at ~14 maint-hrs / ~7 weeks. The plan reframes from "one big cycle producing everything" to "v2.0 release + sustained patch-release maintenance" — which matches MC-18's cadence-policy intent.
2. **MC-04 + MC-07 are 42% of plan cost** but both are weight-justified and have mitigation patterns in place.
3. **Token cost is trivial** (~$32 total full plan; ~$17 floor-only) — HC-03's AI-usage budget layer is comfortably bounded; HC-08 capacity is the binding constraint.
4. **Recommended floor promotion: MC-06** (adds 0.8 hrs; v2.0 ships with TypeDoc API reference).

### 9.2 For Phase 5 (Execution)

**Per-tier capacity expectations:**

- **Tier 1:** ~10.45 maint-hrs over ~5-6 calendar weeks at 2 hr/wk Diamonds
- **Tier 2:** ~17.8 maint-hrs over ~9-10 calendar weeks (Coordinated Block dominates; MC-04 is ~5 weeks alone)
- **Tier 3:** ~13.5 maint-hrs over ~7 calendar weeks (full Layer 3), or ~9.5 maint-hrs over ~5 weeks (Layer 1+2 + examples only)

**Phase 5 attention flags:**

- **MC-07 Layer 3 per-doc completion tracking** — use §2.4 per-Layer breakout as task-list seed
- **MC-04 Phase 3 design brief** must complete before Phase 5 starts on MC-04
- **MC-04 estimate uncertainty** — Phase 5 should re-estimate MC-04 dev-hours when the Phase 3 design brief surfaces the contract surface specifics

### 9.3 For Phase 7 (Run-Cost & Empirical Calibration)

**Forward-handoff items:**

- Token-baseline empirical validation (P2-Obs-04) — first Phase 5 execution tracks real dev-hours, token usage, and category multipliers
- v2.0 production deployment + maintenance cycle's ongoing AI-usage cost (HC-03 two-layer budget visibility)
- Feature-branch staleness watch-trigger (Step 04 Branch 3 mitigation) — alert at >30 days during active cycle

---

## 10. Sources & Evidence Register

- **Phase 1 Input Validation (Step 01)** — HC-08 capacity envelope; HC-03 amended two-layer budget; F-39 ops-burden baseline
- **Principle Weighting (Step 02)** — weights informing cost-concentration justification
- **Mechanism Decisions (Step 03)** — per-MC mechanism-cost basis (es-toolkit/compat for MC-01; formal contract scope for MC-04; MkDocs for MC-08; single-sweep for MC-19; clean-break for MC-21)
- **Sequencing and Tiering (Step 04)** — tier composition, floor/stretch composition, per-Layer-3 staging mitigation, MC-07 capacity-collision flag
- **Specify-time cost-model amendments (2026-05-22)** — three-quantity cost model with AI-acceleration multipliers, token-count projection, token-cost projection
- **Practitioner confirmations 2026-05-22** — final authority on all per-MC rows, capacity assessment, MC-06 promotion recommendation, both comprehensiveness-check items
