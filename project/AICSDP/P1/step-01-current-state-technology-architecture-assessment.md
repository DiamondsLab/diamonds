# Current-State Technology & Architecture Assessment

## `@diamondslab/diamonds` v1.2.1

**Artifact:** Step 01 output — Phase 1 (Existing Projects)
**Assessment date:** 2026-04-18
**Subject repository:** `diamondslab/diamonds` (main)
**Evidence repositories (referenced, not subject):** `diamondslab/hardhat-diamonds`, `diamondslab/diamonds-dev-env`, `Diamonds-DevContainer` submodule
**Practitioner:** solo maintainer
**AI analyst:** Claude Opus 4.7 (with `project_knowledge_search`, `web_search`, Context7 MCP)
**Knowledge-base state:** synced to npm-published v1.2.1 state as of January 3, 2026
**Prior artifacts consumed:** Discovery Specification & Discovery Plan (Phase 1 Specify-step outputs)

> This artifact captures what the Diamonds system **is today** — as
> observed in the code, configuration, and practitioner testimony —
> before any improvement planning. It is the foundation on which
> Steps 02 through 06 build. Every claim carries a three-timeframes
> tag (**OBS** = Observed / **DOC** = Documented Intent / **DES** =
> Desired Future) and an evidence-basis tag (**C** = Code, **CFG** =
> Config, **T** = Telemetry/Test, **D** = Documentation, **P** =
> Practitioner, **I** = Inferred).

---

## Section 1: Executive Summary

`@diamondslab/diamonds` is a published npm package and TypeScript
library implementing tooling for ERC-2535 Diamond Proxy deployment,
upgrade, and management in Ethereum smart-contract projects. It is
positioned as a Hardhat-integrated deployment toolkit and is consumed
in production by at least one professional project (the practitioner's
own). The library is currently at version 1.2.1, last published to
npm on 2026-01-03.

The current state shows **a modern stack, a working production path,
sophisticated but local-only quality gating, and substantial
accumulated tooling debt**. Runtime dependencies are unusually lean
(5 packages), reflecting an explicit dev-time-tool framing that is
an open architectural question for the improvement cycle. Security
gating is comprehensive in principle (npm audit, Snyk, OSV, Semgrep,
Slither, git-secrets) but runs exclusively via husky hooks at the
maintainer's machine, with no CI-based verification that gates
actually ran. Test coverage is measured at 70 passing + 7 pending for
the main repo, with **no TypeScript coverage measurement tooling
installed** — a claim of "complete test coverage" in the ROADMAP is
not presently verifiable.

Three deployment strategies exist in the library: `LocalDeploymentStrategy`
(Hardhat local), `RPCDeploymentStrategy` (direct RPC, **production-current**),
and `OZDefenderDeploymentStrategy` (never completed, OpenZeppelin Defender
is itself being deprecated by its vendor). The Defender footprint is
distributed across source code, package scripts, dependencies, and
documentation, making its retirement a coordinated cleanup rather than
a surgical removal.

Documentation exists as 11 hand-written markdown files plus 2 UMLet
design diagrams. **No generated API reference exists**, and doc coverage
is inverted relative to library importance — 5 of 11 docs cover the
ABI Generator while core deployment classes have no dedicated documentation.
The practitioner's honest assessment is that all documentation needs
cleanup and expansion.

The principal tension of this assessment is between **professional-grade
industry positioning** (the stated improvement objective) and **solo-maintainer
OSS sustainability** (the hard constraint profile). Two secondary tensions
surface: a dev-time-tool framing that constrains runtime-consumer scenarios,
and a DevContainer-as-CI-substrate architectural intent that has been
attempted across the ecosystem but never shipped.

**Phase 2 readiness posture:** sufficient evidence has been gathered to
support Phase 2 improvement planning. Gaps around measured baselines
(test coverage, build time, dependency CVE counts) are Step 02
responsibilities and are explicitly enumerated. No FAIL-class gaps on
current-state architecture understanding.

---

## Section 2: System Context

### 2.1 What Diamonds Is

`@diamondslab/diamonds` is a TypeScript library providing orchestration
for deployment and management of ERC-2535 Diamond Proxy smart contracts.
It is consumed by implementing projects as either:

- A **Hardhat plugin integration target** via `@diamondslab/hardhat-diamonds`
  (a separate, peer npm package maintained by the same practitioner)
- A **direct library consumer** — projects import `Diamond`,
  `DiamondDeployer`, and a chosen deployment strategy programmatically
- A **CLI surface** — the package ships a `diamond-abi` CLI binary
  (`dist/scripts/diamond-abi-cli.js`)

### 2.2 Boundary of This Assessment

Per Phase 1 Specify step (locked, Option C):

| Repository                        | Role                            | In Scope For Improvements?     | Evidence Source?    |
| --------------------------------- | ------------------------------- | ------------------------------ | ------------------- |
| `diamondslab/diamonds` (this)     | **Subject**                     | Yes — dispositions, debt, plan | Primary             |
| `diamondslab/hardhat-diamonds`    | Integration peer                | No                             | Yes — evidence only |
| `diamondslab/diamonds-dev-env`    | Monorepo evidence source        | No                             | Yes — evidence only |
| `Diamonds-DevContainer` submodule | Constraint-bearing peer         | No                             | Referenced by name  |
| Foundry Forge sibling plugin      | Out of ecosystem for this cycle | No                             | No                  |

### 2.3 Primary Personas

Per Specify step:

1. **Solidity Developers** on greenfield projects, end-to-end through
   production deployment
2. **Auditors** reviewing diamond-based projects, requiring state
   transparency and reproducibility

Secondary: framework-level adopters (satisfied by clean public API +
documentation, not by bespoke features).

### 2.4 Improvement Objective (Working)

Per Specify step, to be sharpened in Step 03. Working pillars:
cleanup, solid base deployment system (multi-party control direction),
professional documentation (site + API reference), functional CI,
defined and met test coverage.

---

## Section 3: Repository & Codebase Inventory

### 3.1 Repository Shape

| Attribute            | Value                                                    | Tag     |
| -------------------- | -------------------------------------------------------- | ------- |
| Host                 | GitHub, `diamondslab/diamonds`                           | OBS/C   |
| Protection branches  | `main`, `develop` (referenced in husky hooks)            | OBS/CFG |
| `.github/` directory | **Absent**                                               | OBS/C   |
| Git submodules       | `Diamonds-DevContainer` (intended as reusable substrate) | OBS/P   |
| Published artifact   | `@diamondslab/diamonds` on npm, v1.2.1                   | OBS/CFG |
| Last npm publish     | 2026-01-03                                               | OBS/P   |
| License              | MIT                                                      | OBS/CFG |

### 3.2 Source Tree (Main Diamonds Repo)

```
diamonds/
├── src/
│   ├── core/            Diamond, DiamondDeployer, DeploymentManager, CallbackManager
│   ├── strategies/      BaseDeploymentStrategy, LocalDeploymentStrategy,
│                         RPCDeploymentStrategy, OZDefenderDeploymentStrategy,
│                         DeploymentStrategy (interface)
│   ├── repositories/    DeploymentRepository, FileDeploymentRepository, jsonFileHandler
│   ├── schemas/         DeploymentSchema (Zod-based)
│   ├── types/           TypeScript type definitions
│   └── utils/           ~14 modules including diamondAbiGenerator, configurationResolver,
│                         workspaceSetup, signer, txlogging, loupe, diffDeployedFacets,
│                         defenderStore, defenderClients, contractMapping, rpcStore,
│                         common
├── scripts/
│   ├── deploy-rpc.ts, upgrade-rpc.ts, status-rpc.ts, verify-rpc.ts,
│   │  deploy-rpc-manual.ts  (RPC CLI surface — reference templates)
│   ├── defender-cli.ts       (OZDefender CLI — incomplete)
│   ├── diamond-abi-cli.ts    (published as bin)
│   ├── setup/                RPCDiamondDeployer (singleton wrapper)
│   └── devops/               ORPHANED gnus-dao scripts (F-02)
├── test/                    Unit + functional tests (70 pass / 7 pending)
├── diamonds/                Test-deployment fixtures
├── examples/
│   ├── defender-deployment/ OBSOLETE (Defender retirement)
│   └── [other current examples — not fully inventoried in Phase 1]
├── docs/                    11 markdown files + 2 UXF diagrams + assets/
├── .husky/                  pre-commit, pre-push, commit-msg hooks
└── package.json             ~60+ script entries (many legacy — F-23)
```

### 3.3 Build Output

| Attribute             | Value                                                         | Tag     |
| --------------------- | ------------------------------------------------------------- | ------- |
| Build command         | `npx tsc` (plain TypeScript compilation)                      | OBS/CFG |
| Bundler               | None                                                          | OBS/CFG |
| Output location       | `dist/`                                                       | OBS/CFG |
| Module format emitted | ESM (`module: nodenext`, `target: ES2022`)                    | OBS/CFG |
| CJS output            | None                                                          | OBS/CFG |
| Declaration files     | Yes (`declaration: true`)                                     | OBS/CFG |
| Declaration bundling  | No                                                            | OBS/CFG |
| Published files       | `dist/`, `LICENSE`, `README.md` (per `files` in package.json) | OBS/CFG |

**Module-format intent unknown** (F-06). ESM-only is an observed state;
whether dual CJS/ESM output is a desired future is a Phase 2 decision.

### 3.4 Test Surface

| Attribute                    | Value                                                               | Tag         |
| ---------------------------- | ------------------------------------------------------------------- | ----------- |
| Test count                   | 70 passing, 7 pending (in main repo)                                | OBS/P       |
| Test runner                  | Hardhat (with mocha/chai under the hood)                            | OBS/CFG     |
| TypeScript coverage tooling  | **None installed**                                                  | OBS/CFG     |
| Solidity coverage tooling    | `solidity-coverage ^0.8.16`                                         | OBS/CFG     |
| Test categories              | Unit + functional (integration tests live in dev-env)               | OBS/P       |
| Coverage claim in ROADMAP    | "Complete test coverage for all components"                         | DOC (stale) |
| Coverage claim verifiability | Not currently verifiable without adding TypeScript coverage tooling | OBS/I       |

Practitioner preference for future coverage tooling: `nyc` (captured as
directional constraint, not a Phase 1 decision).

---

## Section 4: Languages, Runtimes & Package Management

| Attribute                   | Value                                                                                                     | Tag         | Notes                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------- |
| Primary language            | TypeScript                                                                                                | OBS/CFG     |                                 |
| TypeScript version          | `^5.9.3`                                                                                                  | OBS/CFG     | Modern                          |
| tsconfig target             | ES2022, `module: nodenext`                                                                                | OBS/CFG     |                                 |
| tsconfig strictness         | `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch` | OBS/CFG     | Strict                          |
| Node runtime floor          | **Undocumented** — no `engines` field in package.json                                                     | OBS/CFG     | See F-03                        |
| Node runtime hint (devDeps) | `@types/node ^24.0.12`                                                                                    | OBS/CFG     | suggests dev target Node 24     |
| Node runtime hint (doc)     | README-DEFENDER says "Node.js 18+"                                                                        | DOC (stale) | README-DEFENDER itself is stale |
| Package manager             | yarn `4.10.3` (pinned via `packageManager` field)                                                         | OBS/CFG     | Modern, reproducible            |
| Lockfile                    | `yarn.lock` (Berry format)                                                                                | OBS/CFG     |                                 |

**Finding F-03 — Node version requirement is undocumented and doc-drifted.**
The de-facto floor is effectively "whatever the practitioner and DevContainer run," with no enforced minimum in the package itself.

---

## Section 5: Frameworks & Major Libraries

### 5.1 Runtime Dependencies (5 total)

| Package                          | Version    | Purpose                                  | Tag                                       |
| -------------------------------- | ---------- | ---------------------------------------- | ----------------------------------------- |
| `@ethersproject/abstract-signer` | `^5.8.0`   | Signer abstraction (ethers v5 namespace) | OBS/CFG                                   |
| `axios`                          | `^1.12.0`  | HTTP client                              | OBS/CFG — **CVE-flagged** (see Section 9) |
| `debug`                          | `^4.4.1`   | Debug logging                            | OBS/CFG                                   |
| `fs-extra`                       | `^11.3.0`  | Filesystem operations                    | OBS/CFG                                   |
| `lodash`                         | `^4.17.21` | Utility library                          | OBS/CFG                                   |

**Unusually lean runtime dep set for a deployment tool.** Per
Specify-Q2, this reflects an explicit **dev-time-tool framing** (F-01):
most work happens at dev-time where devDependencies are available,
so runtime deps are minimal. Whether this framing should persist is
an open architectural question for Phase 2.

### 5.2 Peer Dependencies

| Package      | Range     | Tag     |
| ------------ | --------- | ------- |
| `ethers`     | `^6.0.0`  | OBS/CFG |
| `hardhat`    | `^2.0.0`  | OBS/CFG |
| `ts-node`    | `^10.0.0` | OBS/CFG |
| `typescript` | `^5.0.0`  | OBS/CFG |

### 5.3 Dev Dependencies (selected, ~60 total)

| Category                           | Packages                                                                                                                                | Tag            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Test harness (Mocha-based)         | `hardhat ^2.26.0`, `@nomicfoundation/hardhat-toolbox ^5.0.0`, `chai ^4.2.0`, `chai-as-promised ^7.1.1`, `mocha ^9.2.2`, `sinon ^21.0.0` | OBS/CFG        |
| Test harness (orphaned)            | `jest ^30.0.4`, `jest-mock ^29.7.0`, `ts-jest ^29.4.0`, `@types/jest ^29.5.14` — **not referenced in test/** (F-20)                     | OBS/C          |
| Validation                         | `zod ^4.0.2`                                                                                                                            | OBS/CFG        |
| Typechain                          | `typechain ^8.3.2`, `@typechain/ethers-v6 ^0.5.1`, `@typechain/hardhat ^9.1.0`                                                          | OBS/CFG        |
| OZ Defender SDK (retire candidate) | `@openzeppelin/defender-sdk ^2.6.0` + 3 sub-packages                                                                                    | OBS/CFG — F-24 |
| Upgradeable contracts              | `@gnus.ai/contracts-upgradeable-diamond =4.5.0` (exact pin)                                                                             | OBS/CFG        |
| Starter reference                  | `contracts-starter: git+...mudgen/diamond-2-hardhat.git` (unpinned)                                                                     | OBS/CFG — F-04 |
| Security scanners                  | `snyk ^1.1294.0`, `semgrep ^1.0.0`, `@socketsecurity/cli ^1.0.0`                                                                        | OBS/CFG        |
| Linters / formatters               | `eslint ^9.17.0`, `@typescript-eslint/* ^8.x`, `prettier ^3.4.2`, `prettier-plugin-solidity ^1.4.1`, `solhint ^3.3.7`                   | OBS/CFG        |
| Linter legacy                      | `tslint.json` referenced in `.npmignore`; tslint itself not in deps; **tslint deprecated since 2019**                                   | OBS/CFG — F-22 |
| Commit / hook tooling              | `husky ^9.1.7`, `lint-staged ^15.2.0`, `@commitlint/cli ^19.8.1`                                                                        | OBS/CFG        |
| Plugin peer (consumed)             | `@diamondslab/hardhat-diamonds ^1.0.0`                                                                                                  | OBS/CFG        |

---

## Section 6: Application Architecture

### 6.1 Core Classes (src/core/)

| Class               | Role                                                                                                                | Tag   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | ----- |
| `Diamond`           | Primary orchestrator — holds config, repository, provider, signer, function-selector registry, and callback manager | OBS/C |
| `DiamondDeployer`   | Wraps a `Diamond` + `DeploymentStrategy` to execute a deployment                                                    | OBS/C |
| `DeploymentManager` | Deployment lifecycle coordinator                                                                                    | OBS/C |
| `CallbackManager`   | Post-deployment callback registry / invoker                                                                         | OBS/C |

### 6.2 Deployment Strategies (src/strategies/) — 5 items

| Strategy                       | Status                           | Purpose                                                                                  | Tag           |
| ------------------------------ | -------------------------------- | ---------------------------------------------------------------------------------------- | ------------- |
| `DeploymentStrategy`           | Interface                        | Contract for all strategies                                                              | OBS/C         |
| `BaseDeploymentStrategy`       | Active                           | Shared strategy implementation                                                           | OBS/C         |
| `LocalDeploymentStrategy`      | Active                           | Hardhat local network deployment                                                         | OBS/C         |
| **`RPCDeploymentStrategy`**    | **Production-current**           | **Direct RPC deployment — the way production deployments are actually run today**        | OBS/C + OBS/P |
| `OZDefenderDeploymentStrategy` | **Incomplete, retire candidate** | OpenZeppelin Defender integration; never fully completed; Defender itself is deprecating | OBS/C + OBS/P |

`RPCDeploymentStrategy` includes custom error classes (`RPCConnectionError`,
`TransactionFailedError`, `GasEstimationError`, `ContractDeploymentError`),
retry configuration (gas-limit multiplier, max retries, retry delay),
Zod-based config validation, and step-by-step progress tracking via
`RPCDeploymentStore` (in `src/utils/rpcStore.ts`).

### 6.3 Repository Layer (src/repositories/)

| Component                  | Purpose                                       | Tag   |
| -------------------------- | --------------------------------------------- | ----- |
| `DeploymentRepository`     | Abstract interface                            | OBS/C |
| `FileDeploymentRepository` | JSON-file-backed deployment state persistence | OBS/C |
| `jsonFileHandler`          | File I/O utility                              | OBS/C |

### 6.4 Schemas (src/schemas/)

Zod-based validation via `DeploymentSchema`. Validates diamond
configuration structure before deployment.

### 6.5 Utilities (src/utils/) — ~14 modules

Selected notable utilities:

- `diamondAbiGenerator` — ABI aggregation across facets (heavily documented)
- `configurationResolver` — Resolves diamond config from various sources
- `workspaceSetup` — Scaffolds new diamond workspaces (`WorkspaceSetup.initializeWorkspace`)
- `signer`, `txlogging`, `loupe` — Ethers integration helpers
- `defenderStore`, `defenderClients` — Defender-integration helpers (retire candidates)
- `contractMapping`, `rpcStore` — Deployment-state helpers
- `diffDeployedFacets` — Facet delta calculation for upgrades

### 6.6 CLI Surface

`diamond-abi` binary (`dist/scripts/diamond-abi-cli.js`) — published via
`bin` field in package.json. Provides command-line access to ABI
generation / preview / compare / validate operations.

---

## Section 7: Deployment Topology

Diamonds is a **library**, not a deployed service. "Deployment" in the
Diamonds context refers to:

1. **Library publish** — `@diamondslab/diamonds` to npm (manual, via
   `yarn npm publish`; hand-edited version field; no publish gates)
2. **Consumer-project diamond deployment** — the library is used by
   consumers to deploy their own ERC-2535 diamonds; Diamonds itself
   does not run as a service

Consumer-project deployments in production use `RPCDeploymentStrategy`
(Section 6.2), invoked via reference scripts copied from Diamonds'
`scripts/deploy-rpc.ts` family. Defender-based production deployment
has never been operational.

---

## Section 8: Build, CI/CD & Release Process

### 8.1 Build

| Attribute                            | Value                    | Tag                              |
| ------------------------------------ | ------------------------ | -------------------------------- |
| Command                              | `yarn build` → `npx tsc` | OBS/CFG                          |
| Reproducibility in DevContainer      | Confirmed clean          | OBS/P                            |
| Reproducibility outside DevContainer | **Not confirmed**        | OBS/I — see F-10 auditor concern |
| Dist target                          | `dist/` (ESM)            | OBS/CFG                          |

### 8.2 Continuous Integration

| Attribute               | Value                                                                           | Tag                       |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| `.github/workflows/`    | **Does not exist** in main Diamonds repo                                        | OBS/P                     |
| GitHub Actions          | None                                                                            | OBS/P                     |
| Other CI system         | None                                                                            | OBS/P                     |
| CI pattern in ecosystem | Documented in `hardhat-diamonds` README; never successfully shipped in any repo | DOC (aspirational) — F-11 |

The quality gating that exists runs entirely via **husky git hooks**
on the maintainer's local machine (Section 8.4). There is no
server-side verification that gates ran, no build artifact provenance,
and no publish-side trust chain.

### 8.3 Release Process

| Attribute                                 | Value                                                       | Tag   |
| ----------------------------------------- | ----------------------------------------------------------- | ----- |
| Version bumping                           | Hand-edited in `package.json`                               | OBS/P |
| Publish trigger                           | Manual `yarn npm publish`                                   | OBS/P |
| Pre-publish gates                         | None at publish time (husky gates fire at commit/push time) | OBS/P |
| Automation (changesets, semantic-release) | None                                                        | OBS/P |
| Publish provenance                        | None                                                        | OBS/P |

### 8.4 Quality Gating Architecture (Local-First via husky)

**F-08 — Quality gating is sophisticated but local-only.** The architecture is intentional and reasonably well-designed, with a known single-point-of-enforcement vulnerability (F-09).

**Pre-commit hook (.husky/pre-commit):**

- Emergency bypass check (honors `HUSKY_SKIP_HOOKS=1` / `EMERGENCY_BYPASS=1`)
- Performance monitoring via `yarn perf-monitor`
- Runs `lint-staged`
- **Note:** `yarn clean-compile` line is present but commented out (likely too slow for commit-time)

**Pre-push hook (.husky/pre-push):**
Executes sequentially, bypassable via env vars:

| Check                            | Command                              | Blocking?                          | Notes              |
| -------------------------------- | ------------------------------------ | ---------------------------------- | ------------------ |
| npm security audit               | `yarn npm audit --severity moderate` | Yes                                |                    |
| Snyk vulnerability scan          | `yarn snyk:test`                     | **No (silent skip if unauth)**     | F-13 gating bug    |
| OSV vulnerability scan           | `yarn osv:scan`                      | **No (output suppressed)**         | F-14 gating bug    |
| Semgrep code security            | `yarn semgrep:scan`                  | Yes                                |                    |
| Slither Solidity static analysis | `yarn slither:scan`                  | Yes                                |                    |
| git-secrets secret detection     | `yarn git-secrets:scan`              | Yes                                |                    |
| Full test suite                  | `yarn test`                          | Yes, **only on main/develop push** | F-15 design choice |

**Commit-msg hook (.husky/commit-msg):** commitlint + `yarn security-commit-check`

**Emergency bypass (scripts/devops/emergency-bypass.ts):** Provides
`yarn emergency-bypass` with commit / push / disable-hooks / enable-hooks
actions. Each action is logged to a bypass log file with timestamps
(F-12 — auditable by design). No automated enforcement of bypass review.

### 8.5 Quality-Gating Findings Summary

| Finding | Severity         | Nature                                                   |
| ------- | ---------------- | -------------------------------------------------------- |
| F-08    | —                | Architectural feature (sophisticated local-first gating) |
| F-09    | Medium           | Single-point-of-enforcement at maintainer's machine      |
| F-10    | Medium           | Gate evidence invisible to consumers (auditor concern)   |
| F-12    | —                | Architectural feature (auditable bypass logging)         |
| F-13    | High             | Snyk silently skips unauthenticated; false-green risk    |
| F-14    | High (suspected) | OSV scan output-suppression likely masks findings        |
| F-15    | —                | Design choice: tests only on main/develop push           |

---

## Section 9: Dependencies, Integrations & External Services

### 9.1 Known Vulnerability State (as of assessment date)

**Baseline is stale — last full audit reported at "a couple months
before" 2026-04-18, i.e., roughly Jan–Feb 2026.**

| Concern           | State                                                  | Tag                      |
| ----------------- | ------------------------------------------------------ | ------------------------ |
| Axios CVE         | Dependabot-flagged                                     | OBS/P — S-01 known-stale |
| Full `yarn audit` | Not executed recently                                  | OBS/P                    |
| Snyk scan         | Last run unknown; silent-skip risk (F-13)              | OBS/P                    |
| OSV scan          | Output-suppression bug (F-14) may have masked findings | OBS/I                    |

**Step 02 will re-baseline this via fresh local scans.**

### 9.2 Integration Points

| Integration                       | Nature                                                                                                                                                | Tag                      |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `@diamondslab/hardhat-diamonds`   | Consumed as devDependency by main Diamonds for plugin registration testing; plugin consumes Diamonds' `Diamond`, `DiamondDeployer`, ABI generator API | OBS/C                    |
| `@diamondslab/diamonds-dev-env`   | Monorepo integration harness; consumes Diamonds as submodule; runs extensive cross-module integration tests                                           | OBS/P                    |
| `Diamonds-DevContainer` submodule | Reusable dev environment substrate; installs Slither, Semgrep, Snyk CLI, OSV, git-secrets required by husky gates                                     | OBS/P                    |
| Ethereum RPC endpoints            | Via `RPCDeploymentStrategy` — configurable per-deployment                                                                                             | OBS/C                    |
| OpenZeppelin Defender API         | Via `OZDefenderDeploymentStrategy` (incomplete)                                                                                                       | OBS/C — retire candidate |
| Etherscan verification            | Referenced in scripts/deploy-rpc verify path                                                                                                          | OBS/C                    |

### 9.3 Supply Chain

| Attribute            | Value                                           | Tag     |
| -------------------- | ----------------------------------------------- | ------- |
| Git-URL dependency   | `contracts-starter` unpinned (F-04)             | OBS/CFG |
| Exact-version pin    | `@gnus.ai/contracts-upgradeable-diamond =4.5.0` | OBS/CFG |
| Lockfile integrity   | yarn berry with content hashes                  | OBS/CFG |
| Published provenance | None                                            | OBS/P   |

---

## Section 10: Documentation State

### 10.1 Documentation Inventory (docs/, mostly Oct 27)

| File                                        | Size | Subject                          | Currency assessment                                         |
| ------------------------------------------- | ---- | -------------------------------- | ----------------------------------------------------------- |
| `DIAMOND_ABI_CONFIGURATION_SUMMARY.md`      | 1.9K | ABI Generator                    | Needs cleanup + expansion                                   |
| `DIAMOND_ABI_GENERATION.md`                 | 7.2K | ABI Generator                    | Needs cleanup + expansion                                   |
| `DIAMOND_ABI_GENERATOR_EXAMPLES.md`         | 32K  | ABI Generator                    | Needs cleanup + expansion                                   |
| `DIAMOND_ABI_GENERATOR_IMPLEMENTATION.md`   | 22K  | ABI Generator                    | Needs cleanup + expansion                                   |
| `DIAMOND_ABI_GENERATOR_QUICK_REFERENCE.md`  | 8.5K | ABI Generator                    | Needs cleanup + expansion                                   |
| `README_DIAMOND_ABI_GENERATOR.md`           | 8.3K | ABI Generator                    | Needs cleanup + expansion                                   |
| `README-DEFENDER.md`                        | 11K  | Defender integration             | **Actively misleading** (Defender deprecated)               |
| `defender-integration.md`                   | 12K  | Defender integration             | **Actively misleading**                                     |
| `monitoring-troubleshooting.md`             | 14K  | Monitoring / troubleshooting     | Needs cleanup                                               |
| `ROADMAP.md`                                | 8.1K | Project roadmap                  | Stale claims ("Production Ready", "Complete test coverage") |
| `testing-guide.md`                          | 19K  | Testing approach                 | Needs cleanup + expansion                                   |
| `diamond_module-BaseStrategy_design.uxf`    | 19K  | Architecture diagram (UMLet)     | Design artifact                                             |
| `diamond_module-BaseStrategy_design-v2.uxf` | 17K  | Architecture diagram v2 (Oct 29) | Design artifact, most recent                                |
| `assets/`                                   | dir  | Presumably rendered diagrams     | Not inventoried                                             |

### 10.2 Documentation Shape Findings

**F-25 — ABI Generator is over-documented relative to rest of library.**
6 of 11 markdown files (~55% of doc files, ~80K of 216K doc bytes) cover
the ABI Generator. Core classes (`Diamond`, `DiamondDeployer`,
`DeploymentManager`, `CallbackManager`, `LocalDeploymentStrategy`,
`RPCDeploymentStrategy`, `FileDeploymentRepository`) have no dedicated
documentation files.

**F-24 — Defender-related documentation is substantial and stale.**
Two dedicated docs (~23K) plus Defender content in
`monitoring-troubleshooting.md`. Retirement requires documentation
cleanup alongside code / dependency / script cleanup.

**F-26 — Design diagrams exist as UMLet UXF files.** Positive finding:
architectural intent is captured visually. Portable-format conversion
(SVG / PNG / Mermaid) will be a Phase 2 consideration for the docs site.

### 10.3 Public API Reference

**No generated API reference exists.** All Diamonds API documentation
is hand-written markdown. This is a structural gap, not a maintenance
one — the tooling to generate an API reference (TypeDoc, api-extractor,
or equivalent) is not installed. Phase 2 must introduce API reference
generation as a new capability.

### 10.4 Aggregate Documentation State

Practitioner assessment: _"These documents are not complete and
definitely in need of cleanup of obsolete information and expansion
to give a complete implementation and integrations documentation."_

Treated as: **all 11 markdown files are in-scope for cleanup and
expansion** in Phase 2. No per-file triage needed.

---

## Section 11: Testing State

### 11.1 Test Suite (Main Diamonds Repo)

| Attribute                                      | Value                                                                                                          | Tag          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| Passing tests                                  | 70                                                                                                             | OBS/P        |
| Pending tests                                  | 7                                                                                                              | OBS/P        |
| Test categories                                | Unit + functional                                                                                              | OBS/P        |
| Integration tests                              | Live in `diamonds-dev-env`, not here (by design)                                                               | OBS/P — F-18 |
| TypeScript coverage                            | **None measured** — no tooling installed                                                                       | OBS/CFG      |
| Solidity coverage tooling                      | `solidity-coverage ^0.8.16` (wrong surface for TS library)                                                     | OBS/CFG      |
| Practitioner preference for future TS coverage | `nyc`                                                                                                          | OBS/P        |
| Test runner                                    | Hardhat / Mocha / Chai                                                                                         | OBS/CFG      |
| Test-runner oddity                             | Jest family (`jest`, `jest-mock`, `ts-jest`, `@types/jest`) present in devDeps but **not referenced in test/** | OBS/C — F-20 |

### 11.2 Test Architecture Division

Per practitioner (Specify + Step 01 confirmation):

- **Main Diamonds repo** — unit tests + functional tests for the library's
  internal processes
- **`diamonds-dev-env` repo** — integration tests spanning Diamonds +
  hardhat-diamonds + diamonds-hardhat-foundry + diamonds-monitor. "Extensive."
- Some main-repo-worthy tests _may_ live in dev-env for historical reasons;
  further analysis needed (captured as Step 02 follow-up)

**Auditor-persona finding (F-18-derived):** An adopter assessing test
coverage of Diamonds sees only the 70 main-repo tests. The extensive
dev-env integration suite is invisible to adopters without cross-repo
context they don't have. Phase 2 must make this testing architecture
visible to adopters (not a Phase 1 decision; captured for handoff).

### 11.3 Test-Related Findings Summary

| Finding | Nature                                                         |
| ------- | -------------------------------------------------------------- |
| F-17    | Baseline: 70 pass / 7 pending, no TS coverage                  |
| F-18    | Architectural: test scope intentionally split across two repos |
| F-20    | Jest family orphaned in main repo                              |

---

## Section 12: Observed Divergences & Drift

Documented-Intent vs. Observed-Reality divergences surface as
first-class findings in brownfield work.

| ID   | Divergence                         | Documented Intent                                                                        | Observed Reality                                                                                         | Tag             |
| ---- | ---------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------- |
| D-01 | ROADMAP test-coverage claim        | "Complete test coverage for all components"                                              | 70 tests, no TS coverage measurement possible                                                            | DOC vs OBS      |
| D-02 | ROADMAP production-readiness claim | "Current Status: Production Ready ✅"                                                    | Defender strategy incomplete, no CI, coverage unmeasured, docs stale                                     | DOC vs OBS      |
| D-03 | README-DEFENDER Node version       | "Node.js 18+"                                                                            | No `engines` field enforces this; devDeps suggest Node 24 target                                         | DOC vs OBS      |
| D-04 | `.npmignore` orphan reference      | `test-mock-verify.js` listed to exclude                                                  | File does not exist in the codebase                                                                      | CFG vs OBS      |
| D-05 | gnus-dao devops scripts            | Files present in `scripts/devops/` suggesting active tooling                             | Scripts are copied from a different project; referenced in package.json but not appropriate for Diamonds | C vs OBS        |
| D-06 | `tslint.json` reference            | `.npmignore` excludes it as if present and valid                                         | tslint has been deprecated since 2019; eslint is the real linter                                         | CFG vs OBS      |
| D-07 | Jest inclusion                     | devDeps include `jest`, `jest-mock`, `ts-jest`, `@types/jest`                            | Not referenced in `test/`; test runner is Hardhat/Mocha                                                  | CFG vs OBS      |
| D-08 | `contracts-starter` pinning        | git URL dependency (unpinned HEAD) in a project whose own tooling warns against git deps | Every install pulls whatever is currently at HEAD of the external repo                                   | CFG vs OBS      |
| D-09 | Lean runtime dep set               | Five runtime deps; consumer assumption is that Diamonds is a deployment library          | Actually framed as dev-time tool (F-01); runtime-consumer posture unclear                                | C vs DOC vs OBS |

Divergences are candidates for Step 04's debt register and Step 05's
component dispositions. Each requires Phase 2 to decide: correct
the documentation, correct the implementation, or accept the gap.

---

## Section 13: Knowledge Distribution & Bus Factor

| Dimension                                | Assessment                                                                                                                                                   | Tag   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| Number of active maintainers             | 1 (practitioner)                                                                                                                                             | OBS/P |
| Code provenance concentration            | High — most decisions are in one person's head                                                                                                               | OBS/P |
| Architectural design documentation       | Partial (UXF diagrams) + partial narrative in `DIAMOND_ABI_GENERATION.md`                                                                                    | OBS/C |
| Onboarding time for new contributor      | Not measured; Step 02 baseline                                                                                                                               | OBS/I |
| DevContainer reusability across projects | Claimed as substrate for ecosystem (F-16 architectural intent)                                                                                               | OBS/P |
| Tribal-knowledge zones                   | Relationships between Diamonds / hardhat-diamonds / dev-env / DevContainer; why RPC is production path and Defender isn't; test-architecture split rationale | OBS/I |

**Bus factor: 1.** This is not a critique — it is the hard constraint
profile for this improvement cycle (Specify H-01). All Phase 2
improvement decisions must be sustainable as solo work.

---

## Section 14: Principal Tensions

These are not findings to fix in Phase 1 — they are structural tensions
that Phase 2 must navigate with full awareness.

### PT-01 — Professional-grade industry positioning vs. solo-maintainer sustainability

The improvement objective (industry-grade adoption for Solidity developers
and auditors) would conventionally assume a funded team. The practitioner
is a solo volunteer on an open-ended timeline. Every Phase 2 decision
must pass both filters: _does this raise the professionalization bar_
AND _is this sustainable as solo work_?

### PT-02 — Dev-time-tool framing vs. runtime-consumer scenarios

The lean 5-package runtime-dependency set reflects an implicit dev-time-only
framing (F-01). Consumers who would use Diamonds as a library component
in a runtime service (non-Hardhat projects, CI/CD pipelines, operator
consoles) currently have an uncomfortable fit. Phase 2 must decide:
commit to dev-time framing explicitly, or broaden to runtime-capable.
The decision affects the `dependencies` vs `devDependencies` split for
a substantial portion of the current stack.

### PT-03 — DevContainer-as-CI substrate vs. execution cost

The architectural intent — unified DevContainer for local development
and CI — is coherent and well-motivated for a small team (F-16).
The pattern has been **attempted but never shipped** across any repo
in the ecosystem. This is data. Either the pattern is materially
harder to ship than expected, or bandwidth has never aligned with
the effort. Phase 2 must decide: commit to solving the pattern
properly, or adopt a simpler CI approach that sacrifices the
unified-environment benefit.

### PT-04 — Local-first quality gating vs. consumer-visible quality evidence

The husky-based quality gating (F-08) is substantive in what it runs,
but produces evidence visible only to the maintainer (F-09, F-10). An
auditor reviewing a project that depends on Diamonds cannot, from
Diamonds' published artifacts, verify what quality gating ran on a
given commit. Phase 2's CI decision (tied to PT-03) will determine
whether this gap is closed.

---

## Section 15: Research / Discovery Gaps

Gaps explicitly registered here rather than silently accepted.

| Gap ID | Description                                                  | Why it wasn't resolved in Step 01                                                          | Resolves in                  |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------- |
| G-01   | Fresh `yarn audit` / Snyk / OSV scan results                 | Required practitioner-local execution; deferred to Step 02                                 | Step 02                      |
| G-02   | TypeScript test coverage baseline                            | Tool not installed; install is itself a Phase 2 decision                                   | Step 02 (as UNMEASURED)      |
| G-03   | `examples/` complete inventory beyond `defender-deployment/` | Practitioner confirmed other current examples exist but detailed listing not captured      | Step 05                      |
| G-04   | Detailed documentation-vs-code drift per doc                 | Practitioner judgment was "all need cleanup"; per-file drift not needed at this resolution | Step 03 / Phase 2            |
| G-05   | Full inventory of `src/utils/` behavior                      | Module list captured; per-function accuracy not inventoried                                | Step 05 / Phase 2            |
| G-06   | `hardhat-diamonds` API consumption of Diamonds library       | Covered at surface level; exact contract not mapped                                        | Step 03 (Must-Keep register) |
| G-07   | Tests in dev-env that might belong in main Diamonds          | Practitioner expects "few if any" but hasn't analyzed                                      | Step 02                      |
| G-08   | Accurate measured-Node-version floor                         | No `engines` field; de-facto floor untested                                                | Step 02                      |

---

## Section 16: Confidence Summary & Evidence Basis

### 16.1 Evidence-Basis Distribution of Significant Claims

Approximate distribution across the ~75 significant claims in this artifact:

| Basis             | Share | Notes                                                               |
| ----------------- | ----- | ------------------------------------------------------------------- |
| Code (C)          | ~35%  | Direct `project_knowledge_search` verification against subject repo |
| Config (CFG)      | ~30%  | package.json, tsconfig.json, .husky/\*, .npmignore verified         |
| Practitioner (P)  | ~20%  | Confirmed via interview                                             |
| Inferred (I)      | ~10%  | Reasoned from evidence, flagged as such                             |
| Documentation (D) | ~5%   | README / ROADMAP / docs/\* — often flagged as stale                 |
| Telemetry (T)     | 0%    | No telemetry available; Step 02 gap                                 |

**Honest assessment:** the artifact leans heavily on code + config +
practitioner testimony. Telemetry is entirely absent (a known
consequence of F-05, no CI). For a library project at this maturity
level, this distribution is acceptable; Step 02 will attempt to add
measured telemetry where feasible.

### 16.2 Confidence Summary by Section

| Section                            | Confidence  | Basis                                                                              |
| ---------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| §3 Repository & Codebase Inventory | High        | Code + Config verified                                                             |
| §4 Languages & Runtimes            | Medium-High | Config verified; Node floor is a known gap                                         |
| §5 Frameworks & Major Libraries    | High        | package.json directly observed                                                     |
| §6 Application Architecture        | High        | src/ tree verified; RPCDeploymentStrategy was missed in initial pass and recovered |
| §7 Deployment Topology             | High        | Practitioner-confirmed; library not service                                        |
| §8 Build / CI / Release            | High        | .husky/ + package.json scripts + practitioner confirmation                         |
| §9 Dependencies & Integrations     | Medium      | CVE state is stale (G-01)                                                          |
| §10 Documentation State            | High        | Directory listing practitioner-provided                                            |
| §11 Testing State                  | Medium-High | Counts practitioner-provided; coverage truly unmeasured                            |
| §12 Divergences                    | High        | All items triangulated from ≥ 2 evidence sources                                   |
| §13 Knowledge Distribution         | Medium      | Practitioner testimony                                                             |
| §14 Principal Tensions             | Medium-High | Structural, derived from observed evidence                                         |

### 16.3 Cross-Repo Contamination Mitigation

Per the Specify-step Option A (Explicit Cross-Repo Mode), three
instances of potential contamination from `hardhat-diamonds` or
`diamonds-dev-env` were caught during Step 01:

1. A README fragment describing a CI pipeline — caught via
   practitioner contradiction, reclassified as F-11
2. A `package.json` with `workspace:*` and `resolutions` — caught via
   practitioner confirmation, attributed to dev-env
3. A `scripts/deploy/rpc/` directory with extensive README — caught
   via file-path inspection, attributed to hardhat-diamonds-dev

All three were correctly attributed. One inventory omission
(`RPCDeploymentStrategy`) was self-caught mid-assessment and corrected.
Cross-repo contamination mitigation effectiveness: 3/3 + 1/1 = 4/4
catches in one Step 01 session.

---

## Section 17: Findings Register (Consolidated)

Complete list of findings logged during Step 01. These feed forward
into Steps 02–05 with the cross-references indicated.

| ID   | Finding                                                                                    | Classification                           | Step 02+ Path                                |
| ---- | ------------------------------------------------------------------------------------------ | ---------------------------------------- | -------------------------------------------- |
| F-01 | Dev-time-tool framing may constrain runtime consumers                                      | Architectural observation                | → PT-02, Step 03 candidate must-change       |
| F-02 | Orphan gnus-dao devops infrastructure in scripts/devops/                                   | Divergence + debt                        | → Step 04 debt, Step 05 Retire               |
| F-03 | Node version undocumented; README-DEFENDER stale                                           | Doc drift                                | → Step 04 debt                               |
| F-04 | `contracts-starter` unpinned git URL dependency                                            | Dependency debt                          | → Step 04 debt, Step 05 Upgrade/Replace      |
| F-05 | No CI workflows in main Diamonds repo                                                      | Observed gap                             | → Step 04 project risk, Step 05 new-adoption |
| F-06 | Build is `npx tsc`; module-format intent unknown                                           | Phase 2 decision pending                 | → Step 03 candidate decision                 |
| F-07 | Orphan `test-mock-verify.js` in `.npmignore`                                               | Config drift                             | → Step 04 trivial debt                       |
| F-08 | Sophisticated local-first quality gating via husky                                         | Architectural feature                    | → Must-Keep consideration                    |
| F-09 | Single-point-of-enforcement at maintainer's machine                                        | Architectural risk                       | → PT-04, Step 04 risk                        |
| F-10 | Quality evidence invisible to consumers                                                    | Auditor-persona concern                  | → PT-04, Step 03 must-change                 |
| F-11 | hardhat-diamonds has documented CI; Diamonds doesn't                                       | Cross-repo gap                           | → Step 02 context                            |
| F-12 | Emergency bypass is auditable via log file                                                 | Architectural feature                    | → Must-Keep consideration                    |
| F-13 | Snyk scan silently skips if unauthenticated                                                | Gating bug                               | → Step 04 debt                               |
| F-14 | OSV scan output suppression (suspected)                                                    | Gating bug                               | → Step 04 debt (verify first)                |
| F-15 | Tests only run on main/develop pushes                                                      | Gating design choice                     | → context                                    |
| F-16 | DevContainer-as-CI pattern never shipped                                                   | Principal Tension                        | → PT-03                                      |
| F-17 | 70 passing / 7 pending tests; no TS coverage measurement                                   | Baseline                                 | → Step 02                                    |
| F-18 | Test scope split: unit+functional main; integration dev-env                                | Architectural division                   | → Step 03 Must-Keep                          |
| F-19 | Dev-env submodule integration is a Must-Keep constraint                                    | Architectural constraint                 | → Step 03 Must-Keep                          |
| F-20 | Jest family orphaned in main repo                                                          | Debt                                     | → Step 05 Retire                             |
| F-21 | _(resolved — single `.npmignore`)_                                                         | —                                        | —                                            |
| F-22 | Legacy tooling pattern aggregate (tslint/jest/contracts-starter/test-mock-verify/gnus-dao) | Debt                                     | → Step 04/05                                 |
| F-23 | Many `package.json` scripts are legacy                                                     | Debt                                     | → Step 05 per-script disposition             |
| F-24 | Defender footprint distributed across 4+ layers                                            | Composite retirement                     | → Step 05 coordinated Retire                 |
| F-25 | ABI Generator over-documented relative to rest of library                                  | Doc-shape finding                        | → Phase 2 doc rebalancing                    |
| F-26 | Design diagrams exist as UXF files                                                         | Positive finding                         | → Phase 2 format conversion                  |
| F-27 | RPCDeploymentStrategy is production-current, undocumented in docs/                         | Documentation gap for material component | → Step 05 Keep, docs expansion priority      |

---

## Section 18: Handoff to Step 02

Step 02 (Operational & Performance Baseline) will take this current-state
picture and add _measured behavior_. Specifically:

| Step 02 Focus                  | Evidence Step 01 Provides                           | Step 02 Adds                                                                 |
| ------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| Release cadence (DORA-adapted) | Manual publish process, hand-edited versions (§8.3) | Measure actual release frequency from git tags / npm registry                |
| Build / test performance       | Tooling identified (§3, §11)                        | Measure clean-build time, test-suite runtime                                 |
| Dependency CVE posture         | Stale baseline (§9.1, G-01)                         | Fresh `yarn audit` + Snyk + OSV output                                       |
| Test coverage reality          | 70 pass / 7 pending (§11); no TS coverage           | Mark TS coverage as UNMEASURED; propose nyc-based measurement as Phase 2 inv |
| Incident history               | None captured                                       | Practitioner interview for past regressions / known bugs                     |
| Contributor ramp-up            | Not measured (§13)                                  | Practitioner estimate or proxy measurement                                   |

Step 02 will also resolve or re-frame these specific discovery gaps:
G-01, G-02, G-07, G-08.

---

## Source & Evidence Register

- **Primary source:** `project_knowledge_search` over `diamondslab/diamonds`
  (main repo), state synced to npm v1.2.1 release (2026-01-03)
- **Evidence-only sources:** `diamondslab/hardhat-diamonds`,
  `diamondslab/diamonds-dev-env` (each called out explicitly where
  evidence from them is used)
- **Practitioner interviews:** Specify-step Q1–Q6; Step 01 interview
  rounds 1–5 plus residual confirmations; 2026-04-18 session
- **Current library docs:** Context7 MCP (`/resolve-library-id`,
  `/query-docs`) — available but not extensively queried in Step 01
  (Step 02 may draw on this more for baseline comparisons)
- **Web search:** not used in Step 01 (no external benchmark queries
  needed for current-state description)

---

_Part of the Phase 1 Information Gathering (Existing Projects) Tool Set_
_AI-Centric Software Development Playbook — Dogfooding on Diamonds_
_Previous artifact: Discovery Specification & Discovery Plan_
_Next artifact: Step 02 — Operational & Performance Baseline_
