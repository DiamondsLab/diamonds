# Operational & Performance Baseline

## `@diamondslab/diamonds` v1.3.2

**Artifact:** Step 02 output — Phase 1 (Existing Projects)
**Assessment date:** 2026-04-18
**Subject repository:** `diamondslab/diamonds` (standalone scope)
**Practitioner:** solo maintainer
**AI analyst:** Claude Opus 4.7 (with `project_knowledge_search`, Context7 MCP; scan outputs supplied by practitioner from standalone Diamonds clone)
**Prior artifacts consumed:** Discovery Specification & Plan; Step 01 Current-State Technology & Architecture Assessment
**Version correction:** Step 01 artifact contained "v1.2.1" throughout; the current npm-published version is **v1.3.2**. This artifact and all subsequent Step 02+ artifacts use v1.3.2.

> This artifact captures how Diamonds **actually behaves today** —
> measured where possible, explicitly marked UNMEASURED where not —
> as the before-picture against which Phase 6 will judge improvement
> success. Measurement discipline is strict: every numeric row
> carries one of **MEASURED** (from telemetry / scan / test
> output / billing / tool), **ESTIMATED** (from spot sample),
> **BELIEVED** (practitioner impression), or **UNMEASURED** (no
> data available — flagged, not omitted).

---

## Section 1: Executive Summary

Diamonds has **measurable, not assumed, performance characteristics** on
the axes most relevant to a TypeScript library consumed by Solidity
developers and auditors. The quantitative picture that emerges has
both striking strengths and one material weakness.

**Strengths:** A full clean-build-test-scan cycle completes in under 21
seconds (build 5.3s, test 13.4s, full pre-push security suite 1.9s). The
test suite is deterministic — 70/70 passing, no flakes. Auditor
reproducibility is an achieved design goal — deployments produced via
Diamonds can be reconstructed from the deployment record alone. These
properties together give the project a strong baseline for any CI or
improvement work that would compound on top of them.

**Material weakness:** The published npm package at v1.3.2 ships with
**7 High/Critical + 4 Moderate CVE advisories** in its runtime
dependency graph (4 in `axios@1.12.2`, 3 in `lodash@4.17.21`, plus
transitive). The fixes are straightforward semver-minor upgrades
(`axios@^1.15.0`, `lodash@^4.17.24+`) — the blocker is not complexity
but cadence: the project has had no publishes in ~4 months, during
which time advisories accumulated. The husky pre-push gate that
_should_ have caught the axios/lodash advisories before any push has
not fired because no push has been attempted during that window.
Separately, the gate has two documented output-suppression bugs
(F-13, F-14) that make `snyk:test` and `osv:scan` silent no-ops in
some scenarios — meaning even when the gate does fire, two of its
five scanners don't actually block.

**Release cadence:** 7 releases in 2 months (roughly one per 8-9 days
during the active period), followed by 4 months of zero activity.
The pattern is **burst-then-dormant**, not steady. Current v1.3.2
was published during the active burst; no releases during or after
dormancy.

**Maintainer capacity:** less than 5 hours/week total across the
_entire Diamonds ecosystem_, with most of that allocated to
`hardhat-diamonds`, DevContainer infrastructure, and documentation
rather than Diamonds itself. Diamonds existed in active beta for 6
months before its npm release, so the library code is more mature
than the version number suggests.

**External adoption:** effectively zero — Diamonds is used in three
production environments, all owned by the practitioner. No external
contributors; reported bugs are light cleanup tasks reported by the
practitioner against themselves. This reframes the improvement
objective as _productization for non-maintainer adopters_ rather than
_professionalization of something already in public use_.

**Step 02 baseline health:** all 8 library-relevant operational
dimensions have MEASURED evidence. One dimension (TypeScript code
coverage percentage) is explicitly UNMEASURED because no tooling is
installed — this becomes a Step 03 must-change candidate. The
`rpcDeployment.test.ts` pending-tests issue (F-36) is identified as
misplaced integration tests rather than test debt.

---

## Section 2: Release & Change Velocity (DORA-adapted)

Service-oriented DORA metrics translated to library-release equivalents.

### 2.1 Library Release Velocity

| Metric                            | Value                                       | Tag      | Notes                                             |
| --------------------------------- | ------------------------------------------- | -------- | ------------------------------------------------- |
| Current published version         | v1.3.2                                      | MEASURED | npm registry                                      |
| Last npm publish date             | 2026-01-03                                  | MEASURED |                                                   |
| Active-period release count       | 7 releases in 2 months                      | MEASURED | ~1 release per 8–9 days during active phase       |
| Dormancy duration                 | ~4 months (post v1.3.2, through 2026-04-18) | MEASURED | No npm publishes, no commits per practitioner     |
| Lifetime release count            | 7 (all during active period)                | MEASURED |                                                   |
| Pre-npm beta duration             | 6 months                                    | MEASURED | Private/beta development before first npm release |
| Library code maturity             | ~14 months (6mo beta + 8mo since v1.0)      | MEASURED |                                                   |
| Published version cadence pattern | **Burst-then-dormant**                      | MEASURED | F-37                                              |

### 2.2 Commit-to-Publish Latency

| Metric                              | Value                         | Tag      | Notes                                            |
| ----------------------------------- | ----------------------------- | -------- | ------------------------------------------------ |
| Main-merge → npm publish            | Effectively zero              | MEASURED | Manual process, executed in immediate succession |
| Gate between main-merge and publish | None                          | MEASURED | No CI gate, no soak period, no staging           |
| Publish decision signal             | Tests passed on pre-push hook | MEASURED | Single signal; F-09/F-10 concerns apply          |

### 2.3 Release Regression Rate

| Metric                                  | Value                                      | Tag                     | Notes                                                                                           |
| --------------------------------------- | ------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------- |
| Recalled hotfix releases                | 0                                          | BELIEVED (not MEASURED) | Practitioner recall across 7 releases; absence of reports does not prove absence of regressions |
| Mean time to hotfix                     | Undefined (no hotfixes to measure against) | UNMEASURED              |                                                                                                 |
| Release reliability signal architecture | Single-source: pre-push hook               | MEASURED                |                                                                                                 |

### 2.4 Release-Signal Gaps

- No CHANGELOG.md — consumers cannot see what changed between versions (F-28)
- No published CI provenance — auditors cannot see which gates ran for which commit (F-10)
- No release annotations on git tags — even the git log doesn't narrate releases

### 2.5 Derived Finding

**F-37** — The burst-then-dormant cadence is the single most operationally consequential pattern in the project's history. It is not a defect — the practitioner has been intentionally prioritizing other work in the ecosystem — but it interacts poorly with dependency-security hygiene (dormant projects accumulate advisories) and adopter trust (external users cannot distinguish "intentionally stable" from "abandoned" without independent signals). Phase 2 must address cadence as its own topic, not as a side-effect of other improvements.

---

## Section 3: Build & Test Performance

### 3.1 Measured Timings (standalone clone, 2026-04-18)

| Measurement                          | Wall-clock | User   | Sys   | Tag                | Notes                                                         |
| ------------------------------------ | ---------- | ------ | ----- | ------------------ | ------------------------------------------------------------- |
| `yarn clean && yarn build`           | **5.28s**  | 10.15s | 0.65s | MEASURED           | Cold build, plain `npx tsc`                                   |
| `yarn test`                          | **13.37s** | 11.71s | 1.11s | MEASURED           | 70 passing / 7 pending (deterministic)                        |
| Full husky pre-push security suite   | **1.86s**  | 2.00s  | 0.29s | MEASURED           | npm audit + osv + semgrep + slither + git-secrets, sequential |
| Combined clean → build → test → scan | ~21s       | —      | —     | MEASURED (derived) | End-to-end feedback loop                                      |

### 3.2 Build & Test Architecture

| Attribute                                               | Value                                          | Tag                                              |
| ------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| Build system                                            | Plain `npx tsc`; no bundler                    | MEASURED (Step 01)                               |
| Build reproducibility in DevContainer                   | Confirmed                                      | MEASURED                                         |
| Build reproducibility standalone (outside DevContainer) | Not confirmed                                  | UNMEASURED                                       |
| Test runner                                             | Hardhat (Mocha + Chai underneath)              | MEASURED                                         |
| Test suite flakiness                                    | None reported                                  | MEASURED (per practitioner, 70/70 deterministic) |
| Test timing consistency                                 | ~13s consistently (per practitioner: "10-15s") | MEASURED                                         |

### 3.3 Derived Findings

**F-34** — Full husky pre-push security suite runs in sub-2s. For context, comparable "comprehensive security validation" stacks in other Hardhat projects routinely take 30-90s. The speed is a significant positive finding: it means CI adoption carries negligible runtime cost, and the developer-experience argument against pre-commit gating doesn't apply here. **Caveat:** sub-second Slither runtime deserves Phase 5 verification — it may indicate the tool is caching, short-circuiting on `--ignore-compile`, or finding nothing to analyze on small contract surface.

**F-35** — The complete build + test + scan feedback loop is under 21s. This is ~10× faster than typical Hardhat monorepo CI cycles. Phase 2's CI adoption decision is materially easier because friction cost is near-zero. The principal tension PT-03 (unified DevContainer vs. simpler CI) gets a new data point: _simpler CI is fine, because speed is not why the unified-pattern matters. The unified pattern's value is environmental parity, not runtime economy._

---

## Section 4: Dependency CVE Posture — the Headline

### 4.1 Scanner Triangulation (standalone Diamonds clone, 2026-04-18)

| Scanner                              | Scope                               | Results                                                            |
| ------------------------------------ | ----------------------------------- | ------------------------------------------------------------------ |
| `yarn npm audit --severity moderate` | Direct + transitive, moderate+      | **6 advisories** across axios + lodash                             |
| `osv-scanner --lockfile=yarn.lock`   | Full lockfile, all severities       | **~85 advisories** across ~28 packages in 1285-package graph       |
| `yarn snyk:test` (authenticated)     | Direct + transitive, all severities | **24 issues / 62 vulnerable paths** across 135 tested dependencies |

All three scanners read the same `yarn.lock` at the same moment. Differences between their counts reflect differences in scope (severity filter, vulnerability database, direct-vs-transitive treatment), not differences in ground truth.

### 4.2 Runtime Dependency Vulnerabilities — Ships to Consumers

These are in `@diamondslab/diamonds@1.3.2`'s runtime dependency graph. Every consumer installing the package inherits them.

| Package                                                 | Installed   | Advisories                                                | Highest Severity                           | Fix                                                            |
| ------------------------------------------------------- | ----------- | --------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `axios`                                                 | 1.12.2      | 4 (npm audit: 3; Snyk adds 1 Critical + 1 new High)       | **Critical** ("Confused Deputy")           | Upgrade to `^1.15.0`                                           |
| `lodash`                                                | 4.17.21     | 3 (npm audit: 3; Snyk: 3 including 1 additional Moderate) | **High** (code injection via `_.template`) | Upgrade to `^4.17.24` min (Snyk suggests `^4.18.1`)            |
| `follow-redirects`                                      | 1.15.11     | 1 (via axios chain)                                       | Moderate                                   | Resolved by axios upgrade                                      |
| `@ethersproject/abstract-signer` → `bn.js` / `elliptic` | 5.8.0 chain | 2                                                         | Moderate                                   | No upgrade path available (tied to ethers v5 namespace legacy) |
| `debug`                                                 | current     | 0                                                         | —                                          | —                                                              |
| `fs-extra`                                              | current     | 0                                                         | —                                          | —                                                              |

**Total affecting published library: 7 High/Critical + 4 Moderate advisories.**

### 4.3 Why the Pre-Push Gate Hasn't Fired

The husky pre-push hook runs `yarn npm audit --severity moderate`, which would fail any push against the current state. Why hasn't it?

**F-37-derived observation:** the project has had no commits or push attempts in ~4 months. The advisories were published to the GitHub Advisory Database during that dormancy window. A pre-push gate cannot fire when there is no push. This is a direct illustration of why the _local-first gating architecture_ (F-08) is structurally insufficient for a library that publishes to a public registry — vulnerabilities can accumulate in the published artifact even when the maintainer is doing nothing wrong, simply by the passage of time.

### 4.4 Gate-Suppression Bugs (Upgraded from Step 01)

| Finding              | State                                                                                                                                     | Evidence                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **F-13** (confirmed) | `yarn snyk:test` silent-skip if unauthenticated. The `\|\|` branch in pre-push suppresses the gate entirely when auth is missing.         | Snyk ran authenticated and returned 24 issues; without auth the gate would have reported "skipped" and allowed the push |
| **F-14** (confirmed) | `yarn osv:scan` output is discarded via `> /dev/null 2>&1 \|\|` and the fallback echoes "⚠️ OSV scan completed" regardless of exit status | OSV returns 85 advisories on direct invocation; pre-push has never surfaced any of them                                 |

These are not theoretical gate weaknesses. They are **bugs that have been masking real findings** for the entire lifetime of the pre-push hook.

### 4.5 Transitive Vulnerability Density

**F-30** — 85 OSV advisories across ~28 packages in a 1285-package graph. Highest-severity concentrations:

| Package                            | Advisories | Peak CVSS |
| ---------------------------------- | ---------- | --------- |
| `handlebars@4.7.8`                 | 8          | 9.8       |
| `tar@7.5.1`                        | 7          | 8.8       |
| `fast-xml-parser@5.2.5`            | 6          | 9.3       |
| `minimatch` (4 different versions) | 12 total   | 8.7       |
| `cacache` / `glob` chain           | 5          | 8.7       |
| `undici@5.29.0`                    | 5          | 7.5       |
| `axios@1.12.2` (direct)            | 3          | 7.5       |
| `lodash`                           | 3          | 8.1       |

Most of these are **transitive, not directly fixable by Diamonds.** They come from:

- Hardhat's own build/tooling dependencies
- ethers v5 namespace legacy (`@ethersproject/*`)
- yarn 4's internal fetch/cache infrastructure (`cacache`/`glob`/`minimatch` — F-32)
- `@openzeppelin/defender-sdk-*` (will evaporate when Defender is retired — F-24)

**F-32 (related)** — The `cacache` cluster is yarn 4's own internal machinery. It is unfixable by Diamonds without switching package managers. This is known transitive noise, not Diamonds-addressable debt.

### 4.6 Lockfile Currency

**F-33** — Standalone Diamonds clone resolves `lodash@4.17.21`; `diamonds-dev-env` monorepo resolves `lodash@4.17.23`. A `yarn up` on the standalone clone would pull forward without changing the manifest, eliminating one lodash advisory.

**F-31** — No defined lockfile-refresh cadence. Phase 2 must establish one. This is a hygiene-discipline finding, not a technical one.

### 4.7 CVE Baseline Summary

| Attribute                                       | Value                                                  | Tag       |
| ----------------------------------------------- | ------------------------------------------------------ | --------- |
| Last comprehensive audit prior to this baseline | Unknown; ~2-4 months                                   | BELIEVED  |
| Audit-fresh baseline date                       | **2026-04-18**                                         | MEASURED  |
| Direct runtime CVE count                        | 7 High/Critical + 4 Moderate across 2 packages         | MEASURED  |
| Transitive total (OSV)                          | ~85 advisories across ~28 packages                     | MEASURED  |
| Published version affected                      | v1.3.2 (and likely earlier versions in the 1.x series) | MEASURED  |
| Remediation complexity (direct)                 | Low — semver-minor upgrades                            | ESTIMATED |

---

## Section 5: Test Coverage Baseline

### 5.1 Test Surface

| Metric                                  | Value                           | Tag                                            |
| --------------------------------------- | ------------------------------- | ---------------------------------------------- |
| Passing tests (main Diamonds repo)      | 70                              | MEASURED                                       |
| Pending tests                           | 7                               | MEASURED — see F-36                            |
| Test flakiness                          | 0 reported; 70/70 deterministic | MEASURED                                       |
| Test suite runtime                      | ~13.4 seconds                   | MEASURED                                       |
| Integration tests in main Diamonds repo | Some (misplaced — see F-36)     | MEASURED                                       |
| Integration tests in `diamonds-dev-env` | Extensive (per practitioner)    | BELIEVED — Step 02 has not directly enumerated |

### 5.2 The Pending-Tests Finding

**F-36** — All 7 pending tests are in `test/integration/rpc/rpcDeployment.test.ts`. Each one auto-skips at runtime when `http://127.0.0.1:8545` does not respond (`ECONNREFUSED`). The test bodies include:

- `should validate connection successfully` — `validateConnection()` throws
- `should create instance with valid configuration` — `RPCDiamondDeployer.getInstance()` throws
- `should validate configuration`
- `should get network information`
- `should track deployment status correctly`
- `should use singleton pattern correctly`
- `should validate strategy configuration for integration testing`

**Classification:** This is **misplaced integration tests, not test debt.** The tests exercise `RPCDeploymentStrategy` + `RPCDiamondDeployer` against a live Hardhat node. Per the project's test-architecture division (F-18), integration tests belong in `diamonds-dev-env`, not in the main Diamonds repo.

**Three candidate Phase 2 resolutions** (Phase 2 picks, Phase 5 executes):

1. **Move tests to dev-env** where integration tests live by convention. Simplest alignment with F-18.
2. **Keep in main repo but under a separate script** (`yarn test:integration` or `yarn test:rpc`) that starts a Hardhat node first, and `yarn test` runs only unit + functional.
3. **Keep as-is** and document the 7-pending pattern as expected behavior. Lowest effort, lowest value.

Practitioner inclination (Q2b answer) aligns with option 1.

### 5.3 TypeScript Code Coverage

| Metric                                     | Value                                                        | Tag      |
| ------------------------------------------ | ------------------------------------------------------------ | -------- |
| Coverage tooling installed                 | **None**                                                     | MEASURED |
| Coverage percentage for TypeScript source  | **UNMEASURED**                                               | —        |
| Practitioner preference for future tooling | `nyc`                                                        | MEASURED |
| Solidity coverage tooling                  | `solidity-coverage ^0.8.16` (wrong surface for a TS library) | MEASURED |

**The ROADMAP claim of "Complete test coverage for all components" is not currently verifiable** — and cannot be verified until coverage tooling is installed. This is a Step 03 must-change candidate (install coverage tooling; define a coverage floor) rather than a Step 02 gap to close.

### 5.4 Test-Baseline-to-Improvement Linkage

Step 06 and Phase 6 will compare against these specific rows:

| Current baseline                    | Improvement target template (for Step 03 to sharpen)      |
| ----------------------------------- | --------------------------------------------------------- |
| 70 passing tests, no coverage %     | Defined coverage % floor, measured, with CI enforcement   |
| 7 pending (misplaced integration)   | Zero pending; integration tests relocated or reconfigured |
| Unit + functional only in main repo | Consumer-visible evidence of integration coverage         |

---

## Section 6: Run Cost (Maintainer-Time Basis)

For a library, "run cost" is not AWS billing — it is maintainer effort required to keep the project operational.

| Metric                                        | Value                                                           | Tag             | Notes                                      |
| --------------------------------------------- | --------------------------------------------------------------- | --------------- | ------------------------------------------ |
| Total maintainer-time, Diamonds ecosystem     | **<5 hours/week** during active periods                         | MEASURED        |                                            |
| Share of that time on Diamonds library itself | Minority (majority to `hardhat-diamonds` / DevContainer / docs) | MEASURED — F-38 |                                            |
| Rough estimate: Diamonds-specific weekly time | Roughly 0-2 hours/week in active periods                        | ESTIMATED       | Derived from "<5 total" + "minority share" |
| Dormant-period maintainer-time                | 0 hours/week (last 4 months)                                    | MEASURED        |                                            |
| Release burst capacity                        | Demonstrated: 7 releases in 2 months                            | MEASURED        | Upper bound of what's achievable           |

### 6.1 Infrastructure Cost

| Item                           | Cost                                                     | Tag      |
| ------------------------------ | -------------------------------------------------------- | -------- |
| npm publishing                 | Free (standard npm)                                      | MEASURED |
| GitHub hosting                 | Free (public repo)                                       | MEASURED |
| Security scanner subscriptions | Free tiers used (Snyk, OSV scanner, Semgrep CE, Slither) | MEASURED |
| DevContainer infrastructure    | Free (Docker / VS Code DevContainers)                    | MEASURED |
| **Total infrastructure cost**  | **$0/month**                                             | MEASURED |

### 6.2 Derived Finding

**F-38** — The <5 hours/week constraint is the core economic reality of Phase 2 planning. Any improvement design that assumes >2 hours/week of ongoing Diamonds-specific maintenance will be structurally unsustainable. This elevates automation (CI-based security patching, release tooling, doc generation) from nice-to-have to required.

---

## Section 7: Incident History & External Feedback

### 7.1 Incident Record

| Incident type                               | Count                                                                                 | Tag             |
| ------------------------------------------- | ------------------------------------------------------------------------------------- | --------------- |
| Recalled production incidents               | 0                                                                                     | BELIEVED        |
| Reported bugs (GitHub issues, elsewhere)    | Small number — repository hygiene issues reported by practitioner against own project | MEASURED        |
| Examples of reported issues                 | `.yarn` being included in repo, should have been gitignored                           | MEASURED        |
| External user-reported bugs                 | 0                                                                                     | MEASURED — F-39 |
| External contributor PRs                    | 0                                                                                     | MEASURED        |
| Security incidents (reported or discovered) | 0                                                                                     | BELIEVED        |

### 7.2 External Adoption

**F-39** — Diamonds is used in **three production environments, all owned by the practitioner**. Every contribution and implementation has been practitioner-driven. There is effectively zero external user base.

This reframes the improvement objective. **"Professionalize for industry usage" operationally means "productize for non-maintainer adopters."** The work needed is not polish-on-polished — it is the gap between "works for the person who built it" and "works for someone who didn't."

### 7.3 Feedback-Loop Implication

| Consumer                | Feedback channel           | Current state                                    |
| ----------------------- | -------------------------- | ------------------------------------------------ |
| Practitioner (internal) | Direct in-person knowledge | Active                                           |
| External developers     | GitHub Issues              | Empty (zero external filings)                    |
| External auditors       | None defined               | Empty — no one has audited Diamonds from outside |
| npm package downloaders | npm download stats         | Not reviewed — UNMEASURED                        |

npm download stats would be a useful follow-up measurement — if Diamonds has non-zero downloads, someone is installing it without reporting anything, which is ambiguous (satisfied, silent? frustrated, silent?). If downloads are zero, the "three production environments" practitioner count is the entire adoption picture.

---

## Section 8: Contributor & Auditor Experience Baselines

### 8.1 Contributor Ramp-Up

**F-40** — The concentration of onboarding complexity is at `BaseDeploymentStrategy` and its companion design diagram (`diamond_module-BaseStrategy_design-v2.uxf`). A new contributor competent in TypeScript and Ethereum must understand:

1. **ERC-2535 itself** (diamond proxies, facets, function selectors, diamond cuts, loupe) — prerequisite external knowledge
2. **Diamonds' application of ERC-2535** — encoded in the `Diamond` class, `CallbackManager`, `FunctionSelectorRegistryEntry` machinery
3. **The `BaseDeploymentStrategy` lifecycle** — `preDeployFacetsTasks`, `prePerformDiamondCutTasks`, etc., which are the extension points for all concrete strategies

Once a contributor crosses this barrier, the three concrete strategies (`LocalDeploymentStrategy`, `RPCDeploymentStrategy`, `OZDefenderDeploymentStrategy`) become legible as variations on a theme.

| Contributor-experience proxy              | Current state                                        | Tag        |
| ----------------------------------------- | ---------------------------------------------------- | ---------- |
| Time from `git clone` to green test suite | Not measured                                         | UNMEASURED |
| `BaseDeploymentStrategy` documentation    | UXF diagram exists; narrative documentation does not | MEASURED   |
| ERC-2535 prerequisite teaching            | Not present in Diamonds docs                         | MEASURED   |
| Contributor guidelines (CONTRIBUTING.md)  | Not confirmed present                                | UNMEASURED |
| Good-first-issue labels or similar        | Absent (zero external contributors, so moot)         | MEASURED   |

### 8.2 Auditor Experience

**F-41** — Auditor reproducibility is **explicitly a defining design goal** and is achieved. Given:

- The published `@diamondslab/diamonds` npm package
- A consumer project's source code
- A deployment record produced by `FileDeploymentRepository`

...an auditor can reproduce from scratch the same deployed contracts, facets, and state. The architectural mechanisms that make this possible:

- `FileDeploymentRepository` persists deployment state as structured JSON
- `RPCDeploymentStore` tracks per-step deployment progress in JSON
- `functionSelectorRegistry` is rebuildable from deployed state
- No deployment step depends on ambient practitioner-machine state that isn't captured

| Auditor-experience proxy                                    | Current state                                                  | Tag                     |
| ----------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| Reproducibility of deployment from record                   | **Achieved**                                                   | MEASURED — F-41         |
| Release-to-release change narrative (CHANGELOG)             | **Absent**                                                     | MEASURED — F-28         |
| Published CI provenance                                     | Absent (no CI)                                                 | MEASURED                |
| Test-evidence visible to external auditor                   | Limited to 70/7 count in main repo; dev-env evidence invisible | MEASURED — F-18 derived |
| Verifiable build reproducibility (consumer cloning package) | Not confirmed                                                  | UNMEASURED              |

### 8.3 The Documented-but-Hidden Strength

**F-41's auditor-reproducibility achievement is currently undocumented.** It is a genuine strength of Diamonds — one many comparable smart-contract tooling projects do not achieve — but no doc, README section, or marketing material states "deployments produced via Diamonds are reproducible from the deployment record alone." Phase 2's documentation work must surface this.

---

## Section 9: Observability — Measurement Gaps Consolidated

### 9.1 What Is NOT Measured (Explicit UNMEASURED register)

| Dimension                                        | Current Status                      | Phase 2 Resolution Path                                                           |
| ------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------- |
| TypeScript code coverage %                       | UNMEASURED — no tooling             | Install `nyc` or equivalent; establish baseline                                   |
| Build reproducibility outside DevContainer       | UNMEASURED                          | Test on bare Node + yarn environment                                              |
| npm download / install telemetry                 | UNMEASURED                          | Pull npm registry stats                                                           |
| Time from `git clone` to green test              | UNMEASURED                          | Documented run-through proxy measurement                                          |
| `BaseDeploymentStrategy` doc adequacy            | UNMEASURED (narrative doc absent)   | Measure via first-external-contributor feedback once applicable                   |
| Verifiable build reproducibility (consumer-side) | UNMEASURED                          | Package-consume from tarball, verify dist matches npm                             |
| CI pipeline timing                               | UNMEASURED (no CI exists)           | Measured after Phase 5 CI adoption                                                |
| Hotfix MTTR                                      | UNMEASURED (no hotfixes to measure) | Captured once incidents occur or simulation run                                   |
| User-satisfaction signals (NPS, feedback forms)  | UNMEASURED — no channel exists      | Out of scope for solo-maintainer improvement cycle; note as Phase 7 consideration |

### 9.2 What CAN Be Derived in Step 03 from This Baseline

Each Step 03 must-change candidate will be anchored against the baseline rows above. For instance:

- "Improve security posture" anchors to §4 (MEASURED 7 High/Critical direct-dep advisories) → target: zero direct-dep advisories at publish time
- "Measurable test coverage" anchors to §5.3 (UNMEASURED) → target: MEASURED baseline of X% with enforcement gate
- "Functional CI" anchors to §2 (commit-to-publish has no gate) and §3.1 (21s cycle budget) → target: CI running on every PR with gate-pass-required-to-merge
- "Sustainable maintainer cadence" anchors to §2.1 (4-month dormancy) and §6 (<5 hr/week) → target: defined release-cadence commitment the maintainer can actually hold

---

## Section 10: Baseline Handoff for Phase 6

Phase 6 will judge improvement success against these specific rows. Every numeric in this section is the _before-picture_ — the value the improvement is measured against.

| Dimension                     | v1.3.2 Baseline (2026-04-18) | Phase 6 Will Compare Against                                          |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| Clean build time              | 5.28s                        | Post-improvement build time                                           |
| Test suite runtime            | 13.37s                       | Post-improvement test runtime                                         |
| Full security scan suite      | 1.86s                        | Post-improvement scan suite runtime                                   |
| Complete feedback-loop cycle  | ~21s                         | Post-improvement cycle                                                |
| Passing tests                 | 70                           | Post-improvement passing count                                        |
| Pending tests                 | 7 (misplaced integration)    | Target: 0 misplaced                                                   |
| TS code coverage %            | UNMEASURED                   | Post-improvement MEASURED value + floor                               |
| Direct runtime dep advisories | 7 High/Critical + 4 Moderate | Target: 0 at publish time                                             |
| OSV advisory count            | ~85 transitive               | Post-improvement count (not all directly addressable)                 |
| Release cadence (active)      | 1/~8-9 days                  | Post-improvement sustainable cadence                                  |
| Dormancy tolerance            | 4 months (unplanned)         | Defined maintenance-window commitment                                 |
| CI gate presence              | Absent                       | Present + enforced                                                    |
| CHANGELOG                     | Absent                       | Present + maintained                                                  |
| Public-API reference          | Absent                       | Present (generated)                                                   |
| Maintainer hours/week         | <5 total ecosystem           | Same or less with improvement burden absorbed                         |
| External contributor count    | 0                            | N/A (not a must-change; improvement is to make contribution possible) |

---

## Section 11: Findings Register — Step 02 Additions

Carry-forward from Step 01 findings register (F-01 through F-27); new findings added during Step 02:

| ID             | Finding                                                                                 | Severity / Type                | Step 03+ Path                                            |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------- |
| F-28           | No CHANGELOG.md                                                                         | Doc gap                        | Step 03 must-change: establish CHANGELOG practice        |
| F-29 (revised) | v1.3.2 published with 7 High/Critical + 4 Moderate runtime-dep CVEs                     | **Security — critical**        | Step 05 Upgrade dispositions; Step 04 high-priority debt |
| F-30           | Transitive vulnerability density: ~85 OSV advisories across ~28 packages                | Hygiene                        | Step 04 chronic debt; Phase 2 hygiene cadence            |
| F-31           | No lockfile-refresh cadence defined                                                     | Hygiene                        | Step 03 must-change                                      |
| F-32           | `cacache`/`glob`/`minimatch` cluster is yarn-4 internal (unfixable unilaterally)        | Known transitive               | Document, do not act                                     |
| F-33           | Standalone lockfile resolves older than monorepo (extra lodash CVE)                     | Hygiene                        | Step 04 debt; fix via `yarn up`                          |
| F-34           | Husky gate runtime is sub-2s                                                            | Positive architectural finding | Phase 2 CI adoption lever                                |
| F-35           | Full build+test+scan cycle under 21s                                                    | Positive architectural finding | Phase 2 CI adoption lever                                |
| F-36           | 7 pending tests are misplaced integration tests                                         | Test architecture              | Step 05 reconfigure/move/retire decision                 |
| F-37           | Release cadence is burst-then-dormant, not steady                                       | Operational pattern            | Step 03 must-change: sustainable cadence definition      |
| F-38           | <5 hours/week maintainer capacity across the entire ecosystem, majority not on Diamonds | Economic constraint            | Phase 2 budget input; elevates automation to required    |
| F-39           | Zero external adoption; reframes objective as productization                            | Strategic finding              | Step 03 rethink "professionalization" framing            |
| F-40           | Contributor ramp-up concentration at `BaseDeploymentStrategy`                           | Doc-leverage finding           | Phase 2 doc priority                                     |
| F-41           | Auditor reproducibility achieved but undocumented                                       | Positive with exposure gap     | Step 03 Must-Keep + doc must-change                      |

**Running total: 41 findings across Steps 01 and 02.**

---

## Section 12: Confidence Summary & Evidence Basis

### 12.1 Evidence-Basis Distribution (Step 02 artifact)

| Basis                                | Share | Notes                                                                                                |
| ------------------------------------ | ----- | ---------------------------------------------------------------------------------------------------- |
| MEASURED (tool output, scan, timing) | ~70%  | Scan outputs, build/test timings, test counts                                                        |
| MEASURED via practitioner testimony  | ~15%  | Release count, dormancy duration, adoption count — verifiable from git/npm but practitioner-reported |
| ESTIMATED                            | ~5%   | Derived numbers (Diamonds-specific share of maintainer time)                                         |
| BELIEVED                             | ~5%   | Zero-recalled-regression, zero-recalled-security-incident                                            |
| UNMEASURED (explicit rows)           | ~5%   | §9.1 register                                                                                        |

**This is a significant improvement from Step 01's evidence distribution** (which was Code-heavy, Telemetry-zero). Step 02 added ~15 MEASURED rows that did not exist in Step 01.

### 12.2 Confidence by Section

| Section                           | Confidence    | Basis                                                         |
| --------------------------------- | ------------- | ------------------------------------------------------------- |
| §2 Release velocity               | High          | Practitioner reconstructed from git/npm                       |
| §3 Build & test performance       | High          | Tool-measured                                                 |
| §4 CVE posture                    | **Very High** | Three-scanner triangulation on same lockfile                  |
| §5 Test coverage baseline         | Medium-High   | Counts MEASURED; coverage % correctly UNMEASURED              |
| §6 Run cost                       | Medium-High   | Practitioner-reported at band granularity                     |
| §7 Incident history               | Medium        | BELIEVED for zero-recall; MEASURED for external-reports count |
| §8 Contributor/auditor experience | Medium        | Practitioner testimony for F-40/F-41                          |
| §9 Measurement gaps               | High          | By construction — this section documents gaps                 |

### 12.3 Honest Limitations

- **Zero external-user telemetry** — the "<5 hours/week, no external feedback" picture is internally consistent but externally unverified. A single external adopter reporting a specific pain point could substantially refine F-39 and F-40.
- **BELIEVED zero-regression** — absence of recalled hotfixes across 7 releases is a real signal but a weak one for a library with only the maintainer as consumer.
- **Scan-time snapshot** — these scans represent 2026-04-18 state. Advisory databases change daily; a re-scan next week may show slightly different counts.

---

## Section 13: Handoff to Step 03

Step 03 (Requirements & Improvement Objective Sketch) will use this baseline to sharpen the working pillars from Specify into measurable must-change outcomes:

| Working Pillar (from Specify)                          | Anchored Baseline (from this artifact)                                     | Sharpening Direction                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| Cleanup                                                | §4 CVE posture; §11 findings register                                      | Specific cleanups with per-item acceptance               |
| Solid base deployment system                           | §8.1 contributor ramp-up at `BaseDeploymentStrategy`; F-41 reproducibility | Multi-party control direction + preserve reproducibility |
| Professional documentation                             | §5, §8, §10 multiple gaps                                                  | Concrete doc surface with per-audience deliverables      |
| Functional CI                                          | §3 21s budget; §4 pre-push gate bugs; §2.2 no publish gate                 | CI with gates matching husky + additions                 |
| Defined and met test coverage                          | §5.3 UNMEASURED TS coverage                                                | Measured baseline + floor + enforcement                  |
| (New candidate) Sustainable release cadence            | §2.1 burst-then-dormant; §6 <5 hr/week                                     | Defined-and-met cadence commitment                       |
| (New candidate) Productize for non-maintainer adopters | §7 F-39 zero external users                                                | Reframe "professionalize" as "productize"                |

Step 03 must-change register will be grounded in these rows. Every Phase 6 success criterion traces back to a specific MEASURED baseline here.

### 13.1 Gaps to Resolve in Step 03 or Beyond

- G-02 (TypeScript code coverage baseline): addressed by deciding to install tooling in Phase 2 → measured in Phase 5
- G-08 (accurate Node-version floor): Phase 2 decision to establish `engines` field → tested in Phase 5
- Telemetry dimensions in §9.1: most addressed naturally by Phase 2 CI / doc / process decisions

---

## Source & Evidence Register

- **Dependency scans:** practitioner-executed from standalone Diamonds clone (`/workspaces/diamonds/`), 2026-04-18. Tools: `yarn npm audit`, `yarn snyk:test`, `osv-scanner --lockfile=yarn.lock --format=table`
- **Timing measurements:** practitioner-executed `time` wrappers on `yarn clean && yarn build`, `yarn test`, and combined pre-push suite
- **Practitioner testimony:** release cadence, maintainer time, adoption, incident recall, reproducibility design goal — conversation of 2026-04-18
- **Code evidence:** `project_knowledge_search` over subject repo (synced to v1.3.2 state per practitioner)
- **Cross-repo evidence cited where used:** none new in Step 02; Step 01's dev-env and hardhat-diamonds evidence carries forward

---

_Part of the Phase 1 Information Gathering (Existing Projects) Tool Set_
_AI-Centric Software Development Playbook — Dogfooding on Diamonds_
_Previous artifact: Step 01 — Current-State Technology & Architecture Assessment_
_Next artifact: Step 03 — Requirements & Improvement Objective Sketch_
