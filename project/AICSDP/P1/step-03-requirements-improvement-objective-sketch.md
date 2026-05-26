# Requirements & Improvement Objective Sketch

## `@diamondslab/diamonds` v1.3.2 → v2.0 Improvement Cycle

**Artifact:** Step 03 output — Phase 1 (Existing Projects)
**Assessment date:** 2026-04-20
**Subject repository:** `diamondslab/diamonds` (standalone scope)
**Practitioner:** solo maintainer
**AI analyst:** Claude Opus 4.7 (with `project_knowledge_search`, Context7, GitHub MCP)
**Prior artifacts consumed:** Discovery Specification & Plan; Step 01 Current-State Technology & Architecture Assessment; Step 02 Operational & Performance Baseline
**Evidence sources added during Step 03:** GitHub issues list (10 total, 7 open) via GitHub MCP, pulled 2026-04-20

> This artifact sharpens the improvement objective from the working
> pillars established at Specify, grounded in the measured baselines
> from Step 02 and the open-issue backlog from the GitHub tracker.
> Every must-change outcome links to a specific Step 02 baseline row
> that Phase 6 will use as the before-picture. This artifact is
> **not** the final requirements document — it is the sketch that
> Phase 2 and Phase 3 will refine into detailed PRDs.

---

## Section 1: Executive Summary

This cycle **productizes Diamonds for non-maintainer adopters** — a
framing that emerged from Step 02's discovery that the library
currently has zero external users (Finding F-39). The work overlap
with the Specify-stage "professionalize" framing is ~90%; the
renaming sharpens what "done" means. Productization is defined as
the state in which a Solidity developer or auditor who did not build
Diamonds can assess, adopt, use, and audit the library end-to-end
without practitioner support.

**Scope decisions:** 9 must-keep constraints locked in (auditor
reproducibility, RPC production path, dev-env integration, public
API, emergency bypass, maintainer-time budget, zero-budget operation,
ERC-2535 conformance, local husky gating). 20 must-change outcomes
identified, each linked to a specific Step 02 baseline row. 7
nice-to-improve items deferred to future cycles with named
re-evaluation triggers. 8 incidental current behaviors explicitly
released so Phase 2 isn't accidentally bound by them.

**The highest-urgency cluster** is security + dependency hygiene
(MC-01 through MC-03). The published v1.3.2 ships with 7
High/Critical + 4 Moderate CVE advisories in runtime deps; the
husky pre-push gate that _should_ catch these has two documented
silent-failure bugs. Phase 2 should sequence these fixes before
content work because they are fast (semver-minor upgrades + small
gate-logic fixes) and they unblock the trust properties other
must-changes depend on.

**The largest architectural move** is MC-04 (rewritten from initial
draft): strategy extensibility for external multi-party modules. The
practitioner-proposed better pattern keeps actual multi-party
implementations (Safe Wallet, Zodiac) as separate npm packages in the
DiamondsLab hub-and-spoke pattern. This cycle's responsibility is
ensuring the `BaseDeploymentStrategy` extension contract is
sufficient for such sibling modules to be built externally without
modifying Diamonds core.

**Explicit deferrals** include Hardhat decoupling (future cycle,
after productization stabilizes within the Hardhat ecosystem where
Diamonds dominates), bundled browser builds (nice-to-have, complexity
risk outweighs benefit this cycle), actual `diamonds-safe` /
`diamonds-zodiac` modules (enabled by MC-04, but implementation is
future cycle work at ecosystem level), Foundry-Rust rewrite (out of
Specify scope), and the DiamondsLab organization-wide website
(ecosystem concern, not Diamonds subject).

**Version target:** v2.0, breaking changes permitted per-item
justified. **Time horizon:** open-ended. **Success criteria:** each
must-change individually verifiable at Phase 6; overall success
requires all must-changes met or explicitly deferred with rationale.

---

## Section 2: Sharpened Improvement Objective

This is the authoritative objective statement Phase 6 will judge
success against.

> **Improvement Objective for the Current Cycle (Diamonds v1.3.2 → v2.0)**
>
> This cycle productizes `@diamondslab/diamonds` for adoption by
> Solidity developers and auditors building greenfield smart-contract
> projects on the Hardhat ecosystem. Productization is defined as
> the state in which a non-maintainer adopter can assess, adopt, use,
> and audit the library end-to-end without requiring practitioner
> support.
>
> **Concretely, this cycle produces:** (a) a published library with
> zero known High/Critical CVEs in its runtime dependency graph at
> every release, (b) a functional CI pipeline that enforces quality
> gates on every PR and publish, delivering server-side evidence
> visible to auditors, (c) a dedicated documentation site with
> generated API reference plus narrative docs covering ERC-2535
> adoption, the `BaseDeploymentStrategy` extension contract, and the
> auditor-reproducibility property, (d) a measurable test coverage
> baseline with CI-enforced floor, (e) a sustainable release cadence
> that a solo maintainer within a <5 hour/week ecosystem-budget can
> actually hold, and (f) extension-point infrastructure sufficient
> for future sibling modules (`diamonds-safe` and similar) to
> implement multi-party-control strategies without modifying Diamonds
> core.
>
> **This cycle explicitly preserves:** auditor reproducibility as a
> first-class property, the production-current `RPCDeploymentStrategy`
> deployment path, the git-submodule-within-diamonds-dev-env
> integration pattern, ERC-2535 conformance, and the local-first
> husky quality-gating architecture as a supplement to (not a
> replacement for) server-side CI gates.
>
> **This cycle explicitly defers:** framework-agnostic restructuring
> (Hardhat decoupling), bundled browser-consumable build output,
> actual implementations of multi-party-control strategies (Safe /
> Zodiac) in separate modules, a Foundry-Rust rewrite, and the
> DiamondsLab organizational website.
>
> **Version target:** v2.0 publish — breaking changes permitted where
> per-item justified, preserving the must-keep register.
>
> **Time horizon:** Open-ended. The cycle does not have a release
> deadline, but individual must-change items may be sequenced such
> that foundational work (CI, cleanup, gate fixes) lands before
> content work (docs, extension-points) so Phase 5 execution compounds
> on stabilized infrastructure.
>
> **Success criteria:** Phase 6 will verify each must-change item
> against its specific measurable target. Overall cycle success
> requires all must-change items to be met or have explicit,
> documented deferral rationale. The Phase 6 "before-picture" is the
> Step 02 Operational Baseline; the "after-picture" is the measurable
> state at Phase 6 verification time.

---

## Section 3: Must-Keep Register

Properties and constraints the improvement cycle must preserve.
Violating any of these is a design-goal violation, not a trade-off.

### 3.1 Register Entries

**MK-01 — Auditor reproducibility.**
Given the published npm package + consumer source + deployment record,
an auditor must be able to reproduce the deployed contracts, facets,
and state from scratch. This is a defining design goal per
practitioner testimony (F-41). Phase 2 decisions must not compromise
it — no moving deployment state into environment-dependent stores, no
introducing steps that require ambient practitioner-machine state, no
obscuring the `FileDeploymentRepository` / `RPCDeploymentStore`
persistence chain.

**MK-02 — Production-current `RPCDeploymentStrategy` functional throughout.**
`RPCDeploymentStrategy` is the deployment path actually used in
production (F-27, F-41). It must remain functional at every point
during the improvement cycle. This does not preclude refactoring,
extending, or building sibling strategies — but the library must
remain usable end-to-end continuously.

**MK-03 — Dev-env submodule integration pattern.**
Diamonds must continue to function as a git submodule within
`diamonds-dev-env` (F-19). Design decisions within the Diamonds
module have been made with this pattern in mind; breaking the
submodule-consumable-as-module relationship would be a breaking
change to the ecosystem even if the public npm API is unchanged.

**MK-04 — Public API surface at v1.3.2.**
The public API in use by the practitioner's three production
environments is preserved unless breaking changes are per-item
justified. Specific surfaces:

- `Diamond(config, repository)` constructor signature
- `DiamondDeployer(diamond, strategy)` constructor signature
- `FileDeploymentRepository` constructor
- `LocalDeploymentStrategy`, `RPCDeploymentStrategy` constructors
- The `"./core"` subpath export (F-42, newly surfaced)

Per Specify Q5, breaking changes are acceptable when justified but
the burden of justification is real.

**MK-05 — Auditable emergency-bypass capability.**
The ability to bypass husky hooks in emergency scenarios exists and
is auditable via the bypass log file (F-12). Removing emergency-bypass
capability would force the practitioner to either disable hooks
entirely (worse) or get stuck behind failing gates during genuine
emergencies. Improvement work may refine it but must not remove it.

**MK-06 — Solo-sustainable maintenance load.**
Whatever Phase 2 produces must be operable within the <5 hours/week
maintainer-time budget, ideally significantly less since Diamonds is
a minority share of that budget (H-01, F-38, PT-01). This elevates
automation (CI, dependency-patch bots, doc generation) from nice-to-
have to required. Any improvement that requires ongoing manual toil
incompatible with this budget is a design-goal violation.

**MK-07 — Zero-budget / OSS-only operation.**
Free / OSS tooling only. No vendor services requiring paid tiers at
baseline (H-03, H-04). Phase 2 cannot reach for a paid service just
because it's the obvious choice.

**MK-08 — ERC-2535 conformance.**
Diamonds' reason for existing is to correctly implement ERC-2535
Diamond Proxy deployment. Any improvement that compromises conformance
is a fundamental project-definition violation.

**MK-09 — Local husky quality gating (for this cycle).**
The husky-based local gating architecture (F-08) is retained as a
first-tier quality gate for this improvement cycle. No code should
reach CI that can't pass local tests. This is re-evaluable in future
cycles. **Corollary:** CI gates that get added (MC-11) must be a
**superset** of husky gates, not a replacement. Husky stays; CI adds
server-side verification on top.

### 3.2 Implicit Constraints

These are not standalone must-keep entries but emerge as corollaries:

- **Transitive: CI gates ⊇ husky gates.** Any improvement cycle that
  reduces the gate set on the publish path violates MK-09.
- **Transitive: MK-04 changes require v2.0 semantics.** Any breaking
  change to the public API requires the corresponding major-version
  bump and a documented migration path (feeds MC-13 CHANGELOG).
- **Transitive: F-41 architecture defends MK-01.** Any change to
  `FileDeploymentRepository`, `RPCDeploymentStore`, or the
  `functionSelectorRegistry` persistence chain must preserve
  reproducibility.

---

## Section 4: Must-Change Register

Each entry: outcome statement, baseline anchor, measurable target,
source finding(s), principle mapping, Phase-6 verification method.

### 4.1 Cluster A — Security & Dependency Hygiene

**MC-01 — Zero High/Critical CVE advisories in runtime dependencies at publish time.**

| Attribute                    | Value                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Baseline anchor              | Step 02 §4.2 — 7 High/Critical + 4 Moderate in axios + lodash                                    |
| Target                       | 0 High/Critical, 0 Moderate in direct runtime deps at every published release                    |
| Source finding(s)            | F-29 (revised)                                                                                   |
| Principles                   | Security (primary), Operations                                                                   |
| Phase-6 verification         | `yarn npm audit --severity moderate` and `yarn snyk:test` return zero findings at release tag    |
| Phase 2 mechanism candidates | Dependabot / Renovate auto-PRs, scheduled `yarn up` pass, CI gate that fails publish on findings |

**MC-02 — Fix husky-gate silent-failure bugs.**

| Attribute              | Value                                                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor        | Step 02 §4.4 — `yarn snyk:test` silent-skip (F-13); `yarn osv:scan` output-suppression (F-14)                                                      |
| Target                 | Both gates return non-zero exit and block the push when findings exist; Snyk unauthenticated state is surfaced as visible warning, not silent pass |
| Source finding(s)      | F-13, F-14                                                                                                                                         |
| Principles             | Security, Correctness Verification, Operations                                                                                                     |
| Phase-6 verification   | Inject synthetic vulnerability, confirm gate blocks push                                                                                           |
| Phase 2 mechanism hint | Remove `\|\| echo "..."` fallbacks; handle unauthenticated Snyk explicitly                                                                         |

**MC-03 — Lockfile-refresh cadence with trackable evidence.**

| Attribute            | Value                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | F-31 (no cadence); F-33 (standalone lockfile older than monorepo — extra lodash CVE)                                             |
| Target               | Defined refresh cadence (e.g., monthly `yarn up` + re-scan); execution evidence captured in CHANGELOG, git log, or dedicated log |
| Source finding(s)    | F-31, F-33                                                                                                                       |
| Principles           | Security, Maintainability                                                                                                        |
| Phase-6 verification | Git history over preceding 90 days shows cadence-compliance                                                                      |

### 4.2 Cluster B — Solid Base Deployment System

**MC-04 — Strategy extensibility for external multi-party modules.**
(Rewritten from original draft per practitioner architectural proposal.)

| Attribute               | Value                                                                                                                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Baseline anchor         | Step 01 §6.2 — 3 strategies in core (Base, Local, RPC); no extension-point validation for third-party strategies                                                                                                                                                         |
| Target                  | `BaseDeploymentStrategy` is documented and demonstrated as a clean extension point. A sibling module (e.g., stubbed `diamonds-safe` prototype) can be authored **from outside the Diamonds repo** using only the public API — no modifications to Diamonds core required |
| Explicitly not in scope | Implementing Safe / Zodiac strategies themselves. Those are future separate modules in NTI.                                                                                                                                                                              |
| Source finding(s)       | F-01 / PT-02, Specify Q4 (amended)                                                                                                                                                                                                                                       |
| Principles              | Maintainability (primary — extension points are API surface), Operations, Correctness Verification                                                                                                                                                                       |
| Phase-6 verification    | Prototype third-party strategy compiles against `@diamondslab/diamonds@<new-version>` as its only dependency, implements minimal multi-party lifecycle, works end-to-end on at least one testnet                                                                         |

**MC-05 — `OZDefenderDeploymentStrategy` retired, all layers.**

| Attribute            | Value                                                                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | F-24 — Defender footprint distributed across source, scripts, deps, docs                                                                                                                                                     |
| Target               | `OZDefenderDeploymentStrategy` class removed; `defender:*` package.json scripts removed; `@openzeppelin/defender-sdk-*` devDependencies removed; Defender documentation removed or replaced (MC-09 tracks docs specifically) |
| Dependency           | MC-04 before this (don't retire before extension-point sufficiency is proven)                                                                                                                                                |
| Source finding(s)    | F-24                                                                                                                                                                                                                         |
| Principles           | Maintainability (primary), Economics, Security (fewer deps = smaller attack surface)                                                                                                                                         |
| Phase-6 verification | `grep -r -i defender src/ scripts/ package.json docs/` returns only intentional historical references                                                                                                                        |

### 4.3 Cluster C — Professional Documentation

**MC-06 — Public API reference generated and published.**

| Attribute            | Value                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | Step 01 §10.3 — no generated API reference exists                                                                                                                           |
| Target               | Generated API reference covering the exported public API, published to a URL consumers can reach (integrates with MC-08 site)                                               |
| Source finding(s)    | Step 01 §10, working pillar #3, Issue #3                                                                                                                                    |
| Principles           | Maintainability (primary), Correctness Verification                                                                                                                         |
| Phase-6 verification | API reference URL is accessible, includes all items from `src/core/index.ts`, `src/strategies/index.ts`, `src/repositories/index.ts`, `src/schemas/`, relevant `src/utils/` |

**MC-07 — Core-concept narrative documentation exists for adopters.**

| Attribute            | Value                                                                                                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | F-25 (ABI Generator has 6 docs, core deployment has none); F-40 (contributor ramp-up concentrates at `BaseDeploymentStrategy`)                                                                                                                                                                          |
| Target               | Narrative documentation covering: ERC-2535 primer for adopters; `BaseDeploymentStrategy` lifecycle explanation; how `RPCDeploymentStrategy` uses it; how `LocalDeploymentStrategy` uses it; how to write a new strategy (supports MC-04); auditor-reproducibility property (F-41) explicitly documented |
| Source finding(s)    | F-25, F-40, F-41                                                                                                                                                                                                                                                                                        |
| Principles           | Maintainability (primary), Correctness Verification (makes F-41 visible)                                                                                                                                                                                                                                |
| Phase-6 verification | Doc URL exists for each named topic; sample non-maintainer reader (AI-assisted proxy if no human available) can answer 5 basic adoption questions from docs alone                                                                                                                                       |

**MC-08 — Documentation site live with markdown-first pipeline.**

| Attribute            | Value                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Baseline anchor      | Step 01 §10 — docs exist only as in-repo markdown                                                                                                                                                            |
| Target               | Dedicated documentation site published and live; uses MkDocs / MDBook / similar OSS tooling (specific choice is Phase 2 per Specify directional constraint); supports AI-assisted authorship and maintenance |
| Source finding(s)    | Specify Q3, Issue #3                                                                                                                                                                                         |
| Principles           | Maintainability (primary), Operations                                                                                                                                                                        |
| Dependencies         | MC-06 (API reference), MC-07 (narrative content) feed into site                                                                                                                                              |
| Phase-6 verification | Site is live, reachable, contains API reference + narrative docs                                                                                                                                             |

**MC-09 — Defender-related documentation retired or replaced.**

| Attribute            | Value                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Baseline anchor      | F-24 documentation layer: `README-DEFENDER.md`, `defender-integration.md`, Defender content in `monitoring-troubleshooting.md` |
| Target               | These documents removed or rewritten; any Defender references elsewhere cleaned up                                             |
| Source finding(s)    | F-24, coupled to MC-05                                                                                                         |
| Principles           | Maintainability                                                                                                                |
| Phase-6 verification | Docs directory grep confirms no references to Defender outside intentional historical notes                                    |

**MC-10 — README updated to reflect productization framing.**

| Attribute            | Value                                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | Current README positioned as dev-facing; F-39 reframing calls for adopter-facing framing                                                                                                     |
| Target               | README's opening ~500 words speak to Solidity developer + auditor personas explicitly; reproducibility (F-41) surfaced as a feature; `RPCDeploymentStrategy` as the production path is clear |
| Source finding(s)    | F-39, F-41                                                                                                                                                                                   |
| Principles           | Maintainability, Correctness Verification                                                                                                                                                    |
| Phase-6 verification | Practitioner + 1 external reader rate README as clear on what Diamonds is and who should use it                                                                                              |

### 4.4 Cluster D — CI & Automation

**MC-11 — GitHub Actions CI pipeline with gates on every PR and publish.**

| Attribute            | Value                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | Step 02 §2.2, §3.1 — no CI exists; 21s full-cycle budget available; F-35 positive finding                                                                   |
| Target               | CI workflow runs on PR + pre-publish; gates include all husky pre-push scans + test suite + coverage floor (from MC-14). Gate failures block merge/publish. |
| Dependencies         | MC-02 (fix silent-failure gates before porting to CI)                                                                                                       |
| Source finding(s)    | Working pillar #4, F-11, PT-03, PT-04, Issue #5                                                                                                             |
| Principles           | Operations (primary), Security, Correctness Verification                                                                                                    |
| Phase-6 verification | PR with failing test is blocked from merge; publish workflow fails if advisories present                                                                    |

**MC-12 — Publish pipeline with server-side verification and release-evidence artifact.**

| Attribute            | Value                                                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | Step 02 §2.2 — commit-to-publish is fully manual, no gates between main and npm                                                                                                                                       |
| Target               | Publishing to npm via CI-driven workflow (e.g., tag-triggered release) that re-runs gates server-side and produces a release-evidence artifact (scan results, test output, build hash) reachable by external auditors |
| Source finding(s)    | F-10, Step 02 §2.2                                                                                                                                                                                                    |
| Principles           | Correctness Verification (primary), Security, Operations                                                                                                                                                              |
| Phase-6 verification | Most recent npm publish has a corresponding release-evidence record reachable by external auditor                                                                                                                     |

**MC-13 — CHANGELOG.md exists and is maintained.**

| Attribute            | Value                                                                                                                                          |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | F-28 — no CHANGELOG exists                                                                                                                     |
| Target               | CHANGELOG.md exists with entries for every published version from this cycle forward; follows standard format (Keep a Changelog or equivalent) |
| Source finding(s)    | F-28                                                                                                                                           |
| Principles           | Maintainability, Correctness Verification                                                                                                      |
| Phase-6 verification | CHANGELOG.md exists; each version has at minimum a released date and categorized changes                                                       |

### 4.5 Cluster E — Test Quality & Coverage

**MC-14 — TypeScript code coverage measured and floor enforced.**

| Attribute            | Value                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | Step 02 §5.3 — UNMEASURED                                                                                                              |
| Target               | Coverage tooling installed (practitioner preference `nyc`); baseline coverage % MEASURED; floor defined; CI enforces floor on every PR |
| Dependencies         | MC-11 for CI enforcement                                                                                                               |
| Source finding(s)    | Working pillar #5, Step 02 §5.3                                                                                                        |
| Principles           | Scoring (primary), Maintainability, Correctness Verification                                                                           |
| Phase-6 verification | Coverage percentage exists and is measurable; PR that reduces coverage below floor is blocked                                          |

**MC-15 — The 7 misplaced integration tests are resolved.**

| Attribute            | Value                                                                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | F-36 — 7 pending tests are integration tests auto-skipping without a running Hardhat node                                                                                                                |
| Target               | Either (a) tests moved to `diamonds-dev-env` per architectural convention F-18, or (b) kept in main repo under separate script that starts a node first; result is zero `pending` in default `yarn test` |
| Source finding(s)    | F-36, F-18                                                                                                                                                                                               |
| Principles           | Maintainability, Correctness Verification                                                                                                                                                                |
| Phase-6 verification | `yarn test` in main Diamonds repo reports 0 pending                                                                                                                                                      |

**MC-16 — External-libraries functionality validated with tests.**

| Attribute            | Value                                                                       |
| -------------------- | --------------------------------------------------------------------------- |
| Baseline anchor      | Step 02 §5.1 — currently unvalidated                                        |
| Target               | Tests exist covering external-libraries use in Diamonds; tests pass         |
| Source finding(s)    | **Issue #9**                                                                |
| Principles           | Correctness Verification, Maintainability                                   |
| Phase-6 verification | Specific test suite exists, passes, covers external-libraries functionality |

**MC-17 — `deployInclude` behavior verified and documented.**

| Attribute            | Value                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | Step 02 §5.1 — behavior currently uncertain                                                                                         |
| Target               | `deployInclude` either confirmed working as override (per design intent) or documented as bug and fixed; behavior explicitly tested |
| Source finding(s)    | **Issue #10**                                                                                                                       |
| Principles           | Correctness Verification (primary), Maintainability                                                                                 |
| Phase-6 verification | Test case exists that explicitly validates `deployInclude` override semantics                                                       |

### 4.6 Cluster F — Sustainable Cadence & Hygiene

**MC-18 — Sustainable release cadence established.**

| Attribute            | Value                                                                                                                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | F-37 (burst-then-dormant, 4-month gap); F-38 (<5 hr/week ecosystem budget)                                                                                                                                                                           |
| Target               | Defined, maintainer-realistic cadence (e.g., "security patches within 30 days of advisory publication; feature releases as ready, no mandated cadence") documented as maintenance policy; actual cadence meets the definition over preceding 90 days |
| Source finding(s)    | F-37, F-38                                                                                                                                                                                                                                           |
| Principles           | Maintainability (primary), Economics, Operations                                                                                                                                                                                                     |
| Phase-6 verification | Maintenance-policy doc exists; release history over preceding 90 days is consistent with it                                                                                                                                                          |

**MC-19 — Cleanup pass: orphan tooling and stale references removed.**

| Attribute            | Value                                                                                                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Baseline anchor      | F-02, F-07, F-20, F-22, F-23, F-33                                                                                                                                                                                                                                                          |
| Target               | Gnus-dao devops scripts removed; `test-mock-verify.js` reference removed from `.npmignore`; Jest family (`jest`, `jest-mock`, `ts-jest`, `@types/jest`) removed; `tslint.json` reference removed; `contracts-starter` pinned or replaced; legacy `package.json` scripts audited and cleaned |
| Source finding(s)    | F-02, F-04, F-07, F-20, F-22, F-23, F-33                                                                                                                                                                                                                                                    |
| Principles           | Maintainability                                                                                                                                                                                                                                                                             |
| Phase-6 verification | Enumerated items each resolved                                                                                                                                                                                                                                                              |

### 4.7 Cluster G — Small Targeted Issue Fixes

**MC-20 — Linting decision implemented consistently.**

| Attribute            | Value                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Baseline anchor      | Issue #5 — practitioner's explicit question about CI/pre-commit/pre-push linting                                                     |
| Target               | Decision made (likely "yes to CI + keep in pre-commit via lint-staged"); lint runs clean on `main`; any current lint errors resolved |
| Dependencies         | MC-11 for CI side                                                                                                                    |
| Source finding(s)    | **Issue #5**                                                                                                                         |
| Principles           | Maintainability, Operations                                                                                                          |
| Phase-6 verification | `yarn lint` exits 0 on `main`; CI enforces lint                                                                                      |

### 4.8 Register Summary

| Cluster                           | MCs                               | Primary concern                          |
| --------------------------------- | --------------------------------- | ---------------------------------------- |
| A — Security & Dependency Hygiene | MC-01, MC-02, MC-03               | Security fast-close                      |
| B — Solid Base Deployment System  | MC-04, MC-05                      | Extension-point + Defender retirement    |
| C — Professional Documentation    | MC-06, MC-07, MC-08, MC-09, MC-10 | Content + site                           |
| D — CI & Automation               | MC-11, MC-12, MC-13               | Server-side gates                        |
| E — Test Quality & Coverage       | MC-14, MC-15, MC-16, MC-17        | Measurable coverage + issue-driven fixes |
| F — Sustainable Cadence & Hygiene | MC-18, MC-19                      | Maintainability for solo cycle           |
| G — Targeted Issue Fixes          | MC-20                             | Issue-driven                             |

**Total: 20 must-change outcomes.**

### 4.9 Principle Coverage Analysis

| Principle                | Primary MCs | Secondary MCs | Total appearances |
| ------------------------ | ----------- | ------------- | ----------------- |
| Maintainability          | 10          | 6             | 16                |
| Correctness Verification | 3           | 9             | 12                |
| Operations               | 4           | 5             | 9                 |
| Security                 | 2           | 4             | 6                 |
| Economics                | 0           | 3             | 3                 |
| Scoring & Metrics        | 1           | 0             | 1                 |

Maintainability weighting matches Specify Q6 highest-priority
designation. Scoring appears only as MC-14 primary — acceptable
because most scoring emerges automatically from CI (MC-11), coverage
floor (MC-14), release-evidence (MC-12) infrastructure. Scoring is
enabled by other MCs rather than being its own outcome.

### 4.10 Informal Dependency Ordering

Phase 2 will refine this into proper sequencing. Surfaced here because
scope-fit depends on whether the critical path is achievable within
maintainer-time constraints.

```
Foundation:        MC-19 (cleanup) → MC-02 (fix gates) → MC-11 (CI)
                                                          ↓
Security cadence:  MC-01, MC-03 (enabled by CI)
                                                          ↓
Content:           MC-05, MC-09 (Defender retirement) + MC-15, MC-20 (test/lint)
                                                          ↓
Capability:        MC-04 (extension points)
                   MC-06, MC-07, MC-10 (docs content)
                   MC-16, MC-17 (behavioral validation)
                   MC-14 (coverage baseline+floor)
                                                          ↓
Polish/Publish:    MC-08 (site) → MC-12 (publish pipeline) → MC-13 (CHANGELOG)
                                                          ↓
Ongoing:           MC-18 (sustainable cadence) emerges once above stabilize
```

---

## Section 5: Nice-to-Improve Backlog

Items that are real but explicitly deferred from this cycle.

**NTI-01 — Framework-agnostic restructuring (Hardhat decoupling).**
Move `hre` imports and other Hardhat-specific references out of
`BaseDeploymentStrategy` and Diamonds core into
`@diamondslab/hardhat-diamonds`. Enables Foundry-primary consumers,
runtime-service consumers (PT-02), browser consumers.

_Deferred because:_ Hardhat is dominant in the current ecosystem;
productizing within the Hardhat world is the higher-value path for
this cycle. Refactor is also more safely executed after CI + tests +
docs improvements are in place.

_Re-evaluate when:_ Non-Hardhat demand emerges, or when the ecosystem
landscape shifts (Foundry adoption growth, browser use cases become
concrete).

**NTI-02 — Bundled build output for browser / runtime consumers.**
Add a lightweight bundler (tsup, esbuild, rollup) alongside `tsc` for
consumers needing bundled output.

_Deferred because:_ complexity risk this cycle outweighs benefit given
the Dev-Env integration constraint (MK-03) and <5 hr/week time
budget.

_Re-evaluate when:_ browser use case (see NTI-05) becomes concrete, or
a consumer reports a specific pain point with ESM-only distribution.

**NTI-03 — `diamonds-safe` sibling module.**
Actual implementation of Safe Wallet multi-party-control strategy as
a separate npm package. Enabled by MC-04's extension-point
infrastructure delivered in this cycle.

_Deferred because:_ Out-of-scope for Diamonds core per MC-04's
architectural reframing; sibling modules are future ecosystem work.

_Re-evaluate when:_ MC-04's extension-point work is complete and
multi-party deployment demand is concrete.

**NTI-04 — Refine `SupportedProvider` type beyond `any`.**
`export type SupportedProvider = JsonRpcProvider | any;` works but
is deliberately loose to work around monorepo version-alignment
issues.

_Deferred because:_ Works as-is in production; refinement is cosmetic
rather than functional.

_Re-evaluate when:_ Monorepo version alignment is addressed, or a
consumer reports a type-safety issue the `any` permits.

**NTI-05 — Browser build + diamonds-monitor integration.**
Composite future target combining NTI-02 with significant
`diamonds-monitor` upgrades to enable in-browser diamond monitoring
dashboards.

_Deferred because:_ Requires coordinated work across multiple modules;
demand not yet concrete.

**NTI-06 — DiamondsLab organization website.**
Organization-wide website covering all DiamondsLab modules (Issue #2).

_Deferred because:_ Out of Diamonds-subject scope; belongs at
ecosystem level, not repo level.

**NTI-07 — Foundry Forge / Rust version of Diamonds.**
Full rewrite for Foundry consumers with Rust (Issue #4).

_Deferred because:_ Out of Specify scope (Foundry Forge is a sibling
ecosystem); major rewrite would dwarf this cycle.

---

## Section 6: Incidental Current Behaviors

Things that are true today but explicitly NOT must-keep. Phase 2 is
free to change these without needing justification.

**IC-01 — ESM-only build output.** Dual CJS/ESM or CJS-only output is
on the table if Phase 2 decides valuable (F-06).

**IC-02 — Node version floor of "whatever the DevContainer ships."**
No `engines` field currently. Establishing a specific floor is a
Phase 2 decision (F-03).

**IC-03 — Documentation location/format (in-repo `docs/` markdown).**
MC-08 may result in docs moving to a separate repo as a submodule,
different directory, or generated format.

**IC-04 — `scripts/` directory structure.**
Current `scripts/*.ts` top-level + `scripts/setup/` + `scripts/devops/`
organization. Phase 2 may reorganize freely.

**IC-05 — Specific devDependency versions.**
All devDep versions free to bump per MC-03 and standard hygiene.

**IC-06 — `diamond-abi` CLI binary name.**
Current `bin` field names this binary; Phase 2 may rename, rescope,
or replace.

**IC-07 — Test file structure under `test/unit/` and `test/integration/`.**
Phase 2 may reorganize (especially for MC-15).

**IC-08 — Specific utility module grouping in `src/utils/`.**
Module set can be refactored, split, or merged. Functionality is
functional requirement; location/grouping is incidental.

---

## Section 7: Baseline-to-Improvement Linkage Map

For Phase 6 verification. Every must-change traces to a specific
baseline row from Step 02.

| MC    | Baseline row (Step 02) | Before-picture                               | Target                                             |
| ----- | ---------------------- | -------------------------------------------- | -------------------------------------------------- |
| MC-01 | §4.2                   | 7 High/Critical + 4 Moderate in axios/lodash | 0 High/Critical, 0 Moderate                        |
| MC-02 | §4.4                   | 2 silent-failure gates                       | 0 silent-failure gates                             |
| MC-03 | §4.6 (F-31, F-33)      | No cadence, older standalone lockfile        | Defined cadence, evidence captured                 |
| MC-04 | §6.2                   | 3 strategies; no external-author validation  | Extension contract proven via prototype            |
| MC-05 | F-24 scope             | Defender across 4+ layers                    | Zero Defender references (excl. intentional notes) |
| MC-06 | §10.3                  | No generated API reference                   | API reference exists, reachable                    |
| MC-07 | F-25, F-40             | ABI-heavy docs, core concepts undocumented   | Named topics documented                            |
| MC-08 | §10                    | In-repo markdown only                        | Dedicated site live                                |
| MC-09 | F-24 doc layer         | Defender docs present                        | Defender docs removed/replaced                     |
| MC-10 | N/A (new framing)      | README dev-facing                            | README adopter-facing                              |
| MC-11 | §2.2, §3.1             | No CI; 21s cycle budget                      | CI live with gates on PR + publish                 |
| MC-12 | §2.2                   | No publish gate, no evidence                 | Publish via CI, release-evidence artifact          |
| MC-13 | F-28                   | No CHANGELOG                                 | CHANGELOG exists, maintained                       |
| MC-14 | §5.3                   | UNMEASURED                                   | MEASURED + enforced floor                          |
| MC-15 | F-36                   | 7 pending tests                              | 0 pending in default run                           |
| MC-16 | §5.1 / Issue #9        | Functionality unvalidated                    | Tests exist, pass                                  |
| MC-17 | §5.1 / Issue #10       | Behavior uncertain                           | Behavior verified, tested, documented              |
| MC-18 | F-37, F-38             | Burst-then-dormant                           | Defined cadence met over 90 days                   |
| MC-19 | F-02/07/20/22/23/33    | Orphans present                              | Orphans removed                                    |
| MC-20 | Issue #5               | Undecided, possibly unclean                  | Decision implemented, `yarn lint` clean            |

**Complete traceability: 20/20 MCs have baseline anchors.** Step 06's
Scoring & Metrics gate has the evidence it needs to evaluate whether
Phase 6 can verify improvement.

---

## Section 8: Constraint Envelope Summary

The bounding conditions within which all improvement work occurs:

| Constraint                | Source       | Hard constraint value                                 |
| ------------------------- | ------------ | ----------------------------------------------------- |
| Team size                 | Specify H-01 | 1 (solo maintainer)                                   |
| Timeline                  | Specify H-02 | Open-ended                                            |
| Budget                    | Specify H-03 | Zero — volunteer OSS                                  |
| Tooling                   | Specify H-04 | Free / OSS only                                       |
| Breaking change tolerance | Specify H-05 | Acceptable when per-item justified; v2.0 on the table |
| Certification             | Specify H-06 | None required                                         |
| Change windows            | Specify H-07 | Not relevant                                          |
| Ecosystem-time budget     | F-38         | <5 hr/week across whole ecosystem                     |
| Diamonds-specific time    | F-38-derived | Minority of the <5 hr/week                            |

**MK-06 operationalizes these constraints as a must-keep.** Phase 2
cannot produce a plan that violates this envelope.

---

## Section 9: Handoff to Step 04

Step 04 (Risk, Constraint & Technical Debt Inventory) will consume
this artifact to organize:

| Step 04 Category            | Inputs from Step 03                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Compliance constraints      | MK-08 (ERC-2535 conformance); auditor-persona requirements                                                               |
| Security risks              | MC-01, MC-02 outcomes imply Step 04 security-risk rows                                                                   |
| Hard constraints            | MK-06, MK-07 + Specify H-01..H-07 (carry forward)                                                                        |
| Project / operational risks | MC-04 (multi-party enabling) complexity; MC-08 site-tooling choice; MC-18 cadence commitment feasibility                 |
| Technical debt              | Every MC anchored to a baseline finding produces a debt row — MC-05, MC-15, MC-19 in particular are pure debt-resolution |
| Principal tensions          | PT-01 through PT-04 from Step 01 carry forward                                                                           |

Step 04 is where the **technical-debt register** becomes a
first-class catalog — with every pre-identified cleanup item ranked
by principle-weighted impact.

### 9.1 Specific Step 04 inputs

- The 20 MCs provide 20 candidate debt/risk entries
- The 7 NTIs provide 7 "deferred debt" entries that need re-evaluation triggers
- The 41 findings from Steps 01-02 provide the underlying finding pool
- The 8 GitHub issues provide externally-visible debt / request entries (most folded into MCs; some carry forward)
- Informal dependency ordering (§4.10) feeds Step 04's risk analysis of execution sequencing

---

## Section 10: Source & Evidence Register

- **Working-pillar source:** Discovery Specification (Specify step, Q1–Q6)
- **Baseline source:** Step 02 Operational & Performance Baseline, all 13 sections
- **Finding source:** Step 01 + Step 02 combined findings register (F-01 through F-42)
- **Issue-backlog source:** GitHub MCP `list_issues` on `diamondslab/diamonds`, 2026-04-20 — 10 total, 7 open
- **Practitioner testimony:** Step 03 interview (Q1 must-keep, Q2 must-change, Q3 NTI + incidental, Q4 objective + comprehensiveness)
- **Cross-repo evidence cited in Step 03:** `diamonds-dev-env` monorepo structure (MK-03), `hardhat-diamonds` as sibling (NTI-01 context), `@diamondslab/diamonds-monitor` as sibling (NTI-05 context)

### 10.1 Evidence-Basis Distribution

| Basis                                                      | Share of Step 03 claims |
| ---------------------------------------------------------- | ----------------------- |
| Prior-artifact evidence (carried forward from Steps 01-02) | ~60%                    |
| Practitioner decisions during Step 03 interview            | ~30%                    |
| GitHub issue-backlog evidence (new in Step 03)             | ~10%                    |

This step is decision-heavy, not discovery-heavy — which is its
intended shape.

---

_Part of the Phase 1 Information Gathering (Existing Projects) Tool Set_
_AI-Centric Software Development Playbook — Dogfooding on Diamonds_
_Previous artifact: Step 02 — Operational & Performance Baseline_
_Next artifact: Step 04 — Risk, Constraint & Technical Debt Inventory_
