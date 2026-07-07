# Step 04 — Inter-Artifact Coordination Register

> **Status:** ✅ FINALIZED v1.0 — OP-7 ratified (draft-and-react, Owner 2026-07-07) · **Date:** 2026-07-07
> **Consumes:** the six Step 03 briefs' §9 Cross-Brief References (MC-04, MC-21, MC-12 [Session 1]; MC-07, Observability, Verification [M1]) + M0 crossover note. **Interview mode:** draft-and-react.

---

## §0 — Phase-2 Invalidations Surfaced in Step 03

**Empty.** All six briefs produced Phase-2 invalidation check = **No** (Session 1: MC-04/MC-21/MC-12; M1: MC-07 §6, Observability §6, Verification §6). Consistent with the M0 no-amendment verdict. Step 06 §7 Amendment Package stays empty.

## §1 — Cross-Artifact References (bidirectional)

| Source brief §9 ref                         | Target                           | Back-reference present?                        |
| ------------------------------------------- | -------------------------------- | ---------------------------------------------- |
| MC-04 → migration doc                       | MC-21                            | ✅ MC-21 §2.4 → migration doc (co-authored)    |
| MC-04 → conformance output consumed by      | MC-12                            | ✅ MC-12 §2.1 `files.conformance`              |
| MC-04 → LoggingDeploymentStrategy reused by | Observability                    | ✅ Observability §9 → MC-04 vehicle            |
| MC-21 → migration doc                       | MC-04                            | ✅ (bidirectional; effort attributed to MC-04) |
| MC-12 → conformance format                  | MC-04                            | ✅ MC-04 §2.4 release-evidence tier            |
| MC-07 → how-to-write-a-strategy             | MC-04                            | ✅ (LoggingDeploymentStrategy worked example)  |
| MC-07 → migration-v1-to-v2                  | MC-21                            | ✅                                             |
| MC-07 → verify-a-release                    | MC-12                            | ✅ (four-spoke)                                |
| Observability → Signer resolution           | MC-21                            | ✅                                             |
| Observability → publish/CI events           | MC-11 (real release.yml) / MC-12 | ✅ (M0 grounding)                              |
| Verification I-1..I-4 → four primaries      | MC-04/21/07/12                   | ✅ (§5 below)                                  |

All references are bidirectional or intentionally one-way (noted). No dangling references.

### §1.1 — P3-Obs-09 Reconciliation (cohort citation drift)

**Fixed here (register-level).** The MC-21 Session 1 artifact §2.4 cites the coordinated cohort as _"MC-04 + MC-21 + MC-22 + MC-13 per Plan §5.2."_ **Correction:** the cohort is defined in **Plan §2.2** (not §5.2, which is "Stretch Scope"), and is a **five-member** set that **includes MC-05**: **MC-05 + MC-04 + MC-21 + MC-22 + MC-13** (see §4). This register is the authoritative cohort statement; the MC-21 artifact erratum is logged for the M4 review (P3-Obs-09) rather than rewritten here.

## §2 — Latent Cross-References Surfaced in Step 04

- **Observability ↔ Verification:** the `*.outcome` counters (Observability E.1) and the `onchain.tx`/`state.transition` logs are _evidence sources_ the I-1 conformance harness and I-4 auditor can draw on. Latent but non-conflicting — noted for Phase 5.
- **MC-07 verify-a-release ↔ MC-12 auditor / Verification I-4:** the L3 reference doc and the auditor-persona instrument describe the same four-spoke flow from two angles (reader doc vs verification instrument). Keep them consistent in Phase 5 (single source: MC-12 §2.4).

## §3 — Shared Design Decisions

| Shared artifact                                    | Briefs                                                           | Attribution / rule                                                              |
| -------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `examples/migration-v1-to-v2.md`                   | MC-04 + MC-21 (+ MC-07 references it)                            | Co-authored; **effort attributed to MC-04** (double-count avoidance)            |
| `LoggingDeploymentStrategy`                        | MC-04 (defines) + Observability (reuses as vehicle)              | Single implementation; Observability adds only the counter layer                |
| Conformance output (`diamonds-conformance-v1.0`)   | MC-04 (produces) + MC-12 (bundles) + Verification I-1 (executes) | Format defined by MC-04 Phase 5; consumed by MC-12 manifest `files.conformance` |
| `reference/verify-a-release.md` ↔ auditor-persona | MC-07 + MC-12 + Verification I-4                                 | Single four-spoke source (MC-12 §2.4)                                           |

## §4 — Phase 5 Implementation Ordering + Coordinated Landing Cohort

**Coordinated Landing Cohort (v2.0 entry, Plan §2.2):** **MC-05 + MC-04 + MC-21 + MC-22 + MC-13** land together as the single v2.0 breaking release.

- **MC-05** (OZDefender cascade-delete) — still shipped as-is in 1.5.0 (M0 crossover); removed at v2.0.
- **MC-04** (IDeploymentStrategy) → anchor; **MC-21** (Signer refactor) depends on MC-04; **MC-22** (dev-env-smoke.yml) depends on MC-04+MC-05+MC-21; **MC-13** (v2.0 CHANGELOG) documents the breaking set.

**Ordering:** MC-04 → MC-21 → MC-05 → MC-22 → MC-13; docs (MC-07) and observability/verification instruments author in parallel; MC-12 evidence bundle extends the already-shipped `release.yml` last.

## §5 — Verification Dependencies (→ Step 05 input)

| Instrument                      | Verifies                                                              | Execution   |
| ------------------------------- | --------------------------------------------------------------------- | ----------- |
| I-1 Conformance suite + harness | MC-04                                                                 | Per-PR CI   |
| I-2 MK-01 byte-identity         | MC-21                                                                 | Per-PR CI   |
| I-3 Proxy-reader question set   | MC-07                                                                 | Pre-release |
| I-4 Auditor-persona prompt      | MC-12 (+ transitively MC-04 conformance, MC-21 migration via Spoke C) | Pre-release |

This is the direct input to Step 05 (M2-E2), which refines each to Phase-6-executable form.

## §6 — Inter-Brief Conflicts

**None found.** The six briefs are mutually consistent: shared artifacts have single owners (§3), references are bidirectional (§1), and no two briefs specify conflicting behavior for the same mechanism. The only reconciliation item was the P3-Obs-09 citation drift (§1.1), which is a citation error, not a design conflict.

## §7 — Coordination Confidence and Open Questions

- **Confidence:** High. All cross-references verified; cohort reconciled; no conflicts.
- **Open questions:** none blocking. The Observability↔Verification latent evidence-sharing (§2) is a Phase 5 note, not a Phase 3 gap.
- **New observation P3-Obs-13:** the four-spoke flow is described in three places (MC-12 §2.4, MC-07 `verify-a-release.md`, Verification I-4). Coordination resolved it to a single source (MC-12 §2.4), but the toolkit could prompt Step 03 to declare a "single source of truth" for artifacts referenced by 3+ briefs. Route: Phase 3 v1.1.

## Version History

| Version    | Date       | Change                                                                          |
| ---------- | ---------- | ------------------------------------------------------------------------------- |
| v0.1-draft | 2026-07-07 | Initial Coordination Register draft for OP-7                                    |
| v1.0       | 2026-07-07 | OP-7 ratified (no conflicts; P3-Obs-09 reconciled; cohort recorded). Finalized. |
