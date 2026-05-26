# Reusable & Replaceable Components Catalog

## `@diamondslab/diamonds` v1.3.2 → v2.0 Improvement Cycle

**Artifact:** Step 05 output — Phase 1 (Existing Projects)
**Assessment date:** 2026-04-20
**Subject repository:** `diamondslab/diamonds` (standalone scope)
**Practitioner:** solo maintainer
**AI analyst:** Claude Opus 4.7
**Prior artifacts consumed:** Discovery Specification; Step 01 Technology & Architecture; Step 02 Operational Baseline; Step 03 Requirements & Improvement Objective; Step 04 Risk / Constraint / Technical Debt Inventory

> This artifact catalogs every meaningful component in the Diamonds
> subject repository with an explicit disposition: **Keep**,
> **Upgrade**, **Replace**, or **Retire**. Plus **Net-new** for
> components the improvement cycle creates. Every disposition links
> back to the Must-Change register or an explicit practitioner
> decision. This catalog drives Phase 2 sequencing and Phase 5
> execution work.

---

## Section 1: Executive Summary

**Eight component categories cataloged:** source code, test suites,
scripts, dependencies, configuration, documentation, build tooling,
CI/CD. Approximately 100 distinct components classified.

**Disposition distribution:**

| Disposition | Count | Share                              |
| ----------- | ----- | ---------------------------------- |
| Keep        | ~40   | ~40%                               |
| Upgrade     | ~25   | ~25%                               |
| Replace     | ~3    | ~3%                                |
| Retire      | ~35   | ~35%                               |
| Net-new     | ~10   | (additions, not reclassifications) |

**The catalog's defining character is the Retire cluster.** About a
third of existing components are being removed rather than kept or
improved. This is expected for a brownfield cycle focused on
productization — the library has accumulated orphan tooling (gnus-dao
devops scripts), incomplete features (Defender), unused dependencies
(web3, winston, abi2oas, uint32, @socketsecurity/cli), and outdated
example scripts. Removing them is as important as adding docs or CI.

**Key scope refinements surfaced during Step 05:**

1. **All of `scripts/` is Retire.** Not just the gnus-dao `scripts/devops/`
   subdirectory. The root-level deployment scripts, `scripts/deploy/`,
   and `scripts/setup/` are all outdated. MC-19 expands to cover them.

2. **Five additional devDeps to retire.** Beyond MC-19's initial
   scope (Jest family + gnus-dao scripts + contracts-starter pinning),
   practitioner confirmed `@socketsecurity/cli`, `web3`, `winston`,
   `abi2oas`, `uint32` + `@types/uint32` are all unused.

3. **MC-01's mechanism is now two-branch.** lodash upgrade can be
   either a patch bump (Branch A: `^4.17.24+`) or a replacement
   (Branch B: native JS or `es-toolkit`). Phase 2 picks; outcome is
   unchanged.

4. **MC-07 scope expansion.** Working example scripts, originally
   considered as candidate MC-23, fold into MC-07. MC-07 now produces
   narrative docs + working example scripts as paired deliverables.

5. **docs/ contains 14 items, not 11.** Refined from Step 01
   estimate. Includes 6 ABI generator docs (consolidating to 1-2),
   2 UXF design diagrams (v1 retires, v2 keeps with PNG already
   rendered), plus 5 other files.

**No net-new Must-Changes from Step 05.** Register remains at
**9 MK / 22 MC / 9 NTI / 8 IC**.

---

## Section 2: Category 1 — Source Code Modules (`src/`)

### 2.1 Core (`src/core/`)

| Component                                            | File(s)                  | Disposition | Rationale                                                                                        | MC link      |
| ---------------------------------------------------- | ------------------------ | ----------- | ------------------------------------------------------------------------------------------------ | ------------ |
| `Diamond` class                                      | `diamond.ts`             | Keep        | Core abstraction; MK-04 API surface; MK-08 ERC-2535 conformance                                  | —            |
| `DiamondDeployer` class                              | `diamondDeployer.ts`     | Keep        | Core abstraction; MK-04                                                                          | —            |
| `CallbackManager`                                    | `callbackManager.ts`     | Keep        | Part of core ERC-2535 implementation                                                             | —            |
| `FunctionSelectorRegistryEntry` + selector machinery | selector-related modules | Keep        | Core ERC-2535 machinery; MK-08                                                                   | —            |
| `src/core/index.ts` exports                          | `index.ts`               | Upgrade     | Verify all plugin-consumable types exported (CC-02 resolution via MC-07 docs and MC-04 contract) | MC-04, MC-07 |

### 2.2 Strategies (`src/strategies/`)

| Component                      | File(s)                           | Disposition            | Rationale                                                                                                                       | MC link      |
| ------------------------------ | --------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `BaseDeploymentStrategy`       | `BaseDeploymentStrategy.ts`       | Keep                   | MK-04 surface; MC-04 extension-point work centers here; implementation stable. Heavy docs target of MC-07.                      | MC-04, MC-07 |
| `LocalDeploymentStrategy`      | `LocalDeploymentStrategy.ts`      | Keep                   | MK-04 surface; working                                                                                                          | —            |
| `RPCDeploymentStrategy`        | `RPCDeploymentStrategy.ts`        | **Upgrade (breaking)** | MK-02 production-current; **MC-21 refactors constructor to remove private-key parameter**; per-deployment key injection pattern | MC-21        |
| `OZDefenderDeploymentStrategy` | `OZDefenderDeploymentStrategy.ts` | **Retire**             | MC-05 — full retirement, all layers                                                                                             | MC-05        |
| `src/strategies/index.ts`      | `index.ts`                        | Upgrade                | MC-04 extension contract formalization; removes Defender exports after MC-05                                                    | MC-04, MC-05 |

### 2.3 Repositories (`src/repositories/`)

| Component                  | File(s)                       | Disposition | Rationale                                                        | MC link |
| -------------------------- | ----------------------------- | ----------- | ---------------------------------------------------------------- | ------- |
| `FileDeploymentRepository` | `FileDeploymentRepository.ts` | Keep        | MK-01 reproducibility mechanism; documented explicitly per MC-07 | MC-07   |

_Per practitioner Q5-1: `FileDeploymentRepository` is the only
concrete repository. No sibling implementations exist (in-memory,
test-mock, etc.)._

### 2.4 Schemas (`src/schemas/`)

| Component                      | File(s)       | Disposition | Rationale                                      | MC link |
| ------------------------------ | ------------- | ----------- | ---------------------------------------------- | ------- |
| Zod schemas for Diamond config | `*.schema.ts` | Keep        | Validation layer; working; documented in MC-07 | MC-07   |
| `src/schemas/index.ts`         | `index.ts`    | Keep        | Consumer-facing per MK-04                      | —       |

### 2.5 Utilities (`src/utils/`)

| Component                  | Purpose                          | Disposition                 | Rationale                                                                                                    | MC link |
| -------------------------- | -------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------ | ------- |
| `diamondAbiGenerator.ts`   | ABI generation for diamond cut   | Keep                        | Works; docs consolidate per F-25 but functionality is sound                                                  | —       |
| `configurationResolver.ts` | Config loading/resolution        | Keep                        | Working core utility                                                                                         | —       |
| `workspaceSetup.ts`        | Workspace initialization         | Keep                        | Foundational; may need minor review when `engines` field added (CC-03)                                       | MC-19   |
| `signer.ts`                | Signer abstraction               | **Upgrade**                 | MC-21 refactor touches this — signer provisioning pattern changes when key removed from strategy constructor | MC-21   |
| `txlogging.ts`             | Transaction logging              | Keep                        | Supports MK-01 auditor-reproducibility                                                                       | —       |
| `loupe.ts`                 | DiamondLoupe reading             | Keep                        | MK-08 ERC-2535 machinery                                                                                     | —       |
| `diffDeployedFacets.ts`    | Facet diff utility               | Keep                        | Supports upgrade workflows                                                                                   | —       |
| `defenderStore.ts`         | Defender state persistence       | **Retire**                  | MC-05 cascade                                                                                                | MC-05   |
| `defenderClients.ts`       | Defender SDK client wrappers     | **Retire**                  | MC-05 cascade                                                                                                | MC-05   |
| `contractMapping.ts`       | Contract-to-address mapping      | Keep                        | Core utility                                                                                                 | —       |
| `rpcStore.ts`              | RPC deployment state persistence | Keep                        | MK-02 support                                                                                                | —       |
| `common.ts`                | Shared helpers                   | Keep (+ audit during MC-19) | May contain Defender-related helpers — audit during cleanup                                                  | MC-19   |

### 2.6 Types (`src/types/`)

| Component                               | File(s)     | Disposition | Rationale                                                    | MC link |
| --------------------------------------- | ----------- | ----------- | ------------------------------------------------------------ | ------- |
| `SupportedProvider` type in `config.ts` | `config.ts` | Keep        | `any`-based definition works; refinement deferred per NTI-04 | NTI-04  |
| Other type definitions                  | various     | Keep        | MK-04 API surface; changes would be breaking                 | —       |

### 2.7 Top-level exports

| Component                              | File(s)         | Disposition            | Rationale                                                                                                     | MC link             |
| -------------------------------------- | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------- |
| `src/index.ts`                         | `index.ts`      | **Upgrade (breaking)** | Reflects MC-04 extension contract; removes Defender exports (MC-05 cascade); reflects MC-21 signature changes | MC-04, MC-05, MC-21 |
| `src/core/index.ts` (`./core` subpath) | `core/index.ts` | Keep                   | F-42 subpath export; MK-04                                                                                    | —                   |

---

## Section 3: Category 2 — Test Suites (`test/`)

| Component                                                                      | Disposition                       | Rationale                                                                | MC link |
| ------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------ | ------- |
| `test/unit/**/*` unit tests                                                    | Keep / Upgrade                    | 70 passing; coverage floor via MC-14 may add tests                       | MC-14   |
| `test/integration/rpc/rpcDeployment.test.ts`                                   | **Replace** (move or reconfigure) | MC-15 — misplaced integration tests                                      | MC-15   |
| `test/integration/DeployIncludeExclude.test.ts`                                | **Upgrade**                       | MC-17 — explicit verification of `deployInclude` override semantics      | MC-17   |
| External-libraries test file                                                   | **Net-new**                       | MC-16 — no current test file exists for Issue #9 (per practitioner Q5-2) | MC-16   |
| Test fixtures (`test/fixtures/*`)                                              | Keep (Upgrade as needed)          | Support test expansion under MC-14                                       | —       |
| Reference to `test-mock-verify.js` (non-existent file, listed in `.npmignore`) | **Retire** (reference only)       | F-07 / MC-19                                                             | MC-19   |

---

## Section 4: Category 3 — Scripts (`scripts/`)

Per practitioner Q5-3: **all contents of `scripts/` are old/outdated**.
This is a complete directory Retire with replacement example scripts
emerging from MC-07 (narrative docs + working examples).

### 4.1 Top-level scripts

| Component                          | Disposition | Rationale                         |
| ---------------------------------- | ----------- | --------------------------------- |
| `scripts/deploy-rpc.ts`            | **Retire**  | Outdated example per practitioner |
| `scripts/upgrade-rpc.ts`           | **Retire**  | Outdated example                  |
| Any other top-level `scripts/*.ts` | **Retire**  | All outdated per practitioner     |

### 4.2 `scripts/deploy/` subdirectory

| Component | Disposition | Rationale                |
| --------- | ----------- | ------------------------ |
| All files | **Retire**  | Outdated example scripts |

### 4.3 `scripts/setup/` subdirectory

| Component | Disposition | Rationale                           |
| --------- | ----------- | ----------------------------------- |
| All files | **Retire**  | Confirmed outdated per practitioner |

### 4.4 `scripts/devops/` subdirectory

Per F-02, all gnus-dao orphans:

| Component                               | Disposition |
| --------------------------------------- | ----------- |
| `provenance-validator.ts`               | **Retire**  |
| `slsa-attestation.ts`                   | **Retire**  |
| `supply-chain-risk-assessment.ts`       | **Retire**  |
| `smart-trigger.ts`                      | **Retire**  |
| `health-check.ts`                       | **Retire**  |
| `maintenance-automation.ts`             | **Retire**  |
| `incident-response.ts`                  | **Retire**  |
| `security-health-checks.ts`             | **Retire**  |
| `security-commit-check.ts`              | **Retire**  |
| `security-tool-updater.ts`              | **Retire**  |
| `container-registry-manager.sh`         | **Retire**  |
| `devcontainer-setup-validation.sh`      | **Retire**  |
| `devcontainer-performance-benchmark.sh` | **Retire**  |
| `environment-parity-validation.sh`      | **Retire**  |

### 4.5 Net-new replacement examples

Produced by MC-07 (scope amended to include working example scripts
per practitioner Q5-3 resolution):

| Component                                 | Disposition | Rationale                                          |
| ----------------------------------------- | ----------- | -------------------------------------------------- |
| Minimal `LocalDeploymentStrategy` example | **Net-new** | MC-07 — paired with narrative docs; verified in CI |
| Minimal `RPCDeploymentStrategy` example   | **Net-new** | MC-07 — paired with narrative docs; verified in CI |
| README for examples                       | **Net-new** | MC-07 — explains each example                      |

**Cross-repo option:** Practitioner flagged gnus-ai / gnus-dao as
potential source for proven deployment-script patterns. Phase 2
decides whether to port-and-adapt or author fresh.

---

## Section 5: Category 4 — Dependencies (`package.json`)

### 5.1 Runtime dependencies (`"dependencies"`)

| Dependency | Current  | Disposition                             | Rationale                                                                                                                                                                          | MC link |
| ---------- | -------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `axios`    | ^1.12.2  | **Upgrade**                             | MC-01 — bump to ^1.15.0 (CVE resolution)                                                                                                                                           | MC-01   |
| `lodash`   | ^4.17.21 | **Upgrade OR Replace** (Phase 2 choice) | MC-01 — **Branch A**: patch bump ^4.17.24+; **Branch B**: replace with native JS or `es-toolkit` for permanent CVE-surface reduction. Outcome-equivalent; Phase 2 picks mechanism. | MC-01   |
| `debug`    | current  | Keep                                    | Standard; no advisories                                                                                                                                                            | —       |
| `fs-extra` | current  | Keep                                    | Standard; no advisories                                                                                                                                                            | —       |
| `ethers`   | ^6.4.0   | Keep                                    | Core; MK-04 API surface depends on it                                                                                                                                              | —       |
| `zod`      | ^4.0.x   | Keep                                    | Validation; stable                                                                                                                                                                 | —       |
| `chalk`    | ^4.1.2   | Keep                                    | Terminal coloring; CJS-compatible version                                                                                                                                          | —       |

### 5.2 Defender-related devDependencies (all Retire)

| Dependency                                   | Disposition | Rationale     | MC link |
| -------------------------------------------- | ----------- | ------------- | ------- |
| `@openzeppelin/defender-sdk`                 | **Retire**  | MC-05         | MC-05   |
| `@openzeppelin/defender-sdk-proposal-client` | **Retire**  | MC-05         | MC-05   |
| Any other `@openzeppelin/defender-*`         | **Retire**  | MC-05 cascade | MC-05   |

### 5.3 Jest family (all Retire per TD-02)

| Dependency    | Disposition | MC link       |
| ------------- | ----------- | ------------- |
| `jest`        | **Retire**  | MC-19 / TD-02 |
| `jest-mock`   | **Retire**  | MC-19 / TD-02 |
| `ts-jest`     | **Retire**  | MC-19 / TD-02 |
| `@types/jest` | **Retire**  | MC-19 / TD-02 |

### 5.4 Unused / unjustified devDependencies (all Retire per Q5-6..8)

Net-new retirements surfaced during Step 05 catalog construction:

| Dependency            | Disposition | Rationale                                                                                                                                             | MC link                |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `@socketsecurity/cli` | **Retire**  | Unused in husky; redundant with Snyk+OSV for CVE coverage; behavioral-analysis value-add not justified vs. MK-06 maintenance cost (per Q5-6 analysis) | MC-19 (expanded scope) |
| `web3`                | **Retire**  | Confirmed unused in `src/` and `test/` (per Q5-7); ethers is the deployment-interface stack; large dependency with own CVE surface                    | MC-19 (expanded scope) |
| `winston`             | **Retire**  | Confirmed unused (per Q5-8); `debug` serves existing logging needs                                                                                    | MC-19 (expanded scope) |
| `abi2oas`             | **Retire**  | Confirmed unused (per Q5-8); OpenAPI-from-ABI generation is not in Diamonds scope                                                                     | MC-19 (expanded scope) |
| `uint32`              | **Retire**  | Confirmed unused (per Q5-8)                                                                                                                           | MC-19 (expanded scope) |
| `@types/uint32`       | **Retire**  | Corresponding types; retire with parent                                                                                                               | MC-19 (expanded scope) |

### 5.5 Build & test stack (Keep)

| Dependency                                                 | Disposition         | Rationale                                                                                                                  |
| ---------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `hardhat`                                                  | **Keep at current** | v2.28.0 pin per practitioner Q5-5; further 2.x bumps carry dependency-interaction risk; NTI-08 covers Hardhat 3 trajectory |
| `@typechain/*`, `typechain`                                | Keep                | Working; no advisories                                                                                                     |
| `mocha`, `chai`, `chai-as-promised`, `sinon`, `sinon-chai` | Keep                | Test stack; working                                                                                                        |
| `hardhat-abi-exporter`, `hardhat-gas-reporter`             | Keep                | Working plugins                                                                                                            |
| `solidity-coverage`                                        | **Keep**            | Ensures Diamonds compiles cleanly with it; compat test belongs in `diamonds-dev-env` per F-18 (not this repo's concern)    |

### 5.6 Tooling / linting / formatting

| Dependency                                               | Disposition    | Rationale                                       | MC link |
| -------------------------------------------------------- | -------------- | ----------------------------------------------- | ------- |
| `eslint` + `@typescript-eslint/*`                        | Keep / Upgrade | MC-20 linting decision may update config        | MC-20   |
| `eslint-plugin-*` (security, promise, n, node, prettier) | Keep           | Various plugins; working                        | —       |
| `prettier`, `prettier-plugin-solidity`                   | Keep           | Working                                         | —       |
| `solhint`                                                | Keep           | Solidity linting                                | —       |
| `husky`                                                  | Keep           | MK-09 preserves; MC-02 fixes bugs within config | MC-02   |
| `lint-staged`                                            | Keep           | Supports MC-20 pre-commit linting               | MC-20   |

### 5.7 Security scanners (Keep; MC-02 fixes gate bugs)

| Dependency                                        | Disposition | Rationale                                                              | MC link      |
| ------------------------------------------------- | ----------- | ---------------------------------------------------------------------- | ------------ |
| `snyk`                                            | Keep        | CI integration via MC-11; MC-02 fixes authentication-handling in husky | MC-02, MC-11 |
| `semgrep`                                         | Keep        | Local + CI via MC-11                                                   | MC-11        |
| `slither-analyzer` (via venv/pip in DevContainer) | Keep        | Contract static analysis                                               | —            |
| `git-secrets`                                     | Keep        | Secret detection                                                       | —            |

### 5.8 Other devDependencies

| Dependency                    | Disposition                        | Rationale                                             |
| ----------------------------- | ---------------------------------- | ----------------------------------------------------- | ----- |
| `typescript`                  | Keep (Phase 2 may bump within 5.x) | Current 5.9.3 is recent                               |
| `ts-node`                     | Keep                               | Working                                               |
| `dotenv`                      | Keep                               | Used for `.env` loading                               |
| `concurrently`                | Keep                               | Script utility                                        |
| `globals`                     | Keep                               | eslint requirement                                    |
| `rimraf`                      | Keep                               | Used in `clean` script                                |
| `contracts-starter`           | **Upgrade (pin)**                  | TD-03 / MC-19 — pin to specific commit SHA or replace | MC-19 |
| `hardhat-multichain`          | Keep (workspace link)              | Used in test configuration                            |
| `hardhat` resolution override | Keep                               | Yarn resolution pin for `2.28.0` compatibility        |

---

## Section 6: Category 5 — Configuration Artifacts

| Component                                              | Disposition                | Rationale                                                                                    | MC link                    |
| ------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------- |
| `package.json`                                         | **Upgrade** (many changes) | Version to v2.0, `engines` field (CC-03), script cleanup (MC-19), deps cleanup (MC-01/05/19) | MC-01, MC-05, MC-19, CC-03 |
| `tsconfig.json`                                        | Keep                       | Working                                                                                      | —                          |
| `tsconfig.dev.json`                                    | Keep (verify use)          | Confirm during MC-19 cleanup whether actively referenced                                     | MC-19                      |
| `eslint.config.mjs`                                    | Upgrade                    | MC-20 linting decision may amend rules                                                       | MC-20                      |
| `.prettierrc` / `.prettierrc.json` / `.prettierignore` | Keep                       | Working                                                                                      | —                          |
| `.solhint.json` / `.solhintignore`                     | Keep                       | Working                                                                                      | —                          |
| `.husky/pre-commit`                                    | Upgrade                    | MC-20 linting decision may amend                                                             | MC-20                      |
| `.husky/pre-push`                                      | **Upgrade (CRITICAL)**     | **MC-02 — fix silent-failure bugs**; highest-leverage single fix in entire cycle             | MC-02                      |
| `.yarnrc.yml`                                          | Keep                       | yarn 4 config; working                                                                       | —                          |
| `.gitignore`                                           | Keep                       | Working (may add `.nyc_output/` for MC-14 coverage)                                          | MC-14                      |
| `.npmignore`                                           | Upgrade                    | Remove `test-mock-verify.js` ref (F-07) and `tslint.json` ref (F-22)                         | MC-19                      |
| `.env.example` / `.env.ci`                             | Upgrade                    | MC-07 docs; MC-21 may change which vars documented (key handling)                            | MC-07, MC-21               |
| `.lintstagedrc`                                        | Keep (Upgrade via MC-20)   | lint-staged config                                                                           | MC-20                      |
| `.vscode/` directory                                   | Keep                       | Developer experience; not consumer-facing                                                    | —                          |

---

## Section 7: Category 6 — Documentation Artifacts

Per practitioner Q5-9: `docs/` contains 14 items.

### 7.1 `docs/` Directory Catalog (Complete)

| #   | File                                          | Disposition                                                                    | Rationale                                                                                                             | MC link             |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | `DIAMOND_ABI_CONFIGURATION_SUMMARY.md`        | **Replace** (consolidate → single ABI reference doc)                           | F-25 / TD-12 — six ABI docs consolidate to 1-2                                                                        | MC-06 / MC-07       |
| 2   | `DIAMOND_ABI_GENERATION.md`                   | **Replace** (consolidate)                                                      | F-25                                                                                                                  | MC-06 / MC-07       |
| 3   | `DIAMOND_ABI_GENERATOR_EXAMPLES.md`           | **Replace** (consolidate)                                                      | F-25                                                                                                                  | MC-06 / MC-07       |
| 4   | `DIAMOND_ABI_GENERATOR_IMPLEMENTATION.md`     | **Replace** (consolidate)                                                      | F-25                                                                                                                  | MC-06 / MC-07       |
| 5   | `DIAMOND_ABI_GENERATOR_QUICK_REFERENCE.md`    | **Replace** (consolidate)                                                      | F-25                                                                                                                  | MC-06 / MC-07       |
| 6   | `README_DIAMOND_ABI_GENERATOR.md`             | **Replace** (consolidate)                                                      | F-25                                                                                                                  | MC-06 / MC-07       |
| 7   | `README-DEFENDER.md`                          | **Retire**                                                                     | MC-09                                                                                                                 | MC-09               |
| 8   | `ROADMAP.md`                                  | **Upgrade / Replace**                                                          | "Production Ready" claim questionable; Phase 2 decides format (rewrite, move to GitHub Milestones / Projects, remove) | TD-12               |
| 9   | `defender-integration.md`                     | **Retire**                                                                     | MC-09                                                                                                                 | MC-09               |
| 10  | `diamond_module-BaseStrategy_design-v2.uxf`   | **Keep** (paired with PNG)                                                     | F-40 — core onboarding artifact; MC-07 will reference                                                                 | MC-07               |
| 11  | `diamond_module-BaseStrategy_design.uxf` (v1) | **Retire**                                                                     | V1 superseded by V2                                                                                                   | MC-19               |
| 12  | `monitoring-troubleshooting.md`               | **Replace**                                                                    | MC-09 — retire Defender sections; rewrite salvageable non-Defender content, or full rewrite                           | MC-09 / MC-07       |
| 13  | `testing-guide.md`                            | **Upgrade**                                                                    | TD-12 — refresh to match current test architecture (F-18 division, MC-14 coverage, MC-15 integration-test relocation) | MC-07, MC-14, MC-15 |
| 14  | `assets/image.png` (v2 UXF rendered)          | **Keep** (**rename**: `diamond_module-BaseStrategy_design-v2.png` for clarity) | Per practitioner Q5-9 — portable-format export of v2 UXF already exists                                               | MC-07               |

### 7.2 Root-level documentation

| Component                         | Disposition                       | Rationale                                                                                                                       | MC link          |
| --------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `README.md`                       | **Upgrade**                       | MC-10 — productization framing; adopter + auditor personas; F-41 reproducibility surfaced as feature; RPC production path clear | MC-10            |
| `LICENSE`                         | Keep                              | MIT; standard                                                                                                                   | —                |
| `CHANGELOG.md`                    | **Net-new**                       | MC-13                                                                                                                           | MC-13            |
| `CONTRIBUTING.md` (if present)    | **[CONFIRM / Net-new if absent]** | Productization — external contributor on-ramp                                                                                   | MC-07            |
| `SECURITY.md` (if present)        | **[CONFIRM / Net-new if absent]** | Productization — security-issue reporting channel                                                                               | MC-07, SR-06     |
| `CODE_OF_CONDUCT.md` (if present) | **[CONFIRM / Net-new if absent]** | Standard OSS expectation; low-effort Net-new                                                                                    | Phase 2 decision |

### 7.3 Net-new documentation required by MCs

| Component                                    | Disposition | Rationale                                          | MC link      |
| -------------------------------------------- | ----------- | -------------------------------------------------- | ------------ |
| Generated API reference                      | **Net-new** | MC-06                                              | MC-06        |
| ERC-2535 primer for adopters                 | **Net-new** | MC-07                                              | MC-07        |
| `BaseDeploymentStrategy` lifecycle narrative | **Net-new** | MC-07 / F-40                                       | MC-07        |
| `RPCDeploymentStrategy` usage narrative      | **Net-new** | MC-07                                              | MC-07        |
| `LocalDeploymentStrategy` usage narrative    | **Net-new** | MC-07                                              | MC-07        |
| How-to-write-a-new-strategy doc              | **Net-new** | MC-07 supports MC-04 extension contract            | MC-07, MC-04 |
| Auditor reproducibility doc                  | **Net-new** | MC-07 / F-41 surfaced as feature                   | MC-07        |
| Secure key handling guidance                 | **Net-new** | MC-07 / SR-03 / MC-21 support                      | MC-07, MC-21 |
| Working example scripts + README             | **Net-new** | MC-07 expanded scope (replaces retired `scripts/`) | MC-07        |
| Documentation site infrastructure            | **Net-new** | MC-08                                              | MC-08        |

### 7.4 Documentation disposition summary

Diamonds ends this cycle with **fewer total files in `docs/` but
correct weighting**. Six ABI-generator docs consolidate to 1-2.
Two Defender docs retire. One UXF v1 retires. Net: 14 items → 8-9
items in `docs/`, **plus** significant net-new narrative content
(via MC-07) published through the docs site (MC-08).

**This is productization at the docs layer:** Less volume; more signal.

---

## Section 8: Category 7 — Build & Tooling Artifacts

| Component                           | Disposition | Rationale                                                   | MC link |
| ----------------------------------- | ----------- | ----------------------------------------------------------- | ------- |
| Plain `tsc` build                   | Keep        | IC-01 released as incidental; bundler is NTI-02             | —       |
| `npx hardhat compile` for contracts | Keep        | Working                                                     | —       |
| `hardhat-abi-exporter` config       | Keep        | Working                                                     | —       |
| Diamond ABI generation pipeline     | Keep        | Core tooling; F-25 docs consolidate but functionality stays | —       |
| Clean targets (`rimraf`-based)      | Keep        | Working                                                     | —       |

---

## Section 9: Category 8 — CI/CD Artifacts

Almost all Net-new per Step 02 §2.2. None exist currently.

| Component                                             | Disposition                    | Rationale                                                                            | MC link      |
| ----------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------ | ------------ |
| `.github/workflows/ci.yml` (main PR gates)            | **Net-new**                    | MC-11 — tests, coverage floor, lint, security scans                                  | MC-11        |
| `.github/workflows/publish.yml` (release workflow)    | **Net-new**                    | MC-12 (amended) — CI-driven publish with `--provenance`, release-evidence artifact   | MC-12        |
| `.github/workflows/dev-env-smoke.yml` (or equivalent) | **Net-new**                    | MC-22 — dev-env integration smoke test                                               | MC-22        |
| Dependabot config (`.github/dependabot.yml`)          | **Net-new**                    | Candidate mechanism for MC-01 (CVE remediation) and MC-03 (lockfile refresh cadence) | MC-01, MC-03 |
| GitHub Secrets configuration                          | **Net-new**                    | Required: Snyk auth token, npm publish token, OIDC for provenance                    | MC-11, MC-12 |
| Branch protection rules                               | **Net-new**                    | MC-11 gates enforced via branch protection                                           | MC-11        |
| CODEOWNERS (optional)                                 | **Net-new (Phase 2 decision)** | Governance signal; low-effort add                                                    | Phase 2      |

---

## Section 10: Disposition Summary & Cross-References

### 10.1 Disposition counts

| Disposition | Source code | Tests | Scripts | Deps | Configs | Docs | Build | CI/CD | Total |
| ----------- | ----------- | ----- | ------- | ---- | ------- | ---- | ----- | ----- | ----- |
| Keep        | 12          | 2     | 0       | ~25  | 8       | 2    | 5     | 0     | ~54   |
| Upgrade     | 5           | 1     | 0       | 3    | 5       | 2    | 0     | 0     | ~16   |
| Replace     | 0           | 1     | 0       | 0    | 0       | 7    | 0     | 0     | ~8    |
| Retire      | 4           | 0     | ~18     | 12   | 0       | 3    | 0     | 0     | ~37   |
| Net-new     | 0           | 1     | 3       | 0    | 0       | 10   | 0     | 7     | ~21   |

(Counts approximate; some components aggregate multiple files)

### 10.2 MC-to-component coverage map

Every MC maps to specific catalog components. Phase 2 and Phase 5
consume this mapping for planning and execution:

| MC    | Components affected                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MC-01 | `axios` (Upgrade), `lodash` (Upgrade or Replace — Phase 2 choice)                                                                                                                                 |
| MC-02 | `.husky/pre-push` (Upgrade — bug fix)                                                                                                                                                             |
| MC-03 | `package.json` resolutions + new Dependabot config                                                                                                                                                |
| MC-04 | `src/core/index.ts`, `src/strategies/index.ts`, `src/index.ts` (Upgrade); narrative extension-contract doc (Net-new); stubbed sibling prototype (Net-new, possibly external)                      |
| MC-05 | `OZDefenderDeploymentStrategy.ts`, `defenderStore.ts`, `defenderClients.ts` (all Retire); `@openzeppelin/defender-sdk-*` (Retire); `defender:*` scripts (Retire)                                  |
| MC-06 | API reference documentation (Net-new); docs-generator tooling config (Net-new)                                                                                                                    |
| MC-07 | 10+ net-new narrative docs; working example scripts (Net-new); various `src/*/index.ts` upgrades                                                                                                  |
| MC-08 | Documentation site infrastructure (Net-new); MC-06 + MC-07 content hosting                                                                                                                        |
| MC-09 | `README-DEFENDER.md`, `defender-integration.md` (Retire); `monitoring-troubleshooting.md` (Replace — retire Defender sections)                                                                    |
| MC-10 | `README.md` (Upgrade)                                                                                                                                                                             |
| MC-11 | `.github/workflows/ci.yml` (Net-new); branch protection; GitHub Secrets                                                                                                                           |
| MC-12 | `.github/workflows/publish.yml` (Net-new) with `--provenance`                                                                                                                                     |
| MC-13 | `CHANGELOG.md` (Net-new)                                                                                                                                                                          |
| MC-14 | `nyc` devDep (Net-new); CI coverage-floor config                                                                                                                                                  |
| MC-15 | `test/integration/rpc/rpcDeployment.test.ts` (Replace)                                                                                                                                            |
| MC-16 | External-libraries test file (Net-new — no existing file per Q5-2)                                                                                                                                |
| MC-17 | `test/integration/DeployIncludeExclude.test.ts` (Upgrade)                                                                                                                                         |
| MC-18 | Maintenance-policy doc (Net-new); no direct component                                                                                                                                             |
| MC-19 | ~30 retirements across scripts (`scripts/**/*`), devDeps (Jest family, Socket, web3, winston, abi2oas, uint32), orphan references (`test-mock-verify.js`, `tslint.json`), `contracts-starter` pin |
| MC-20 | `eslint.config.mjs`, `.husky/pre-commit`, `.lintstagedrc` (Upgrade)                                                                                                                               |
| MC-21 | `RPCDeploymentStrategy.ts` (Upgrade — breaking); `signer.ts` (Upgrade); `src/index.ts` (Upgrade — breaking); secure key handling doc (Net-new via MC-07)                                          |
| MC-22 | `.github/workflows/dev-env-smoke.yml` (Net-new)                                                                                                                                                   |

**All 22 MCs have concrete component mappings. No MC is
component-less.** This is the structural validation that Phase 2
has enough information to sequence Phase 5 work.

### 10.3 Scope-expansion confirmations

| MC    | Original scope                                                                      | Expanded scope (surfaced at Step 05)                                                                                                              |
| ----- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| MC-01 | Upgrade axios + lodash                                                              | Plus lodash Branch A/B choice (patch vs. replace with native/es-toolkit)                                                                          |
| MC-07 | Narrative docs                                                                      | Plus working example scripts (replaces retired `scripts/`)                                                                                        |
| MC-19 | gnus-dao devops scripts + Jest family + `.npmignore` refs + `contracts-starter` pin | Plus `@socketsecurity/cli`, `web3`, `winston`, `abi2oas`, `uint32`, `@types/uint32`, **entire** `scripts/` directory (not just `scripts/devops/`) |

---

## Section 11: Catalog-to-Phase-2 Handoff

### 11.1 Retire-ordering note

Retire work in `scripts/` and devDeps is **independent of other MCs**
(no downstream dependencies). Phase 2 can sequence these early as
"quick wins" that reduce cognitive surface for subsequent work.

**Suggested fast-retire block:**

1. `@socketsecurity/cli`, `web3`, `winston`, `abi2oas`, `uint32`,
   `@types/uint32`, Jest family — all devDep removals; one `yarn up`
   commit.
2. Entire `scripts/` directory — can retire immediately; replacement
   examples come later via MC-07.
3. `.npmignore` orphan references — trivial edits.
4. `contracts-starter` pinning — trivial.
5. `diamond_module-BaseStrategy_design.uxf` (v1) — trivial file delete.

These 5 blocks together = MC-19 completion. Probably sub-2-hour work.

### 11.2 Upgrade-ordering note

Upgrades to `RPCDeploymentStrategy`, `signer.ts`, and `src/index.ts`
(MC-21 cascade) are **breaking changes that must be coordinated**.
Phase 2 should sequence them together with MC-13 CHANGELOG
documentation and MC-07 key-handling docs as a single coherent
breaking-change block.

### 11.3 Net-new-ordering note

Net-new CI workflows (MC-11, MC-12, MC-22) depend on MC-02 (gate
fixes) completing first — otherwise CI ports broken gates to
server-side and gains nothing. Phase 2 ordering: MC-02 → MC-11/12/22
workflows.

### 11.4 Documentation-ordering note

MC-06 (generated API reference) should land before MC-07 (narrative
docs) content, because narrative docs can link to API reference
anchors. MC-08 (site) can be scaffolded in parallel with content
authorship. MC-10 (README upgrade) is last — it summarizes the full
set of deliverables that the rest of the cycle produces.

---

## Section 12: Open Confirmations for Phase 2

These items are flagged for Phase 2 resolution (not cycle-blockers for
Step 05 artifact completion):

| Item                                                             | Decision point                                     |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| `lodash` Branch A vs. B                                          | Phase 2 picks mechanism                            |
| `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` presence  | Phase 2 confirms existing state; Net-new if absent |
| `tsconfig.dev.json` active use                                   | Phase 2 confirms during MC-19 cleanup              |
| Example scripts: port from gnus-ai/gnus-dao vs. author fresh     | Phase 2 design choice under MC-07                  |
| Specific OSS doc-site tool (MkDocs / MDBook / Docusaurus / etc.) | Phase 2 evaluates under MC-08                      |
| Coverage floor percentage                                        | Phase 2/3 sets under MC-14                         |

---

## Section 13: Source & Evidence Register

- **Catalog-construction source:** Step 01 technology inventory,
  Step 02 dependency scans, Step 03 Must-Change register, Step 04
  risk / debt inventory, package.json inspection
- **Practitioner decisions in Step 05:**
- Q5-1: `FileDeploymentRepository` is only concrete repository
- Q5-2: No existing external-libraries test file (MC-16 is Net-new)
- Q5-3: All of `scripts/` is Retire; MC-07 scope expands to include
  replacement examples
- Q5-4: `lodash` Replace option on the table
- Q5-5: Hardhat 2.28.0 freeze; NTI-08 covers Hardhat 3
- Q5-6: `@socketsecurity/cli` Retire
- Q5-7: `web3` Retire
- Q5-8: `winston`, `abi2oas`, `uint32`, `@types/uint32` all Retire
- Q5-9: 14 items in `docs/`; v1 UXF Retire; PNG rendering already
  exists and should be renamed for clarity
- **Scope amendment confirmations:** MC-07 expanded (example scripts),
  MC-19 expanded (5 additional devDep retirements + entire `scripts/`
  directory), MC-01 mechanism-choice clarified
- **No net-new Must-Changes** emerged from Step 05 that remained
  standalone; MC-23 candidate was folded into MC-07 per practitioner
  decision

### 13.1 Register state at end of Step 05

| Register        | Count | Change from Step 04                 |
| --------------- | ----- | ----------------------------------- |
| Must-Keep       | 9     | Unchanged                           |
| Must-Change     | 22    | Unchanged (MC-23 folded into MC-07) |
| Nice-to-Improve | 9     | Unchanged                           |
| Incidental      | 8     | Unchanged                           |

---

_Part of the Phase 1 Information Gathering (Existing Projects) Tool Set_
_AI-Centric Software Development Playbook — Dogfooding on Diamonds_
_Previous artifact: Step 04 — Risk, Constraint & Technical Debt Inventory_
_Next artifact: Step 06 — Current-State Information Report Synthesis_
