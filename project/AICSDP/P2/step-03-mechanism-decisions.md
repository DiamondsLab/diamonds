# Mechanism Decisions

# @diamondslab/diamonds — Phase 2 Cycle

**Decision Date:** 2026-05-22
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Step 02 Weights Applied:** Security 1.5× / Maintainability 1.5× / Economics 1.0× / Operations 1.0× / Scoring & Metrics 1.0× / Correctness Verification 1.5×

---

## 1. MC Triage

### 1.1 MCs Requiring Phase 2 Mechanism Decision (8)

| MC    | Brief                                                                         |
| ----- | ----------------------------------------------------------------------------- |
| MC-01 | Zero High/Critical CVEs in runtime deps                                       |
| MC-04 | Strategy extensibility for external multi-party modules                       |
| MC-07 | Core-concept narrative documentation + working example scripts                |
| MC-08 | Documentation site live with markdown-first pipeline                          |
| MC-11 | GitHub Actions CI pipeline                                                    |
| MC-12 | Publish pipeline + provenance                                                 |
| MC-19 | Cleanup: orphan tooling + stale references + unused devDeps + scripts/ retire |
| MC-21 | Private key refactored out of RPCDeploymentStrategy constructor               |

### 1.2 MCs with Single Viable Mechanism (Forward as-is) (14)

| MC    | Brief                                                  | Implicit Mechanism                                                          |
| ----- | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| MC-02 | Fix 2 husky-gate silent-failure bugs                   | Two specific code fixes in `.husky/pre-push`                                |
| MC-03 | Lockfile-refresh cadence                               | Dependabot config + commit-based evidence trail                             |
| MC-05 | OZDefenderDeploymentStrategy retired across all layers | Direct removal cascade                                                      |
| MC-06 | Generated API reference                                | TypeDoc (OSS TypeScript convention)                                         |
| MC-09 | Defender-related docs retired/replaced                 | Direct file deletion + selective rewrite of `monitoring-troubleshooting.md` |
| MC-10 | README updated to productization framing               | Single-document rewrite                                                     |
| MC-13 | CHANGELOG.md exists and maintained                     | Keep-a-Changelog format + manual discipline                                 |
| MC-14 | TypeScript coverage measured + floor enforced          | `nyc` + Istanbul + CI floor check                                           |
| MC-15 | 7 misplaced integration tests resolved                 | Move-or-reconfigure per-test (Phase 5 decision)                             |
| MC-16 | External-libraries functionality validated             | Net-new test file authored                                                  |
| MC-17 | `deployInclude` behavior verified + tested             | Test additions to existing file + doc clarification                         |
| MC-18 | Sustainable release cadence policy                     | Written policy document                                                     |
| MC-20 | Linting decision implemented consistently              | ESLint config alignment + pre-commit enforcement                            |
| MC-22 | Dev-env integration smoke test in Diamonds CI          | Single GitHub Actions workflow invoking dev-env test suite                  |

---

## 2. Mechanism Decisions (Multi-Mechanism MCs)

### MC-01 — Zero High/Critical CVEs in runtime deps

**Chosen Mechanism:** Replace lodash with native JavaScript where straightforward; for lodash imports requiring migration, use `es-toolkit/compat` as drop-in replacement. Bump axios to ^1.15.0 within the same major.

**Principle-weighted Rationale:** Security 1.5× and Maintainability 1.5× both favor Branch B. Security elevates permanent CVE-surface reduction over symptomatic patching — lodash is a recurring contributor to F-30's ~85 OSV advisories across ~28 packages. Maintainability favors `es-toolkit/compat` over native-only because the drop-in compatibility (verified via Context7 query) keeps migration surface near-zero. Economics 1.0× and Operations 1.0× don't elevate the cheaper-short-term patch option.

**Alternatives Considered:**

| Alternative    | Mechanism                                         | Rejected Because                                                                                                                       |
| -------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A              | Patch-bump lodash + axios within current major    | Treats CVE symptom not surface; lodash remains transitive-vulnerability magnet; leaves next-cycle exposure intact                      |
| C              | Hybrid: replace lodash, leave axios on patch-bump | Equivalent to chosen mechanism (axios already at recent major; patch-bump within ^1 is the natural axios path); treated as re-labeling |
| Native-JS-only | Replace every lodash use with vanilla ES2022+     | Higher migration effort; some lodash functions have non-trivial native equivalents; Maintainability 1.5× argues against                |

**Verification Method:** (1) `yarn npm audit` returns zero High/Critical advisories on `dependencies` at publish; (2) OSV scan total drops materially from F-29 baseline (~85 advisories) — target ≥30% reduction tied to lodash transitive surface; (3) Existing test suite passes without modification (drop-in claim verified); (4) Snyk runtime-deps High/Critical count = 0.

**Inter-MC Dependencies:**

- Depends on: None
- Constrains: Enables clean MC-12 publish (vulnerability-clean artifact)

**Source:** Phase 1 F-29 (CVE baseline), F-30 (transitive advisory density) + Step 02 weights + Context7 verification of es-toolkit/compat (2026-05-22)

---

### MC-04 — Strategy extensibility for external multi-party modules

**Chosen Mechanism:** Formal extension contract — TypeScript interface (`IDeploymentStrategy`) with explicit lifecycle methods, plus a contract conformance test suite that external strategy implementations can run against. Document the contract as a versioned interface, with a worked sibling-strategy example (one minimal but functional external strategy) that proves the contract is sufficient.

**Principle-weighted Rationale:** Correctness Verification 1.5× is the dominant weight. The formal interface + contract conformance test is the only candidate providing external implementers a _verifiable_ conformance target. Security 1.5× additionally favors explicit security boundaries between core and extension (interface makes the boundary explicit and testable; an extension can't accidentally bypass deployment-record-writing). Maintainability 1.5× favors the worked sibling example because that example becomes part of the contract's documentation.

**Alternatives Considered:**

| Alternative                                      | Mechanism                                                        | Rejected Because                                                                                                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Documented convention without enforced interface | Markdown docs only                                               | Under Correctness Verification 1.5× this fails — no way to verify an external strategy conforms beyond "did the author read the docs?"                                         |
| Plugin-loader pattern                            | External strategies register via plugin manifest; runtime loader | Over-engineered for actual use case (one known consumer at design time, per NTI-03); Maintainability 1.5× argues against carrying plugin-loader machinery not earning its keep |
| Abstract base class only                         | TypeScript abstract class for extension                          | TypeScript convention favors interfaces over abstract classes; abstract classes couple consumers to base implementation details                                                |

**Verification Method:** (1) Contract conformance test suite runs against reference external strategy implementation — all tests pass; (2) Reference external strategy produces working diamond deployment with auditor-reproducible records (validates contract sufficiency, not just syntactic conformance); (3) TypeScript interface has JSDoc on every method covering security-boundary expectations; (4) Phase 3 produces formal design brief covering specific interface methods and semantics before Phase 5 implements.

**Inter-MC Dependencies:**

- Depends on: MC-05 (clean contract surface — design against post-Defender state)
- Constrains: MC-07 (how-to-write-a-new-strategy doc references contract + worked example); MC-21 (contract reflects post-key-refactor `RPCDeploymentStrategy` interface); NTI-03 (`diamonds-safe`) becomes addressable once contract exists

**Source:** Phase 1 §2.4, MK-04, NTI-03 + Step 02 weights

---

### MC-07 — Core-concept narrative documentation + working example scripts

**Chosen Mechanism:** Layered documentation structure with three persona-targeted layers plus colocated working example scripts.

- **Layer 1 — Quickstart:** single page, single working example, ~5-minute path to first working diamond deployment
- **Layer 2 — Core Concepts:** deep-dive narrative (ERC-2535 mental model, `BaseDeploymentStrategy` lifecycle, `LocalDeploymentStrategy` vs. `RPCDeploymentStrategy`, deployment-record reproducibility, Zod-schema configuration); one document per concept, cross-linked
- **Layer 3 — Reference:** how-to guides (writing a new strategy referencing MC-04, secure key handling referencing MC-21, integrating with diamonds-dev-env, auditor-verification workflow); one document per task
- **Working examples** colocated in `examples/` directory; each example runs as part of MC-22's smoke test suite

**Principle-weighted Rationale:** Maintainability 1.5× and Correctness Verification 1.5× both favor layered structure. Maintainability: persona-targeted layers keep each document scoped and AI-queryable; the MC-08 docs-as-AI-context test succeeds better against structured layers than monolithic narrative. Correctness Verification: concept-then-reference structure separates _what something is_ from _how to use it_, both independently verifiable; conformance tests in examples verify reference docs match real behavior. Security 1.5× satisfied by Layer 3 secure-key-handling doc cross-referencing MC-21.

**Alternatives Considered:**

| Alternative                                  | Mechanism                                       | Rejected Because                                                                                                                                                             |
| -------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single canonical narrative + worked examples | One `GUIDE.md` covering everything sequentially | Fails queryability test under Maintainability 1.5×; single long document is hard to extract specific answers from; collapses to one page wasting MC-08 navigation affordance |
| Tutorial-driven (multiple persona tutorials) | Multiple end-to-end tutorials per persona       | Tutorials drift from reference material faster than reference does (Correctness Verification 1.5×); tutorial-only under-serves auditor persona who needs reference           |
| API reference only (no narrative)            | TypeDoc output is the entire docs               | Already rejected at Phase 1 (F-25/F-40); API reference without narrative strands contributors at `BaseDeploymentStrategy`                                                    |

**Verification Method:** (1) AI proxy-reader test against deployed MC-08 site: 5 Diamonds-usage questions answered from docs alone, ≥80% success rate; (2) Each `examples/` script runs successfully as part of MC-22 smoke test on every PR; (3) Link-checker plugin from MC-08 catches all internal-link breakage; (4) Auditor-persona check: fresh AI session given docs URL produces correct deployment-record verification steps without practitioner intervention.

**Inter-MC Dependencies:**

- Depends on: MC-06 (API reference for Layer 3 links); MC-04 (extension contract for "how to write a strategy" doc); MC-21 (key refactor for secure-key-handling doc); MC-08 (publishing surface with MkDocs conventions)
- Constrains: MC-10 (README links to Layer 1 Quickstart); MC-22 (smoke test scope expands to cover example scripts)

**Source:** Phase 1 F-25, F-40, F-41 + Step 02 weights

**[Forward flag for Step 05]** Three-layer structure is on the heavier side of doc-architecture choices. If Step 05 cost modeling shows the full scope exceeds capacity, partial Layer 3 (most-load-bearing reference docs only) is the staging option.

---

### MC-08 — Documentation site live with markdown-first pipeline

**Chosen Mechanism:** MkDocs with the Material for MkDocs theme, deployed to GitHub Pages via GitHub Actions, with TypeDoc API reference output (from MC-06) integrated as a navigation section.

**Principle-weighted Rationale:** Maintainability 1.5× is the dominant weight. MkDocs + Material is markdown-first (zero MDX/JSX in source), uses mature stable Python tooling, has built-in versioning (`mike`), and has a large enough ecosystem that AI agents and external contributors can both reason about it. Python tooling addition is acceptable because Python is already in the practitioner's environment for Slither. Correctness Verification 1.5× satisfied by built-in search-index validation and link-checker plugins.

**Alternatives Considered:**

| Alternative                       | Mechanism                               | Rejected Because                                                                                                                                             |
| --------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Docusaurus                        | React-based, MDX-supporting             | Heavier toolchain (Node + React); MDX feature gain doesn't justify maintenance surface for narrative+reference docs; brings React-version-update obligations |
| VitePress                         | Vite-based, Vue-first                   | Vue ecosystem not in practitioner's stack; adopting for docs alone adds new toolchain dependency                                                             |
| MDBook                            | Rust-based                              | Excellent tool but Rust toolchain not in stack; gratuitous toolchain expansion                                                                               |
| Hand-rolled static + GitHub Pages | Minimal script renders markdown to HTML | Loses navigation/search/versioning; verification cost outweighs dependency savings under Maintainability 1.5× + Correctness Verification 1.5×                |

**Verification Method:** (1) Docs site deploys via GitHub Actions on every merge to main, renders without errors; (2) Link checker plugin passes — no broken internal/known-stable external links; (3) Search index covers all narrative content + API reference; (4) AI proxy-reader test: fresh AI session given site URL answers 5 questions about Diamonds usage with ≥80% success rate.

**Inter-MC Dependencies:**

- Depends on: MC-06 (TypeDoc output for navigation integration)
- Constrains: MC-07 (content authored in MkDocs markdown conventions from the start); MC-10 (README links to live docs site)

**Source:** Phase 1 Issue #3, MK-04, F-40 + Step 02 weights + Context7 verification of MkDocs Material (2026-05-22)

---

### MC-11 — GitHub Actions CI pipeline with PR + publish gates

**Chosen Mechanism:** Simpler-GitHub-Actions: direct workflow authoring with three workflows — `ci.yml` (PR gates: build, test, lint, security scans), `publish.yml` (release-triggered with `--provenance`), `dev-env-smoke.yml` (MC-22 integration smoke). Workflows in `.github/workflows/` using existing husky-gate command set (no DevContainer dependency at CI runtime).

**Principle-weighted Rationale:** Maintainability 1.5× is the dominant weight. Direct GitHub Actions YAML is the simplest viable mechanism — practitioner reads it without translation layer, AI agents reason about it without DevContainer context, surface bounded by what's in YAML files. The Phase 1 PT-03 tension (unified-DevContainer vs. simpler) decided by weighting: Operations 1.0× doesn't elevate cross-ecosystem reusability; Maintainability 1.5× argues against DevContainer maintenance cost. Security 1.5× favors three-workflow split keeping publish path narrow.

**Alternatives Considered:**

| Alternative                             | Mechanism                                                                                 | Rejected Because                                                                                                                                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unified-DevContainer-as-CI              | Workflows execute in shared DevContainer; reusable workflows orchestrate across ecosystem | Maintainability 1.5× argues against: DevContainer-as-CI attempted ecosystem-wide and abandoned (F-11, F-16); resurrecting adds maintenance surface practitioner has determined isn't sustainable    |
| Reusable workflows without DevContainer | Centralized workflow YAML in shared repo, called via `uses:`                              | Cross-repo coordination overhead for second-order benefit of sharing; practitioner solo; ecosystem coordination cost doesn't earn its keep currently. Revisit if external contributors materialize. |
| Single mega-workflow                    | One `ci.yml` doing everything including publish                                           | Mixing PR-time gates with release-time publish in single workflow conflates triggers; Security 1.5× argues for narrow explicit publish path                                                         |

**Verification Method:** (1) PR workflow blocks merge on failure of build/test/lint/any-security-scan; (2) Publish workflow runs only on release tags; produces npm provenance + release-evidence artifact; (3) Smoke workflow runs on PR; invokes diamonds-dev-env test suite; blocks merge on failure; (4) All three workflows complete in under 5 minutes each (F-35's 21s baseline suggests comfortably achievable); (5) Test PR with deliberately-broken security gate gets blocked, verifying enforcement.

**Inter-MC Dependencies:**

- Depends on: MC-02 (husky bug fixes — don't port broken gates); MC-19 (cleanup orphan `scripts/devops/` so CI authoring doesn't inherit broken inspiration)
- Constrains: MC-12 (publish workflow is part of MC-11's three-workflow set; MC-12 provides provenance/release-evidence specifics); MC-22 (smoke workflow is third in MC-11's set)

**Source:** Phase 1 F-05, F-11, F-16, F-34, F-35, PT-03 + Step 02 weights

---

### MC-12 — Publish pipeline + server-side verification + release-evidence + provenance

**Chosen Mechanism:** npm `--provenance` (mandatory) + signed-release-evidence artifact attached to GitHub release + SBOM generation via `cyclonedx-npm` + commit-pinned dependency lockfile snapshot in release-evidence.

The `publish.yml` workflow (from MC-11) executes: (1) re-run all PR gates fail-closed on regression; (2) generate SBOM via `cyclonedx-npm` → CycloneDX 1.5 format; (3) capture lockfile snapshot (yarn.lock hash + dependency tree); (4) publish to npm with `--provenance` (GitHub OIDC-attested); (5) attach release-evidence artifact to GitHub release (SBOM + lockfile snapshot + scan results + provenance URL); (6) tag release commit with npm version.

**Principle-weighted Rationale:** Security 1.5× and Correctness Verification 1.5× both drive specifics. Security: `--provenance` is npm-native supply-chain improvement closing Branch 1 worst-case (exploitable CVE in published artifact); SBOM + lockfile snapshot extend verifiability to dependency state. Correctness Verification: SBOM is machine-readable answer to "what's in this artifact" — auditor can diff SBOMs between releases. Maintainability 1.5× satisfied by rejecting SLSA Level 2 and Sigstore-additional-signing (both add process surface; provenance + SBOM is lowest-maintenance mechanism delivering value).

**Alternatives Considered:**

| Alternative                               | Mechanism                                            | Rejected Because                                                                                                                                                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm `--provenance` only                   | Minimum-viable; GitHub OIDC provenance, nothing else | Attests _who published_ but not _what was published_ in a way auditors verify independently; under Correctness Verification 1.5× the SBOM + lockfile snapshot make F-41 reproducibility surface as feature                                                      |
| npm provenance + SLSA Level 2             | Same as chosen plus formal SLSA Level 2 attestation  | SLSA Level 2 framework adoption introduces process surface not earning its keep for pre-production library; Security 1.5× argues for substance (which we have) not certification (HC-06 = no external cert required); revisit when external compliance concrete |
| npm provenance + Sigstore signed releases | Plus explicit Sigstore signing beyond npm's built-in | npm `--provenance` already uses Sigstore under hood; double-attestation adds verification complexity for marginal gain; revisit if adopters specifically request                                                                                                |
| Release evidence in repo only (no SBOM)   | GitHub release with build logs + commit pin          | Under Correctness Verification 1.5× SBOM lets auditor diff dependency state at machine resolution; cyclonedx-npm cost is small                                                                                                                                  |

**Verification Method:** (1) Every npm publish produces verifiable provenance (`npm view @diamondslab/diamonds` shows attestation); (2) Every GitHub release has SBOM + lockfile snapshot + scan results attached; (3) Auditor-persona check: fresh AI session given npm URL + GitHub release URL verifies published code matches released source without practitioner support; (4) SBOM valid CycloneDX 1.5 (passes `cyclonedx-cli validate`); (5) Test release with deliberately-broken provenance gets rejected by npm.

**Inter-MC Dependencies:**

- Depends on: MC-11 (provides `publish.yml`); MC-02 (publish workflow re-runs gate suite); MC-01 (CVE remediation before first v2.0 publish — don't attest known-vulnerable artifact)
- Constrains: MC-03 (Dependabot interacts with publish discipline); MC-13 (CHANGELOG in release-evidence)

**Source:** Phase 1 F-10, SR-07, MK-01, F-41 + Step 02 weights

---

### MC-19 — Cleanup: orphan tooling + scripts/ retire + unused devDeps + stale references

**Chosen Mechanism:** Single sweep — one atomic PR retiring the full cleanup scope in one logically-organized commit set, landing on a single feature branch with the v2.0 work.

Sweep removes in one PR: entire `scripts/devops/` directory (gnus-dao orphans per F-02); entire `scripts/` directory (MC-07 replaces with `examples/`); Jest family devDeps; five additional unused deps (`@socketsecurity/cli`, `web3`, `winston`, `abi2oas`, `uint32`, `@types/uint32`); `tslint.json` `.npmignore` reference; `test-mock-verify.js` `.npmignore` reference; `contracts-starter` pinned to commit SHA. PR description documents what was removed with one line per category citing Phase 1 finding ID.

**Principle-weighted Rationale:** Maintainability 1.5× is the dominant weight. Single sweep clears cognitive surface in one bounded review effort — reviewer sees one diff unambiguously "remove all orphan/stale/unused artifacts at once," validates once. Staged sweeps multiply review overhead with no offsetting benefit; solo maintainer + HC-08 binding makes PR-overhead cost real. Correctness Verification 1.5× satisfied by cleanup PR being no-functional-change diff trivially verifiable. Security 1.5× satisfied by removing unused-dependency surface (each retired dep is one fewer transitive CVE source).

**Alternatives Considered:**

| Alternative                              | Mechanism                                                              | Rejected Because                                                                                                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staged sweep (multiple PRs per category) | Separate PRs for scripts/devops, devDeps, .npmignore, version pinning  | Multiplies PR overhead for zero substantive benefit; items are independent of each other; staging matters when items have differing risk profiles, none of these do           |
| Bundled with first capability MC         | Roll cleanup into first Tier 2 MC's PR                                 | Conflates two distinct review concerns; entangles cleanup-revert risk with capability-revert risk; cleanup PR should be independently verifiable as no-functional-change diff |
| Inline as work-flows (no cleanup PR)     | Each subsequent v2.0 PR removes whatever cleanup items happen in scope | Cleanup drifts and never fully completes; `scripts/devops/` belongs to no other MC and would never be retired; Maintainability 1.5× argues against orphan-code-stays-orphan   |

**Verification Method:** (1) Cleanup PR diff is purely deletions/version-pinning/reference updates — no behavior changes (verified by review); (2) Full test suite passes (70/70 + 7 misplaced-pending unchanged from F-17 baseline); (3) Build cycle timing matches or improves F-35 baseline (~21s); (4) `yarn npm audit` runs cleanly on cleanup branch, no net-new advisories; (5) Post-cleanup `package.json` has no devDep listed that isn't actually used (verified by grep).

**Inter-MC Dependencies:**

- Depends on: MC-02 (gates must work or CI pass means less than it should); MC-04 (at least sketched — verify contract design doesn't need any cleanup-targeted artifacts preserved)
- Constrains: MC-11 (CI authored after cleanup so workflows don't inherit broken inspiration); MC-07 (populates new `examples/` directory); MC-22 (smoke verification logic authored against post-cleanup state)

**Source:** Phase 1 F-02, F-04, F-07, F-20, F-22, F-23 + Step 05 catalog scope expansions + Step 02 weights

---

## 3. Inter-MC Dependency Graph

### 3.1 Dependency Table (Consolidated)

| MC    | Depends On                 | Constrains                                                                            |
| ----- | -------------------------- | ------------------------------------------------------------------------------------- |
| MC-01 | —                          | Enables clean MC-12 publish                                                           |
| MC-02 | —                          | MC-11, MC-19, MC-12                                                                   |
| MC-03 | MC-11                      | MC-12                                                                                 |
| MC-04 | MC-05                      | MC-07, MC-21                                                                          |
| MC-05 | —                          | Enables MC-04 clean surface; coordinate landing with MC-21                            |
| MC-06 | —                          | MC-07 Layer 3, MC-08                                                                  |
| MC-07 | MC-04, MC-06, MC-08, MC-21 | MC-10, MC-22                                                                          |
| MC-08 | MC-06                      | MC-07, MC-10                                                                          |
| MC-09 | MC-05                      | —                                                                                     |
| MC-10 | MC-07, MC-08, MC-21        | Publish-time content                                                                  |
| MC-11 | MC-02, MC-19               | MC-12, MC-22                                                                          |
| MC-12 | MC-02, MC-01, MC-11        | MC-03, MC-13                                                                          |
| MC-13 | —                          | Lands alongside first breaking change                                                 |
| MC-14 | —                          | MC-11; ideally before MC-15                                                           |
| MC-15 | —                          | MC-22                                                                                 |
| MC-16 | —                          | —                                                                                     |
| MC-17 | —                          | —                                                                                     |
| MC-18 | MC-13                      | —                                                                                     |
| MC-19 | MC-02, MC-04 (sketched)    | MC-11, MC-07, MC-22                                                                   |
| MC-20 | —                          | MC-11                                                                                 |
| MC-21 | —                          | Coordinate with MC-05 as breaking-change block; constrains MC-07, MC-10, MC-13, MC-22 |
| MC-22 | MC-04, MC-05, MC-21        | MC-11                                                                                 |

### 3.2 Three Structural Patterns

**Pattern 1 — Foundation Block (no inter-dependencies; unblock subsequent work):** MC-02, MC-19 (depends on sketched MC-04), MC-01, MC-13 (CHANGELOG mechanism), MC-15, MC-16, MC-17, MC-20

**Pattern 2 — Coordinated Breaking-Change Block (must land together):** MC-04 + MC-05 + MC-21 + MC-22 + MC-13 (capturing breaking changes). Step 04 sequencing treats as single coordinated landing.

**Pattern 3 — Documentation Block (depends on breaking-change block completing):** MC-06 → MC-08 → MC-07 → MC-10. MC-09 within this block (depends on MC-05). MC-13 maintained through this block.

**Cross-cutting enabler — CI as service:** MC-11 (depends on MC-02 + MC-19; constrains MC-12, MC-22; lands between Foundation and Coordinated Breaking-Change blocks). MC-12, MC-14, MC-20, MC-03 land with or after MC-11.

### 3.3 Cycle Check

DAG verified — no cycles. One tight ordering noted: MC-05 retire → MC-04 contract design against post-Defender + post-MC-21 state → MC-21 lands in same coordinated block alongside MC-04 contract test suite. Step 04 should ensure MC-04 isn't scoped before MC-21's interface is firm.

---

## 4. Comprehensiveness Check Result

**Q-Compr-1 — Any MC mechanism to revisit?** Practitioner confirmed: no MC needs revisiting. Choices cohere; Coordinated Breaking-Change block internally consistent; Documentation Block depends correctly on breaking-change outcomes; MC-19 single-sweep consistent with Maintainability 1.5× theme across MC-01, MC-08, MC-11.

One item flagged forward for Step 05 attention (not a revision):

- **MC-07 three-layer scope** is heavier side of doc-architecture choices. If Step 05 cost modeling shows full scope exceeds capacity, partial Layer 3 is staging option.

**Q-Compr-2 — Any inter-MC dependency missed?** Practitioner confirmed: no known missed dependencies.

One sequencing note flagged forward for Step 04 attention (not a dependency):

- **MC-14 (TS coverage) ↔ MC-15 (misplaced tests):** Coverage tooling adoption is easier _before_ test reorganization, because pre-reorganization baseline is meaningful. MC-14 before MC-15 in Step 04 sequencing.

---

## 5. Forward Implications

### 5.1 For Step 04 (Sequencing)

**Three structural patterns name themselves:**

- Tier 1 (Foundation) candidates: MC-02 (must be first), MC-19, MC-01, MC-13, MC-15, MC-16, MC-17, MC-20, MC-18
- Tier 2 (Capability — Coordinated Breaking-Change Block): MC-04 + MC-05 + MC-21 + MC-22 + MC-13 maintenance + MC-09 + MC-14
- Tier 3 (Productization): MC-06 → MC-08 → MC-07 → MC-10 → MC-12 → MC-03

**Sequencing rules surfaced by Step 03:**

- MC-02 before MC-11 (don't port broken gates)
- MC-04 before MC-05 (don't retire Defender until extension contract proven sufficient) — wait, **MC-04 depends on MC-05** for clean surface. The correct rule: MC-05 first to clear surface, then MC-04 design, but they land in the same coordinated block.
- MC-22 before/with breaking-change work (MC-05, MC-21) — smoke test catches cross-repo breakage at PR time
- MC-06 before MC-07 (API reference anchors narrative links)
- MC-07 before MC-10 (README references final narrative content)
- MC-13 landed alongside first breaking change (typically MC-21 or MC-05)
- MC-14 before MC-15 (coverage baseline before test reorganization)

**Tier-3 critical-path observation:** MC-06 → MC-08 → MC-07 → MC-10 is a linear chain. Tier 3 cannot be parallelized across most of its scope, which has implications for Step 04 minimum-viable-completion floor analysis.

### 5.2 For Step 05 (Cost Modeling)

**Mechanism-cost implications:**

- **MC-01 (Branch B replace)** is cheaper than Branch A in long-term maintenance but slightly more expensive in initial migration. AI-acceleration multiplier "mechanical cleanup" 10× applies.
- **MC-04 (formal contract with conformance test + worked example)** is substantially more expensive than documented-convention alternative. "Novel design" multiplier 3× applies — this is the lowest-acceleration category in the cost model.
- **MC-07 (three-layer structure)** is heavier than single-narrative alternative. Doc-authorship multiplier 8× applies. **Flag: most likely scope-vs-capacity collision point.**
- **MC-08 (MkDocs)** has low initial setup; ongoing maintenance is low. Config-edit multiplier 5× applies.
- **MC-11 (simpler-GitHub-Actions)** is cheaper than unified-DevContainer; ongoing maintenance is low. Config-edit multiplier 5× applies.
- **MC-12 (provenance + SBOM)** marginal cost is one workflow step for SBOM. Config-edit multiplier 5× applies.
- **MC-19 (single sweep)** is cheapest cleanup option. Mechanical cleanup multiplier 10× applies.
- **MC-21 (clean break)** is cheaper than shim window because zero external adopters. Novel design multiplier 3× applies for the Signer-injection design; mechanical cleanup 10× for the constructor change itself.

### 5.3 For Phase 3 (Design Briefs Required)

**MCs requiring Phase 3 design briefs** (formal design before Phase 5 implementation):

- **MC-04 extension contract** — interface methods, security-boundary semantics, conformance-test scope
- **MC-21 Signer-injection refactor** — Signer source examples (KMS, hardware wallet), migration path docs, internal-architecture implications
- **MC-07 docs information architecture** — Layer 3 reference doc scope finalization, cross-link structure
- **MC-12 release-evidence schema** — SBOM contents, lockfile-snapshot format, evidence-bundle archive layout

### 5.4 For Phase 6 (Verification Methods Named)

Each Multi-Mechanism MC's verification method (Section 2) is the seed for Phase 6's principle-weighted scorecard checks. Single-Mechanism MCs need verification methods drafted during Step 06 synthesis.

---

## 6. Sources & Evidence Register

- **Phase 1 Input Validation artifact (Step 01)** — for MC scope and Phase 1 finding references
- **Phase 1 Current-State Information Report (Steps 01-06)** — for findings F-01..F-42, MC register, constraint envelope
- **Principle Weighting artifact (Step 02)** — for weights applied in mechanism rationale; high-sensitivity decisions identified
- **Context7 library lookups (2026-05-22)** — verification of es-toolkit/compat (MC-01) and MkDocs Material (MC-08)
- **GitHub MCP** — confirmed open-issue context for issue-driven MCs
- **Practitioner confirmations 2026-05-22** — final authority on triage (Q-Triage-1/2), all 8 mechanism decisions, Phase C dependency graph, Phase D comprehensiveness check
