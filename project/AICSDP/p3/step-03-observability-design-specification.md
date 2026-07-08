# Step 03 Design Specification — Observability Touchpoints

> **Artifact type:** Observability (sub-template E) · **Subject:** `@diamondslab/diamonds` v2.0
> **Status:** ✅ **FINALIZED v1.0 — OP-5 ratified (question-by-question, Owner 2026-07-07)** · **Date:** 2026-07-07
> **Central discipline:** **Operations stays 1.0×** — this is a baseline design a future-cycle Phase 2 can elevate cleanly. No silent elevation.
> **Inputs:** Plan §10.1 (intent), §10.3 (watch-triggers); MC-04 (15 lifecycle methods + `LoggingDeploymentStrategy`); MC-21 (Signer points); M0-E2 crossover note (real `release.yml`); MC-12 (publish flow); toolkit sub-template E.
> **Owner decisions:** vehicle = structured logging via `LoggingDeploymentStrategy`; depth = all 15 boundaries low-cardinality + outcome counters; alerting = define severities, defer infra.

---

## §1 — Brief Intake Confirmation

Observability supplementary brief (Plan §10.1): give the v2.0 chosen mechanisms observability hooks that a future-cycle Operations elevation can build on — **without** elevating Operations now (it stays 1.0×). First-design brief: no Plan design-question enumeration; questions discovered in-interview and ratified (OP-5). The design deliberately **reuses MC-04's `LoggingDeploymentStrategy`** as the observability vehicle rather than standing up new infrastructure — the cleanest baseline.

## §2 — Design Specification

### E.1 — Touchpoint Inventory

Vehicle: **structured logging** emitted by `LoggingDeploymentStrategy` (MC-04 §2.5), which already logs entry/exit/throw for the 15 lifecycle methods + state transitions + tx hashes. Observability _reuses_ those emission points and adds a thin set of **outcome counters**. All low-cardinality (aggregatable).

| Touchpoint                            | Mechanism location                                                          | Mode                             | Cardinality             |
| ------------------------------------- | --------------------------------------------------------------------------- | -------------------------------- | ----------------------- |
| `lifecycle.method.{enter,exit,throw}` | Each of MC-04's 15 lifecycle methods (5 phases × pre/main/post)             | Structured log                   | Low (method-name label) |
| `state.transition`                    | Each `diamond.updateDeployedDiamondData(...)` + registry Add/Replace/Remove | Structured log                   | Low                     |
| `onchain.tx`                          | Each `deploy()` / `diamondCut()` / callback tx                              | Structured log (tx hash field)   | Low                     |
| `signer.resolved`                     | MC-21 refactored constructor — `signer.provider` resolution point           | Structured log (no key material) | Low                     |
| `deploy.outcome`                      | `deploy()` completion                                                       | Counter (success/fail)           | Low                     |
| `cut.outcome`                         | `diamondCut()` completion                                                   | Counter (success/fail)           | Low                     |
| `callback.outcome`                    | post-deployment callback completion                                         | Counter (success/fail)           | Low                     |
| `ci.gate`                             | MC-11 `ci.yml` / MC-22 `dev-env-smoke.yml` job result                       | Event (CI-native)                | Low                     |
| `publish.provenance`                  | MC-11 `release.yml` `npm publish --provenance` result                       | Event (CI-native)                | Low                     |

### E.2 — What Gets Observed

| Touchpoint                       | Information                                               | Operational question it answers                        | Sample rate            |
| -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------ | ---------------------- |
| `lifecycle.method.*`             | method name, phase, duration, error (if throw)            | Where in a deployment did time go / did it fail?       | Always-on              |
| `state.transition`               | facet, selector count, Add/Replace/Remove                 | What did this deployment change?                       | Always-on              |
| `onchain.tx`                     | tx hash, gas used                                         | Is the on-chain effect auditable?                      | Always-on              |
| `signer.resolved`                | signer address, provider network (**never key material**) | Which signer/network did this run use?                 | Always-on              |
| `*.outcome` counters             | success/fail count by operation                           | What's the deploy/cut/callback failure rate over time? | Always-on (aggregated) |
| `ci.gate` / `publish.provenance` | job result, commit                                        | Did the gate pass / did provenance generate?           | Per-run                |

### E.3 — Alerting Thresholds

**Baseline posture (OP-5):** define **severities** and the _conditions that would warrant an alert_, but **defer alerting/paging infrastructure** to the consuming application and a future-cycle Operations elevation. This is the deliberate 1.0× boundary — the design names the alert surface without building it.

| Condition                               | Severity (defined, not wired) | Note                                           |
| --------------------------------------- | ----------------------------- | ---------------------------------------------- |
| `deploy.outcome` / `cut.outcome` = fail | critical                      | Consumer wires paging; library logs at `error` |
| `callback.outcome` = fail               | warning                       | Partial-deploy risk (MC-04 edge case)          |
| `publish.provenance` = fail             | critical (CI-native)          | Blocks release; already fails the CI job       |
| `ci.gate` (smoke) = fail                | critical (CI-native)          | MC-22 blocks merge                             |

_No suppression/rate-limiting designed this cycle — deferred with the alerting infra (would be Operations-elevation work)._

### E.4 — Dashboard Sketches (guidance for Phase 4; not built here)

- **Deployment History** — panels: deploys over time (by network), success/fail rate, mean lifecycle duration; filters: network, diamond, time. _Fed by `_.outcome`counters +`lifecycle.method._`._
- **Release Evidence** — panels: last publish provenance status, commit-identity match, SBOM presence; filters: version. _Fed by `publish.provenance` + MC-12 bundle._ (Marked future/baseline.)

### E.5 — Phase 7 Watch-Trigger Integration (Plan §10.3)

Honest mapping — the observability touchpoints support the **operational** watch-triggers; several §10.3 triggers are **process/methodology** triggers with no code touchpoint (surfaced as an observation).

| Watch-Trigger (§10.3)                        | Supporting touchpoint                                          | Supported?         |
| -------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| First hotfix event → MTTR                    | `deploy.outcome` / `cut.outcome` + `lifecycle.method.*` timing | ✅ code-observable |
| First external adopter ramp-up (clone→green) | (none — process/Phase-6 proxy measurement)                     | ⚠️ process trigger |
| External-contributor doc adequacy            | (none — MC-07 proxy-reader test)                               | ⚠️ process trigger |
| Feature-branch staleness >30 days            | (none — repo/PR metadata, not runtime)                         | ⚠️ process trigger |
| Operations elevation deferred                | this brief _is_ the baseline the trigger elevates              | ✅ by design       |
| AI-multiplier calibration                    | (none — Phase 7 ops-tracking of dev-hours)                     | ⚠️ process trigger |

### E.6 — Rejected Observability Approaches

| Alternative                               | Why rejected                                                                                                |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Metrics-first (Prometheus-style sink)** | Requires a metrics runtime the library lacks; pushes toward Operations elevation (deferred to future cycle) |
| **Distributed traces/spans**              | Overkill for a deployment library at baseline; heavy to build and consume                                   |
| **Full high-cardinality per-call labels** | Storage-costly, beyond baseline; low-cardinality aggregation suffices                                       |
| **Specify + wire alert thresholds now**   | Would silently elevate Operations to 1.5× — must route via Phase 2 amendment, not a brief                   |
| **New bespoke observability module**      | `LoggingDeploymentStrategy` already exists (MC-04); reuse beats rebuild                                     |

## §3 — Phase 5 Estimate Refinement

Minimal — the vehicle (`LoggingDeploymentStrategy`) is already estimated under MC-04; this brief adds only the thin outcome-counter layer + severity documentation. No material refinement; baseline holds.

## §4 — Rejected Alternatives at Specification Level

See E.6.

## §5 — Per-Artifact Principle Scorecard Contribution

| Principle                | Wt       |                       Verdict | Rationale                                                                                                               |
| ------------------------ | -------- | ----------------------------: | ----------------------------------------------------------------------------------------------------------------------- |
| Security                 | 1.5×     |                          PASS | `signer.resolved` logs address/network only, **never key material** (consistent with MC-04 no-redaction-but-no-secrets) |
| Maintainability          | 1.5×     |                          PASS | Reuses `LoggingDeploymentStrategy`; no new module to maintain                                                           |
| Economics                | 1.0×     |                          PASS | Low-cardinality; no metrics infra cost; counter layer is cheap                                                          |
| **Operations**           | **1.0×** | **PASS (baseline preserved)** | Touchpoints + severities designed; **alerting infra explicitly deferred** — no silent elevation                         |
| Scoring & Metrics        | 1.0×     |                          PASS | `*.outcome` counters give measurable deploy/cut/callback rates                                                          |
| Correctness Verification | 1.5×     |                          PASS | `onchain.tx` + `state.transition` logs give an auditable deployment trail                                               |

**6 PASS.** Operations integrity confirmed at 1.0× (no elevation).

## §6 — Phase 2 Invalidation Check

**No.** Baseline observability over deferred v2.0 mechanisms; nothing in shipped 1.5.0 invalidates it. Consistent with M0 no-amendment.

## §7 — Phase 5 Implementability Check

Implementable: the log points exist in `LoggingDeploymentStrategy`; the counter layer is a thin wrapper; severities are documentation. No blocking gaps.

## §8 — Forward Handoff Notes

- **Future-cycle Phase 2:** this baseline is the clean elevation surface — a re-weighting to Operations 1.5× would wire alerting (E.3), suppression, dashboards (E.4), and possibly a metrics sink.
- **Step 04:** the `LoggingDeploymentStrategy` reuse is a shared dependency with MC-04 — coordinate.
- **Phase 4:** E.4 dashboard sketches are the input to architecture.

## §9 — Cross-Brief References

- **MC-04** — `LoggingDeploymentStrategy` is the observability vehicle; the 15 lifecycle methods are the touchpoint inventory.
- **MC-21** — refactored Signer resolution is the `signer.resolved` touchpoint (address/network only).
- **MC-11 (shipped `release.yml`) / MC-22** — CI + publish-provenance events (`ci.gate`, `publish.provenance`), grounded on the real workflow (M0-E2).
- **MC-12** — publish flow feeds the Release-Evidence dashboard sketch.

## §10 — Confidence and Code-Access Notes

Lifecycle methods + `LoggingDeploymentStrategy` grounded on MC-04 Session 1 brief `[CONFIRM]`; real `release.yml` grounded via M0-E2 `[CONFIRM]`; watch-triggers from Plan §10.3 `[CONFIRM]`. Touchpoint set is a ratified design `[CONFIRM via OP-5]`.

**New observation — P3-Obs-12:** several Plan §10.3 watch-triggers are process/methodology triggers with no runtime code touchpoint; the Observability sub-template E.5 assumes touchpoint-backable triggers. E.5 handled it by marking process triggers explicitly, but the toolkit could distinguish "code-observable" vs "process" watch-triggers. Route: Phase 3 v1.1.

## Version History

| Version | Date       | Change                                                                                                                                                  |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-07-07 | Initial authoring; OP-5 ratified (structured-logging vehicle; all-15 low-cardinality + counters; alerting deferred). 6 PASS, Operations 1.0× preserved. |
