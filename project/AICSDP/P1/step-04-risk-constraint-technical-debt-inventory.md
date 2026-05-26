# Risk, Constraint & Technical Debt Inventory

## `@diamondslab/diamonds` v1.3.2 → v2.0 Improvement Cycle

**Artifact:** Step 04 output — Phase 1 (Existing Projects)
**Assessment date:** 2026-04-20
**Subject repository:** `diamondslab/diamonds` (standalone scope)
**Practitioner:** solo maintainer
**AI analyst:** Claude Opus 4.7
**Prior artifacts consumed:** Discovery Specification; Step 01 Technology & Architecture; Step 02 Operational Baseline; Step 03 Requirements & Improvement Objective

> This artifact organizes the improvement-cycle risks, constraints,
> and debts into five categorized registers. It consumes Step 03's
> Must-Change register as an input (because every MC implies an
> underlying debt or risk) and re-frames findings from Steps 01-02
> through the risk/debt lens. A consolidated Priority Register at
> the end integrates all five for Phase 2 consumption.

---

## Section 1: Executive Summary

Five registers inventory the improvement-cycle landscape: **Compliance
(Standards Conformance)**, **Security Risks**, **Hard Constraints**,
**Project / Operational Risks**, and **Technical Debt**.

The registers share a common geometry: **small, cheap fixes cluster
at the top of the priority list; they unblock the harder work
below**. Specifically, the two gate-suppression bugs (F-13, F-14)
carry the highest interest-rate and lowest principal in the entire
inventory — two small edits to `.husky/pre-push` would have prevented
Security Risk SR-01 from accumulating during the 4-month dormancy.
Phase 2 sequencing should treat the foundation cluster as the first
block of work.

**Three new Must-Changes emerged during Step 04**, surfaced by
practitioner responses to risk-register questions:

- **MC-21** — Private key handling refactored out of
  `RPCDeploymentStrategy` constructor (from SR-03 disposition)
- **MC-22** — Dev-env integration smoke test runs in Diamonds CI
  (from PR-06 disposition)
- **MC-12 amended** to include npm `--provenance` attestation
  (from SR-07 disposition)

**Two new Nice-to-Improves** were surfaced for deferred security
architecture work:

- **NTI-08** — Hardhat 3 upgrade with integrated key store
  (practitioner-flagged priority for next cycle)
- **NTI-09** — Complete HashiCorp Vault persistent key store in
  DevContainer (preserve existing branch work)

**The principal tension of the inventory** is not between
categories — it's between _accumulating and resolving_. During
dormancy, debt compounds silently. Tier 1 of the Priority Register
is engineered to establish the safety net (fixed gates + CI) that
lets future dormancy windows be defensible rather than damaging.

**Worst-case scenario** (Section 10) is an articulated nightmare
in which the pre-cycle dormancy continues, a new CVE lands that is
exploitable through Diamonds' actual code paths, and the gap between
what Diamonds claims and what Diamonds can prove becomes large
enough that two personas (Solidity developer, auditor) silently
move away. Tier 1 prevents the acute harm; Tier 2-3 prevents the
chronic harm.

---

## Section 2: Register 1 — Compliance / Standards Conformance

Framing per practitioner decision: for Diamonds (no regulatory
compliance per Specify H-06), "compliance" means **standards
conformance** — what Diamonds claims to implement + what the code
actually enforces + any divergence between claimed and enforced.

### CC-01 — ERC-2535 Diamond Proxy Standard conformance

| Attribute      | Value                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claimed state  | Diamonds markets ERC-2535 implementation (package.json keywords, Diamond class, core project identity). MK-08 locks conformance as non-negotiable.                                  |
| Enforced state | DiamondCutFacet + DiamondLoupeFacet required as core facets; function selector registry tracks EIP-2535 selector structure; test suite covers facet-lifecycle operations            |
| Divergence     | No known divergence. "Believed-correct" — has not been independently audited.                                                                                                       |
| Severity       | **Medium** — watch item; "believed-correct without external audit" is the auditor-persona weak spot                                                                                 |
| Principles     | Correctness Verification, Security                                                                                                                                                  |
| Source         | MK-08, F-41                                                                                                                                                                         |
| Disposition    | **Watch item.** Not a current-cycle debt to resolve. Revisit after any external audit or when a conformance test suite (e.g., OpenZeppelin ERC-2535 conformance) becomes available. |

### CC-02 — Hardhat plugin integration conventions (peer)

| Attribute      | Value                                                                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claimed state  | `@diamondslab/hardhat-diamonds` integrates via `extendConfig` / `extendEnvironment` / task registration; Diamonds core exports consumed surfaces                                                          |
| Enforced state | Interface surface at Step 01 (F-42 `./core` subpath; `Diamond`, `DiamondDeployer`, strategies, `FileDeploymentRepository`); plugin tests verify integration                                               |
| Divergence     | Integration contract exists but is not _documented_ from Diamonds' side. The plugin knows what it needs; Diamonds does not formally declare what it exports for plugin consumption. Latent coupling risk. |
| Severity       | Low-Medium — current state works; future maintenance cost if contract drifts silently                                                                                                                     |
| Principles     | Maintainability, Correctness Verification                                                                                                                                                                 |
| Source         | Step 01 §6, MK-04                                                                                                                                                                                         |
| Disposition    | **Folds into MC-07** (narrative docs must include plugin-integration contract documentation)                                                                                                              |

### CC-03 — npm package publication hygiene

| Attribute      | Value                                                                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claimed state  | Valid npm package at v1.3.2; `main`, `types`, `module`, `exports`, `files`, `bin` fields populated                                                                                                                    |
| Enforced state | Package publishes; consumers can install and import                                                                                                                                                                   |
| Divergence     | No `engines` field (Node floor undocumented — F-03, IC-02); `.npmignore` has stale `test-mock-verify.js` reference (F-07); `.yarn` and `dist` inclusion were mistakenly committed (fixed via closed Issues #6 and #7) |
| Severity       | Low individually, **Medium aggregate** — aggregate signals hygiene drift affecting adopter trust                                                                                                                      |
| Principles     | Maintainability, Operations                                                                                                                                                                                           |
| Source         | F-03, F-07, Issues #6 and #7 (closed)                                                                                                                                                                                 |
| Disposition    | **Resolved in MC-19** (cleanup pass) and MC-03 (lockfile hygiene informs engines-field decision)                                                                                                                      |

### CC-04 — TypeScript declaration correctness

| Attribute      | Value                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claimed state  | Published `dist/*.d.ts` provides types for consumers                                                                                                  |
| Enforced state | `tsc --declaration true` generates them; no known consumer type-errors                                                                                |
| Divergence     | `SupportedProvider = JsonRpcProvider \| any` — permissive `any` to work around monorepo version-alignment; acknowledged technical debt, not incorrect |
| Severity       | Low — works; cosmetic refinement only                                                                                                                 |
| Principles     | Maintainability                                                                                                                                       |
| Source         | NTI-04, Issue #8                                                                                                                                      |
| Disposition    | **Deferred per NTI-04** — re-evaluate when monorepo alignment addressed or consumer reports type-safety issue                                         |

### Summary

Compliance register is **light by design** — Diamonds has no
regulatory compliance burden. The standards-conformance framing
produces 4 items, of which 2 resolve inside existing MCs (CC-02,
CC-03), 1 is a watch item (CC-01), and 1 is a documented NTI
(CC-04). **No net-new work emerges from this register beyond what
was already captured in Step 03.**

---

## Section 3: Register 2 — Security Risks

Seven risk entries, ranging from Critical (SR-01) to Low-Medium
(SR-07). Each entry identifies the threat, attack surface,
severity, principle impact, source finding, and current disposition.

### SR-01 — CRITICAL: Runtime dependency CVEs in published artifact

| Attribute      | Value                                                                                                                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Threat         | Published `@diamondslab/diamonds@1.3.2` ships with 7 High/Critical + 4 Moderate CVE advisories via axios (1.12.2) and lodash (4.17.21) including one Critical (axios Confused Deputy). Every consumer installing the package inherits these. |
| Attack surface | Depends on which axios/lodash code paths Diamonds exercises. Not all CVEs are necessarily exploitable through Diamonds' concrete usage, but exploitability cannot be excluded.                                                               |
| Severity       | **Critical** for published-library security posture                                                                                                                                                                                          |
| Principles     | Security (primary), Operations, Correctness Verification                                                                                                                                                                                     |
| Source         | F-29 (revised), Step 02 §4.2                                                                                                                                                                                                                 |
| Disposition    | **MC-01, MC-02, MC-03** address directly. Fastest-to-close risk in the register — semver-minor bumps.                                                                                                                                        |

### SR-02 — Supply chain: transitive vulnerability density

| Attribute      | Value                                                                                                                                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Threat         | ~85 OSV advisories across ~28 transitive packages. Most unfixable unilaterally (yarn 4 internals, Hardhat tooling, ethers v5 legacy). Clusters: handlebars (8, peak CVSS 9.8), tar (7), fast-xml-parser (6), minimatch (multiple versions, 12 total). |
| Attack surface | Largely devDependency-space — not shipped to consumers. Becomes visible in CI (MC-11) as chronic noise.                                                                                                                                               |
| Severity       | **Medium — chronic, not acute**                                                                                                                                                                                                                       |
| Principles     | Security, Maintainability                                                                                                                                                                                                                             |
| Source         | F-30, F-32, Step 02 §4.5                                                                                                                                                                                                                              |
| Disposition    | **Phase 2 triage policy.** MC-03 (lockfile refresh cadence) + MC-18 (sustainable cadence) create the discipline; Phase 2 defines the threshold for unilateral action vs. accepting upstream cadence.                                                  |

### SR-03 — Private key handling in `RPCDeploymentStrategy`

| Attribute      | Value                                                                                                                                                                                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Threat         | `RPCDeploymentStrategy` currently accepts a private key as constructor parameter and holds it as instance state. Consumers place production private keys in `.env` files; `git-secrets` pre-push hook is the defense against accidental commit. The pattern broadens the leak surface — every object holding the strategy instance holds a reference to the key. |
| Attack surface | Consumer-side risk with Diamonds-doc amplification (docs instruct `.env` usage)                                                                                                                                                                                                                                                                                  |
| Severity       | **Medium-High as auditor-visible concern.** Likely audit finding (Medium severity) for a deployment library, flagged but usually not blocking.                                                                                                                                                                                                                   |
| Principles     | Security (primary), Correctness Verification                                                                                                                                                                                                                                                                                                                     |
| Source         | Step 01 RPC deployment code review; practitioner Q-Final-1                                                                                                                                                                                                                                                                                                       |
| Disposition    | **Addressed by NEW MC-21** (below) — private key removed from constructor, caller-provided per-deployment. Plus MC-07 narrative-docs section on secure key handling. Long-term options (Hardhat 3 key store, HashiCorp Vault) deferred to NTI-08 and NTI-09.                                                                                                     |

### SR-04 — Husky-gate silent failures produce false security confidence

| Attribute   | Value                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Threat      | `yarn osv:scan` output suppression (F-14) and `yarn snyk:test` unauthenticated silent-skip (F-13) produce false-green signals. Over the 4-month dormancy, SR-01 accumulated entirely unseen. |
| Severity    | **High** — active mechanism by which SR-01 reached Critical state undetected                                                                                                                 |
| Principles  | Security, Correctness Verification                                                                                                                                                           |
| Source      | F-13, F-14, Step 02 §4.4                                                                                                                                                                     |
| Disposition | **MC-02** — direct, fast fix (remove `\|\| echo "..."` fallbacks, handle unauthenticated state explicitly)                                                                                   |

### SR-05 — Local-only gating single-point-of-enforcement

| Attribute   | Value                                                                                                                                                                             |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Threat      | All pre-push gates run only on maintainer's machine. Maintainer working outside DevContainer, using `git commit --no-verify`, or drifted local environment silently loses gating. |
| Severity    | **Medium** — practitioner discipline + DevContainer mitigate for maintainer; posture concern for professional-grade positioning regardless                                        |
| Principles  | Security, Correctness Verification, Operations                                                                                                                                    |
| Source      | F-09, Step 01 §8.4                                                                                                                                                                |
| Disposition | **MC-11 + MC-12** directly address. MK-09 corollary ensures CI gates are _superset_ of husky gates.                                                                               |

### SR-06 — No CHANGELOG means security-upgrade communication absent

| Attribute   | Value                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Threat      | When MC-01 fixes land, consumers have no channel through which to learn or verify. Communication-layer cousin of technical security risk. |
| Severity    | Low-Medium — adopter trust + upgrade decision impact, not exploit vector                                                                  |
| Principles  | Security (communication), Maintainability                                                                                                 |
| Source      | F-28                                                                                                                                      |
| Disposition | **MC-13 + MC-12** — CHANGELOG + release-evidence artifact                                                                                 |

### SR-07 — Published package lacks cryptographic signing / provenance

| Attribute   | Value                                                                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Threat      | No npm provenance attestation; no signed git tags confirmed for releases. Supply-chain attacker compromising npm credentials could publish malicious version indistinguishable from legitimate.                                                                                                              |
| Severity    | Low-Medium. Not Diamonds-specific — shared by most OSS npm packages. Elevated when targeting professional-grade adopters (SOC 2 supply-chain-review teams look for provenance).                                                                                                                              |
| Principles  | Security, Correctness Verification                                                                                                                                                                                                                                                                           |
| Source      | Step 02 §2.3, practitioner Q-Final-2                                                                                                                                                                                                                                                                         |
| Disposition | **MC-12 AMENDED** — publish pipeline now includes `npm --provenance` attestation, producing cryptographic link from tarball to source commit via GitHub Actions OIDC. Note: `--provenance` **requires** CI-driven publishing (cannot be produced manually), partially constraining MC-12's mechanism choice. |

---

## Section 4: Register 3 — Hard Constraints

Immutable boundaries on the improvement cycle. Carries forward from
Specify with one measurement refinement from Step 02.

| ID    | Constraint                                                          | Source     | Status                                              |
| ----- | ------------------------------------------------------------------- | ---------- | --------------------------------------------------- |
| HC-01 | Solo maintainer (team size = 1)                                     | Specify Q5 | Immutable                                           |
| HC-02 | Open-ended timeline                                                 | Specify Q5 | Immutable (MC-18 operationalizes)                   |
| HC-03 | Zero budget (OSS-only tooling)                                      | Specify Q5 | Immutable (MK-07 = must-keep)                       |
| HC-04 | No commercial-tier services                                         | Specify Q5 | Immutable (HC-03 corollary)                         |
| HC-05 | v2.0 breaking changes acceptable per-item justified                 | Specify Q5 | Enabling constraint                                 |
| HC-06 | No external certification required                                  | Specify Q5 | Immutable                                           |
| HC-07 | No production change-window constraints                             | Specify Q5 | Immutable                                           |
| HC-08 | Ecosystem maintainer-time <5 hr/week; Diamonds-specific is minority | F-38       | Measured expression of HC-01; MK-06 operationalizes |

Hard constraints are not actionable — they bound what Phase 2 can
propose. Any Phase 2 plan violating HC-08 fails silently (just
doesn't get done); any violating HC-03 fails explicitly (paid
service is disqualifying).

---

## Section 5: Register 4 — Project / Operational Risks

Risks specific to **the improvement cycle's execution** — threats to
the cycle itself, not to the library's users.

### PR-01 — PT-01 governance: professionalization vs. sustainability

| Attribute     | Value                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Nature        | Central cycle tension. Every Phase 2 decision passes two filters — professionalization + sustainability.          |
| Manifestation | A plan raising the professionalization bar but exceeding HC-08 time budget fails silently.                        |
| Severity      | **High for cycle-as-a-whole; Medium per single MC**                                                               |
| Mitigation    | MK-06 is the hard filter. Phase 2 must reject proposals violating HC-08 even if they improve professionalization. |
| Disposition   | Ongoing governance, not single-MC resolution                                                                      |

### PR-02 — PT-02 resolution: dev-time-tool vs. runtime-consumer

| Attribute             | Value                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| Nature                | Architectural tension from F-01, deferred per Step 03                                                         |
| Resolution this cycle | NTI-01 captures future trajectory                                                                             |
| Severity this cycle   | Low — deliberately set aside. Non-zero because MC-04's extension-point work may surface runtime-use decisions |
| Disposition           | Monitor during MC-04; revisit scope if runtime-use pressure emerges mid-cycle                                 |

### PR-03 — PT-03 decision: DevContainer-as-CI vs. execution cost

| Attribute   | Value                                                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nature      | Unified-DevContainer pattern attempted ecosystem-wide but never shipped; Phase 2 chooses whether MC-11 commits to it                                        |
| Severity    | **Medium** — wrong answer wastes significant cycle time                                                                                                     |
| Principles  | Operations, Economics                                                                                                                                       |
| Source      | F-16, PT-03                                                                                                                                                 |
| Disposition | Phase 2 decision point. F-35 positive finding (21s full cycle) means simpler CI is viable without speed loss. Unified-pattern value is _parity_, not speed. |

### PR-04 — PT-04 resolution: local-first quality gating vs. consumer-visible evidence

| Attribute   | Value                                                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Nature      | Current gating produces evidence only for maintainer. Auditor persona cannot verify from published artifacts which gates ran. |
| Severity    | Medium — threatens productization objective, not cycle execution                                                              |
| Disposition | **Resolved by MC-11 + MC-12 (amended)** — CI gates + release-evidence + provenance                                            |

### PR-05 — Dormancy regression risk

| Attribute   | Value                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nature      | Pre-cycle 4-month dormancy could recur during long open-ended cycle, allowing SR-01-like accumulation                                                         |
| Severity    | **Medium** — realistic for solo open-ended cycle                                                                                                              |
| Principles  | Security, Maintainability, Operations                                                                                                                         |
| Source      | F-37, HC-08                                                                                                                                                   |
| Disposition | Long-term: MC-18 (sustainable cadence). Short-term: Phase 2 sequences MC-01 + MC-02 + MC-11 early so safety net exists before first possible dormancy window. |

### PR-06 — Dev-env monorepo breakage risk

| Attribute   | Value                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nature      | MK-03 requires Diamonds to function as submodule in `diamonds-dev-env`. Changes that break integration are design-goal violations discovered only at dev-env test time. |
| Severity    | Medium — discoverable, but adds test-overhead for every breaking MC (MC-05, MC-21 especially)                                                                           |
| Principles  | Correctness Verification, Maintainability                                                                                                                               |
| Source      | MK-03, F-19, practitioner Q-Final-3                                                                                                                                     |
| Disposition | **Addressed by NEW MC-22** (below) — dev-env integration smoke test runs in Diamonds CI. PR breaking integration blocked from merge.                                    |

### PR-07 — Scope creep from comprehensive findings set

| Attribute   | Value                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nature      | 41 findings + 22 MCs + 9 NTIs + 4 CCs + 7 SRs + 16 TDs = material surface area. Each Phase 2 session risks promoting NTI items back into MC scope. |
| Severity    | **Medium** — realistic failure mode for ambitious cycles                                                                                           |
| Principles  | Maintainability, Economics, Operations                                                                                                             |
| Source      | Cycle-pattern observation                                                                                                                          |
| Disposition | Phase 2 governance: changes to Must-Change register post-Phase 1 require documented justification, not just "seems good."                          |

### PR-08 — Extension-point design error risk (MC-04)

| Attribute   | Value                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Nature      | MC-04 promises extension contract sufficient for external sibling modules. Insufficient contract blocks MC-05 (Defender retirement). |
| Severity    | Medium — discoverable early in MC-04 work; not cycle-ending                                                                          |
| Principles  | Correctness Verification, Operations                                                                                                 |
| Source      | MC-04, MC-05 dependency                                                                                                              |
| Disposition | MC-04 verification path (stubbed sibling prototype) catches early. Phase 2 must sequence MC-04 → MC-05 correctly.                    |

---

## Section 6: Register 5 — Technical Debt

First-class category. Each entry: what it is, why it's debt,
interest rate (how fast it gets worse), principal (how hard to fix),
and disposition.

### TD-01 — Orphan gnus-dao devops tooling

| Attribute   | Value                                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What        | ~15 scripts in `scripts/devops/` copied from gnus-dao project; wired into `package.json` as runnable scripts; produce false or misleading output if run |
| Why debt    | False-tooling-presence signal to adopters; package.json surface is bloated                                                                              |
| Interest    | Low (doesn't grow) but blocks F-25 inversion                                                                                                            |
| Principal   | **Low** (delete files + remove package.json entries)                                                                                                    |
| Principles  | Maintainability (primary), Security (tooling-trust hygiene)                                                                                             |
| Source      | F-02, MC-19                                                                                                                                             |
| Disposition | MC-19                                                                                                                                                   |

### TD-02 — Jest family in devDependencies (orphaned)

| Attribute   | Value                                                                             |
| ----------- | --------------------------------------------------------------------------------- |
| What        | `jest`, `jest-mock`, `ts-jest`, `@types/jest` in devDeps; not referenced in test/ |
| Why debt    | Unused packages; CVE surface area without value                                   |
| Interest    | Low                                                                               |
| Principal   | Trivial (4 devDep removals + install)                                             |
| Principles  | Maintainability                                                                   |
| Source      | F-20, MC-19                                                                       |
| Disposition | MC-19                                                                             |

### TD-03 — `contracts-starter` unpinned git URL

| Attribute   | Value                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| What        | `contracts-starter: "git+https://github.com/mudgen/diamond-2-hardhat.git"` in devDeps |
| Why debt    | Every install pulls HEAD; irreproducible; external supply chain risk                  |
| Interest    | Medium — HEAD drift can silently break installs                                       |
| Principal   | Low (pin to commit SHA or replace)                                                    |
| Principles  | Security, Maintainability                                                             |
| Source      | F-04, MC-19                                                                           |
| Disposition | MC-19                                                                                 |

### TD-04 — Orphan `test-mock-verify.js` reference in `.npmignore`

| Attribute   | Value                                                 |
| ----------- | ----------------------------------------------------- |
| What        | File listed in `.npmignore` doesn't exist             |
| Why debt    | Config-vs-filesystem divergence signals hygiene drift |
| Interest    | Negligible                                            |
| Principal   | Trivial (one-line edit)                               |
| Principles  | Maintainability                                       |
| Source      | F-07, MC-19                                           |
| Disposition | MC-19                                                 |

### TD-05 — Legacy `package.json` scripts

| Attribute   | Value                                                                                                                       |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| What        | `defender:*` scripts (5), `rpc:*` scripts (10, mostly current but deserve audit), legacy devops scripts (~15 tied to TD-01) |
| Why debt    | Bloated script surface; `yarn run` output noisy; unclear what's current vs. legacy                                          |
| Interest    | Low, but compounds looks-unprofessional aggregate signal                                                                    |
| Principal   | Medium — per-script keep/retire triage                                                                                      |
| Principles  | Maintainability                                                                                                             |
| Source      | F-23, MC-19                                                                                                                 |
| Disposition | MC-19                                                                                                                       |

### TD-06 — `tslint.json` `.npmignore` reference (tslint deprecated since 2019)

| Attribute   | Value                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| What        | `.npmignore` excludes `tslint.json`; tslint not in deps but reference exists |
| Why debt    | Same pattern as TD-04 — hygiene drift                                        |
| Interest    | Negligible                                                                   |
| Principal   | Trivial                                                                      |
| Principles  | Maintainability                                                              |
| Source      | F-22, MC-19                                                                  |
| Disposition | MC-19                                                                        |

### TD-07 — Defender footprint distributed across 4+ layers (significant)

| Attribute   | Value                                                                                                                                                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What        | `OZDefenderDeploymentStrategy` class + `@openzeppelin/defender-sdk-*` devDeps (4 packages) + `defender:*` scripts (5) + 3 docs (`README-DEFENDER.md`, `defender-integration.md`, `monitoring-troubleshooting.md` Defender content) |
| Why debt    | Incomplete feature (never finished); depends on deprecating third-party service; cascading coordination cost when touched                                                                                                          |
| Interest    | **High** — longer it stays, more it accumulates references + confuses adopters                                                                                                                                                     |
| Principal   | Medium — coordinated removal across source, deps, scripts, docs (reason MC-05 + MC-09 separated)                                                                                                                                   |
| Principles  | Maintainability (primary), Economics, Security                                                                                                                                                                                     |
| Source      | F-24, MC-05, MC-09, Specify Q4                                                                                                                                                                                                     |
| Disposition | MC-05 + MC-09 + MC-19                                                                                                                                                                                                              |

### TD-08 — No TypeScript code coverage measurement (UNMEASURED)

| Attribute   | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| What        | Coverage tooling not installed                                           |
| Why debt    | Scoring & Metrics principle has no evidence; coverage claim unverifiable |
| Interest    | Medium — harder to retrofit as code grows                                |
| Principal   | Low (install nyc, configure)                                             |
| Principles  | Scoring & Metrics, Maintainability, Correctness Verification             |
| Source      | Step 02 §5.3, MC-14                                                      |
| Disposition | MC-14                                                                    |

### TD-09 — 7 misplaced integration tests in main Diamonds repo

| Attribute   | Value                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| What        | `rpcDeployment.test.ts` contains integration tests requiring running Hardhat node; auto-skip as pending without it |
| Why debt    | Test-architecture debt (F-18 says integration tests live in dev-env); permanent-pending state                      |
| Interest    | Low                                                                                                                |
| Principal   | Low-Medium (move or reconfigure)                                                                                   |
| Principles  | Maintainability, Correctness Verification                                                                          |
| Source      | F-36, MC-15                                                                                                        |
| Disposition | MC-15                                                                                                              |

### TD-10 — No CHANGELOG.md

| Attribute   | Value                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| What        | No release-notes file of any form                                                                                       |
| Why debt    | Consumers cannot learn what changed; auditors cannot reconstruct history; security-upgrade communication has no channel |
| Interest    | Medium — every release accumulates undocumented changes                                                                 |
| Principal   | Low going forward; Medium if retrospectively populated                                                                  |
| Principles  | Maintainability, Correctness Verification, Security (communication)                                                     |
| Source      | F-28, MC-13                                                                                                             |
| Disposition | MC-13                                                                                                                   |

### TD-11 — No generated API reference

| Attribute   | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| What        | All public API documentation hand-written markdown; no source-to-docs tool      |
| Why debt    | Documentation-code divergence inevitable; retrofit cost scales with API surface |
| Interest    | Medium — accelerates as docs are built out                                      |
| Principal   | Medium (tooling selection + integration + content)                              |
| Principles  | Maintainability, Correctness Verification                                       |
| Source      | Step 01 §10.3, MC-06                                                            |
| Disposition | MC-06 + MC-08                                                                   |

### TD-12 — Documentation-code drift, aggregate (largest debt by principal)

| Attribute   | Value                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What        | All 11 markdown docs "need cleanup + expansion"; README-DEFENDER stale (Defender deprecated); ROADMAP "Production Ready" claim questionable; ABI Generator over-documented vs. undocumented core |
| Why debt    | Docs no longer reliably describe code; misleading information to contributors + adopters                                                                                                         |
| Interest    | Medium — every undocumented change widens gap                                                                                                                                                    |
| Principal   | **High** (all 11 docs need work; new topics need authorship)                                                                                                                                     |
| Principles  | Maintainability (primary), Correctness Verification                                                                                                                                              |
| Source      | F-03, F-24, F-25, F-26, MC-06/07/08/09/10                                                                                                                                                        |
| Disposition | Largely resolved across MC-06, MC-07, MC-08, MC-09, MC-10                                                                                                                                        |

### TD-13 — No CI workflows; CI ecosystem pattern never shipped

| Attribute   | Value                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------- |
| What        | No `.github/workflows/`; unified-DevContainer-as-CI pattern attempted but never shipped            |
| Why debt    | Gating single-point-of-enforcement (SR-05); release trust low; productization structurally blocked |
| Interest    | Medium — industry-adopter expectations increase visibility                                         |
| Principal   | Medium (CI selection + workflow authorship + secrets)                                              |
| Principles  | Operations (primary), Security, Correctness Verification                                           |
| Source      | F-05, F-11, F-16, PT-03, MC-11                                                                     |
| Disposition | MC-11 + MC-12 (amended)                                                                            |

### TD-14 — Husky silent-failure gates

| Attribute   | Value                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| What        | OSV scan output suppression; Snyk unauthenticated silent skip                                                                         |
| Why debt    | Gate coded to be comprehensive; implementation is buggy. Every day the gate stays this way, security claim is overstated.             |
| Interest    | **High** — mechanism by which SR-01 accumulated during dormancy undetected                                                            |
| Principal   | **Very low** (2 small edits to `.husky/pre-push`)                                                                                     |
| Principles  | Security, Correctness Verification                                                                                                    |
| Source      | F-13, F-14, MC-02                                                                                                                     |
| Disposition | MC-02                                                                                                                                 |
| **Note**    | **Highest interest-rate / lowest principal item in entire register. Strongest candidate for "fix this first, before anything else."** |

### TD-15 — Burst-then-dormant release cadence without maintenance policy

| Attribute   | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| What        | 7 releases in 2 months, 4 months dormant; no documented maintenance commitment  |
| Why debt    | Adopter trust erodes during dormancy; security posture degrades during dormancy |
| Interest    | Medium — compounds with SR-01 and TD-14                                         |
| Principal   | Low (defining policy is cheap; holding to it is work)                           |
| Principles  | Maintainability, Economics, Operations                                          |
| Source      | F-37, MC-18                                                                     |
| Disposition | MC-18                                                                           |

### TD-16 — Zero external user feedback loop

| Attribute   | Value                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| What        | Three production environments all practitioner-owned; zero external contributors; no external bug reports |
| Why debt    | Not technical in classical sense — _adoption debt_. No external pressure to surface design flaws.         |
| Interest    | Low while dormant; Medium-High when productization begins (first external users stress-test in new ways)  |
| Principal   | Not fixable directly — fixed by productization itself                                                     |
| Principles  | Maintainability, Correctness Verification (longer-term)                                                   |
| Source      | F-39                                                                                                      |
| Disposition | Addressed structurally across MC-06 through MC-10 + MC-13                                                 |

---

## Section 7: New Must-Changes Surfaced During Step 04

Three MCs emerged from register construction. Each is now authoritative
and will flow into Step 05 and subsequent artifacts.

### MC-21 (NEW) — Private key handling refactored out of `RPCDeploymentStrategy` constructor

| Attribute            | Value                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | SR-03 — private key currently accepted as constructor parameter, held as instance state                                                                                                                                                                                                                                                                                                                                                     |
| Target               | Private key removed from `RPCDeploymentStrategy` constructor signature; signer/key provided per-deployment-call or by passing already-constructed `ethers.Wallet`/`Signer` object. MC-07 narrative docs include secure key handling guidance section recommending environment-specific approaches (Hardhat 3 key store per NTI-08 trajectory, HashiCorp Vault per NTI-09, `.env` with strong git-secrets hygiene as current-cycle baseline) |
| Source               | SR-03, practitioner Q-Final-1 decision                                                                                                                                                                                                                                                                                                                                                                                                      |
| Principles           | Security (primary), Correctness Verification, Maintainability                                                                                                                                                                                                                                                                                                                                                                               |
| Breaking change      | Yes — consumers currently passing key in constructor must update. Justifiable per HC-05. Feeds MC-13 CHANGELOG as breaking-change entry.                                                                                                                                                                                                                                                                                                    |
| Phase-6 verification | Constructor signature inspection shows key not accepted; test case confirms key not persisted in strategy instance after deployment; docs section exists                                                                                                                                                                                                                                                                                    |

### MC-22 (NEW) — Dev-env integration smoke test runs in Diamonds CI

| Attribute            | Value                                                                                                                                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | MK-03 currently enforced only at merge-time in dev-env; no pre-merge signal in Diamonds CI                                                                                                                                                                                       |
| Target               | Diamonds CI pipeline includes smoke-test job that (a) consumes current Diamonds source as submodule (or equivalent), (b) runs minimum-viable integration tests against dev-env's test suite, (c) fails PR gate if integration breaks. Pre-publish workflow runs same smoke-test. |
| Source               | PR-06, MK-03, practitioner Q-Final-3 decision                                                                                                                                                                                                                                    |
| Principles           | Correctness Verification (primary), Operations, Maintainability                                                                                                                                                                                                                  |
| Dependencies         | MC-11 foundation (CI exists); Phase 2 designs mechanism (submodule checkout + test, yarn workspace link, shared smoke-test subset)                                                                                                                                               |
| Phase-6 verification | PR breaking dev-env integration is blocked from merge; commit breaking integration never reaches npm                                                                                                                                                                             |

### MC-12 AMENDED — Publish pipeline now includes npm `--provenance` attestation

| Attribute             | Value                                                                                                                                                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Updated target clause | CI-driven workflow re-runs gates server-side and produces release-evidence artifact (scan results, test output, build hash) visible to auditors, **and the npm publish command uses `--provenance` to produce cryptographic attestation linking the published tarball to its source commit via GitHub Actions OIDC** |
| Side constraint       | `npm --provenance` **requires** CI-driven publishing; cannot be produced by manual local publish. Partially constrains MC-12 mechanism design.                                                                                                                                                                       |
| Source                | SR-07, practitioner Q-Final-2 decision                                                                                                                                                                                                                                                                               |
| Impact on MC-11/12    | Mechanism choice is not purely preference — provenance requirement eliminates "manual release with simple release notes" option                                                                                                                                                                                      |

---

## Section 8: New NTIs for Deferred Security Architecture

### NTI-08 — Hardhat 3 upgrade with integrated key store adoption

| Attribute                    | Value                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trajectory                   | Upgrade Hardhat dependency 2.x → 3.x; refactor Hardhat 2.x-specific API usage; adopt Hardhat 3's built-in key store; coordinate breaking-change propagation through dev-env and hardhat-diamonds |
| Deferral reason              | Substantial ecosystem work; breaking change to dev-env violates MK-03 without careful sequencing; better as next-cycle focus where it's the primary architectural thread                         |
| Re-evaluate when             | This cycle's productization completes **and** Hardhat 3 has ecosystem stabilization signal (wider peer-library adoption)                                                                         |
| Practitioner priority signal | **"One of the principle requirements for the next cycle"** — noted explicitly for preservation                                                                                                   |

### NTI-09 — Complete HashiCorp Vault persistent key store (DevContainer branch)

| Attribute         | Value                                                                                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trajectory        | Finish persistent-vault implementation currently on DevContainer branch; integrate with already-working ephemeral-vault + .env import machinery                                                               |
| Deferral reason   | Complex infrastructure (bash, Wizard, Docker container, cryptographic software for persistent vault); solo-maintainer-sustainable operation questionable; scope is DevContainer/dev-env, not Diamonds subject |
| Re-evaluate when  | Specific adopter demand surfaces, or DevContainer repo has dedicated attention cycle                                                                                                                          |
| Work preservation | Branch retained with WIP state; ~70% complete (ephemeral works + .env import works; persistent nearly complete)                                                                                               |

---

## Section 9: Priority Register (Consolidated)

All five categories ranked for Phase 2 consumption. Ranking blends
severity × interest-rate × principal × principle-weight.

### Tier 1 — Act First (Foundation Cluster)

| Rank | ID                    | Item                                  | Why first                                                                                                                               |
| ---- | --------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | TD-14 / SR-04 / MC-02 | Husky silent-failure gates            | **Highest interest-rate / lowest principal** in entire inventory; 2 small `.husky/pre-push` edits; unblocks trustworthy security signal |
| 2    | SR-01 / MC-01         | Runtime CVE advisories (axios/lodash) | Critical severity in published artifact; fastest-to-close (semver-minor bumps); directly improves auditor-visible state                 |
| 3    | TD-01..06 / MC-19     | Cleanup pass                          | All Low-principal, collectively High-impact on hygiene signal; unblocks cleaner CI configuration                                        |
| 4    | TD-13 / MC-11         | CI pipeline                           | Enables enforcement of everything above once landed; MK-09 corollary bounds design                                                      |
| 5    | TD-15 / PR-05 / MC-18 | Sustainable cadence policy            | Prevents dormancy recurrence from re-accumulating debt; cheap to define, disciplined to hold                                            |

### Tier 2 — Capability Cluster

| Rank | ID                    | Item                                                            | Why here                                                                                                 |
| ---- | --------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 6    | TD-07 / MC-05 + MC-09 | Defender retirement, all layers                                 | Material retire; unblocks TD-12 (docs rebuild)                                                           |
| 7    | MC-04 / PR-08         | Strategy extensibility prototype                                | Enables future NTI-03 (diamonds-safe); validates contract; blocks TD-07 if insufficient                  |
| 8    | SR-03 / MC-21         | Private key handling refactor                                   | Breaking change but low principal; materially reduces audit-finding severity; enables NTI-08 future path |
| 9    | MC-22                 | Dev-env smoke test in CI                                        | Preserves MK-03; required for safe MC-05, MC-21 breaking-change work                                     |
| 10   | TD-08 / MC-14         | Coverage tooling + baseline + floor                             | Turns UNMEASURED into MEASURED; enables scoring gate at Phase 6                                          |
| 11   | TD-09 / MC-15         | Misplaced integration tests                                     | Low effort; removes permanent-pending signal                                                             |
| 12   | MC-16 / MC-17 / MC-20 | Issue-driven fixes (External libraries, deployInclude, linting) | Small, concrete, practitioner-identified                                                                 |

### Tier 3 — Productization (Documentation & Release Cluster)

| Rank | ID                      | Item                                             | Why here                                                                        |
| ---- | ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| 13   | TD-11 / MC-06           | Generated API reference                          | Scaffold that MC-07 content attaches to                                         |
| 14   | TD-12 (partial) / MC-07 | Core-concept narrative docs                      | Largest content deliverable; supports MC-04, MC-21                              |
| 15   | MC-08                   | Documentation site live                          | Publishing surface for MC-06 + MC-07                                            |
| 16   | MC-10                   | README productization framing                    | Consumer-facing first impression                                                |
| 17   | TD-10 / MC-13           | CHANGELOG                                        | Communication channel for release work; includes breaking-change record (MC-21) |
| 18   | MC-12 (amended)         | Publish pipeline + release-evidence + provenance | Auditor-visible trust chain                                                     |

### Watch / Long-Term (no MC; managed over time)

| ID         | Item                                                                  |
| ---------- | --------------------------------------------------------------------- |
| CC-01      | ERC-2535 conformance (no current divergence; watch for future audits) |
| SR-02      | Transitive vulnerability density (chronic; triage policy via MC-03)   |
| PR-01      | PT-01 governance (ongoing filter for Phase 2)                         |
| PR-07      | Scope creep vigilance                                                 |
| TD-16      | External feedback loop (resolved structurally by productization)      |
| NTI-01..09 | All deferred items                                                    |

---

## Section 10: Worst-Case Security Scenario Narrative

Brownfield discipline: force explicit articulation of the worst
outcome the cycle's risks could produce if unaddressed. Not a
prediction — a **structured nightmare** clarifying what the MCs
collectively defend against.

> **Worst-case narrative, Q3 2026:**
>
> Diamonds remains dormant for another 4 months after Phase 5 work
> begins. During that dormancy, three things compound:
>
> **Branch 1 — Exploitable CVE lands.** A new axios or lodash CVE
> is published that _is_ exploitable through Diamonds' actual code
> paths (beyond current theoretical concern). The published v1.3.2
> ships vulnerable versions; the pre-push gate would catch it, but
> no one pushes. A consumer's deployment is compromised through the
> transitive dependency chain. The audit trail terminates at
> `@diamondslab/diamonds` as the root cause.
>
> **Branch 2 — Adopter walks silently.** A Solidity developer
> evaluating Diamonds for a commercial project runs `yarn audit` on
> their install. They see 7+ High/Critical advisories and zero
> CHANGELOG context. They cannot tell whether the project is
> actively maintained, temporarily paused, or abandoned. They
> silently move to an alternative — possibly less architecturally
> sound — losing Diamonds an adopter and producing no feedback
> signal.
>
> **Branch 3 — Auditor flags it.** An auditor reviewing a production
> diamond depending on Diamonds discovers the CVE footprint. The
> auditor cannot verify from Diamonds' published artifacts whether
> security gates ran on v1.3.2's build. The deployed diamond itself
> is fine (CVEs are in dev-time tooling) but the audit report flags
> supply-chain hygiene. The client project chooses between rebuilding
> with a different deployment library or accepting the audit
> finding.
>
> **The underlying mechanism in all three branches is the same:**
> _the gap between what Diamonds claims (working, production-ready,
> secure) and what Diamonds can prove (via published evidence) is
> large enough for doubt to grow._
>
> **What Tier 1 prevents in this scenario:**
>
> - TD-14/MC-02 fix — pre-push gate actually catches new CVEs
>   during active work
> - SR-01/MC-01 — current CVE window closed
> - MC-19 cleanup — removes abandonment signals
> - MC-11 CI + MC-18 cadence — visible signal-of-life even during
>   low-activity periods
>
> **What Tier 2-3 prevents in this scenario:**
>
> - MC-06/07/08 docs site with API reference — demonstrates active
>   maintenance independent of commit cadence
> - MC-12 (amended) release-evidence + provenance — gives auditor
>   what they need to confirm gates fired
> - MC-13 CHANGELOG — lets Solidity developer distinguish "stable"
>   from "abandoned"
> - MC-21 private-key refactor — reduces audit-finding severity
>   even in scenarios where audit _does_ occur
>
> **Key insight:** The cycle's outcomes are **interlinked as trust
> infrastructure**. No single MC prevents the scenario; the
> combination does. This framing should guide Phase 2 sequencing —
> partial completion with foundation (Tier 1) + productization
> scaffold (Tier 3 docs/CHANGELOG/release-evidence) is stronger
> than partial completion with only capability work (Tier 2).

---

## Section 11: Cross-Phase Handoff Notes

### For Phase 2 (Analysis & Improvement Planning)

- **Sequence Tier 1 first.** Foundation cluster is cheap and unblocks everything.
- **Active governance of PR-01.** Every Phase 2 plan element passes both professionalization + sustainability filters.
- **MC-04 → MC-05 sequencing is critical.** Don't retire Defender until extension-point sufficiency is proven.
- **PT-03 decision point:** simpler CI vs. unified DevContainer. Recommend simpler CI given F-35 speed finding, unless environmental parity independently valuable.
- **MC-12 mechanism constrained by provenance requirement.** CI-driven publishing is now required, not preferred.
- **MC-22 mechanism design** has three clean options — Phase 2 picks: (a) CI job checks out dev-env + updates submodule, (b) dev-env exposes test target Diamonds CI calls, (c) shared smoke-test subset.
- **Triage policy for SR-02** transitive advisories. Phase 2 defines the threshold that triggers action vs. accepting upstream cadence.

### For Phase 3 (Design & Technical Analysis)

- **MC-04 extension contract design** deserves a formal design document before prototype work. Contract must be specified tightly enough that a non-practitioner can implement against it.
- **MC-21 breaking-change design** — new `RPCDeploymentStrategy` signature must be designed with migration path documentation. Feeds MC-13 CHANGELOG.
- **Coverage floor definition (MC-14).** Phase 3 chooses target coverage %; must be achievable given existing 70 tests as baseline.

### For Phase 5 (Implementation)

- **TD-14 gate-bug fixes** are among the highest-leverage items in the entire cycle. Schedule as first implementation tasks, not held for coordinated security block.
- **MC-21 refactor + docs** are coupled deliverables — Phase 5 implementation cannot ship one without the other (breaking change without migration docs is worse than no change).

### For Phase 6 (Testing & Audit)

- Every MC has traceable baseline row in Step 02 or Step 04. Phase 6 verification is structural.
- **Auditor-persona verification** (F-41 documentation, MC-07 explicit, MC-12 release-evidence, MC-21 key-handling) should be tested via proxy-audit run at Phase 6, not deferred to first external engagement.

### For Phase 7 (Deployment & Evolution)

- **MC-18 sustainable cadence** becomes live operational commitment in Phase 7.
- **NTI re-evaluation triggers** are Phase 7's responsibility to watch:
- **NTI-01** — Hardhat decoupling (if ecosystem shifts)
- **NTI-03** — diamonds-safe (when demand concrete)
- **NTI-08** — Hardhat 3 upgrade (practitioner-flagged next-cycle priority)
- **NTI-09** — HashiCorp Vault (if DevContainer cycle allocates attention)

---

## Section 12: Register Totals & Source Distribution

| Register                           | Count | Net-new from Step 04                    |
| ---------------------------------- | ----- | --------------------------------------- |
| Compliance / Standards Conformance | 4     | 0 (all resolve in existing MCs/NTIs)    |
| Security Risks                     | 7     | 0 (all trace to prior findings)         |
| Hard Constraints                   | 8     | 0 (carryforward from Specify + Step 02) |
| Project / Operational Risks        | 8     | 0 (PT-01..04 + F-37/38 derived)         |
| Technical Debt                     | 16    | 0 (all map to findings)                 |
| Must-Changes added                 | 2     | MC-21, MC-22                            |
| Must-Changes amended               | 1     | MC-12                                   |
| NTIs added                         | 2     | NTI-08, NTI-09                          |

**Updated cycle totals:**

- Must-Keep: 9
- Must-Change: **22** (20 from Step 03 + MC-21 + MC-22)
- Nice-to-Improve: **9** (7 from Step 03 + NTI-08 + NTI-09)
- Incidental: 8

### Evidence-Basis Distribution (Step 04 artifact)

| Basis                                           | Share |
| ----------------------------------------------- | ----- |
| Prior-artifact carry-forward (Steps 01-03)      | ~70%  |
| Practitioner decisions during Step 04 interview | ~20%  |
| Register-construction derivations               | ~10%  |

---

## Section 13: Source & Evidence Register

- **Register-construction source:** Step 03 Must-Change register + Steps 01-02 findings register (F-01..F-42) + GitHub issues + Specify hard constraints
- **Practitioner decisions in Step 04:**
- Standards-conformance framing for Compliance register (accepted)
- SR-03 disposition → MC-21 created; NTI-08, NTI-09 created
- SR-07 disposition → MC-12 amended
- PR-06 disposition → MC-22 created
- All register entries reviewed and accepted
- **Cross-repo evidence cited:** `diamonds-dev-env` integration pattern (MK-03, PR-06); DevContainer HashiCorp Vault branch (NTI-09); `hardhat-diamonds` peer package (CC-02)

---

_Part of the Phase 1 Information Gathering (Existing Projects) Tool Set_
_AI-Centric Software Development Playbook — Dogfooding on Diamonds_
_Previous artifact: Step 03 — Requirements & Improvement Objective Sketch_
_Next artifact: Step 05 — Reusable & Replaceable Components Catalog_
