# Changelog

All notable changes to `@diamondslab/diamonds` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `exports` back-compat subpaths: `./dist/*` (types + default) and `./package.json`,
  unblocking deep imports such as `dist/repositories/FileDeploymentRepository`
  (previously rejected by exports encapsulation).
- `CHANGELOG.md` now ships in the published tarball (`files` whitelist).
- `engines` field (`node >=18`, `yarn >=4`).

### Changed

- `package.json` metadata: standard `author` + `contributors` (replaces non-standard
  `authors` array), object-form `repository` with correct DiamondsLab casing.
- Single ignore strategy: `.npmignore` removed; anchored `files` whitelist — `npm pack`
  and `yarn pack` now produce identical tarballs (88 files; previously 171 vs 175).
- Source maps and declaration maps are no longer emitted or shipped (they referenced
  a `src/` directory that was never published, so they were broken in consumers).

### Removed

- Legacy `.travis.yml` and `tslint.json`.

### Fixed

- Package-level `yarn build` / `yarn test` were broken by a stale `yarn.lock`
  (`@diamondslab/hardhat-diamonds` pinned to an old range); lockfile refreshed.

## [1.4.1] - 2026-07-01

### Fixed

- **Standalone imports:** the package is importable outside this monorepo again.
  `zod` moved from devDependencies to dependencies (the published `.d.ts` files expose
  zod-derived types that consumers could not resolve), and
  `@openzeppelin/defender-sdk` is now lazy-loaded on the deprecated OZDefender path
  (`defenderClients` + `OZDefenderDeploymentStrategy`), so importing the package root
  no longer requires it. The optional `.env` load is guarded.

## [1.4.0] - 2026-06-30

### Changed

- **Selector resolution:** extracted a pure selector-resolution core
  (`src/resolution`) behind the deployment strategies, covered by a new unit
  (oracle) + integration test suite.

### Fixed

- `deployInclude` is now **additive** — listed selectors are added on top of the
  facet's own selectors instead of replacing them.
- `deployExclude` on an upgrade now emits the Remove cut with `address(0)` as
  required by EIP-2535 (it previously used the facet address, producing an
  invalid cut).

### Removed

- Dead `higherPrioritySplit` branch in the selector-resolution path.

## [1.3.3] - 2026-06-27

### Fixed

- **Build / types:** Pinned `@nomicfoundation/hardhat-ethers` to `^3.1.2`. It was
  floated to `*`, which under a standalone install resolved to the Hardhat 3 plugin
  (v4) and broke the build: `hre.ethers` lost its type augmentation
  (`Property 'ethers' does not exist on type 'HardhatRuntimeEnvironment'`) and a
  second `ethers` copy caused `Signer`/`Provider` type mismatches in `src/utils/signer.ts`.
- **Deployment:** `BaseDeploymentStrategy` now emits replace facet selectors for
  `deployInclude` (they were previously omitted).
- **Signers:** `impersonateAndFundSigner` constructs a `JsonRpcSigner` directly for a
  `JsonRpcProvider` instead of calling `getSigner()`, which throws "invalid account"
  for impersonated accounts under ethers v6.
- **TypeScript:** Removed `downlevelIteration` from `tsconfig.json`.
- **Build:** `build` now runs `rimraf dist tsconfig.tsbuildinfo && tsc`, so a stale
  incremental cache can no longer produce an empty `dist/` (e.g. after `rm -rf dist`).
- **`diamond-abi` CLI:** Restored — the source had been accidentally deleted by an
  unrelated commit. It now ships as a working `bin`: moved to `src/cli/diamond-abi-cli.ts`
  (so it compiles into `dist/cli/`), Hardhat is loaded lazily so `validate` and `compare`
  run without a chain, and `bin` points at `dist/cli/diamond-abi-cli.js`. The previous
  `bin` (`dist/scripts/diamond-abi-cli.js`) was never produced and never worked.

### Added

- `LICENSE` file (MIT). It was declared in `package.json` (`license` + `files[]`) but
  was missing from the package.

### Changed

- Rewrote `README.md` and corrected docs: package name `@geniusventures/diamonds` →
  `@diamondslab/diamonds`, `yarn` commands instead of `npm`, all imports use the package
  root (the `/strategies` and `/utils` subpaths are not exported), and
  `OZDefenderDeploymentStrategy` is marked legacy.

[Unreleased]: https://github.com/DiamondsLab/diamonds/compare/v1.4.1...HEAD
[1.4.1]: https://github.com/DiamondsLab/diamonds/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/DiamondsLab/diamonds/compare/v1.3.3...v1.4.0
[1.3.3]: https://github.com/DiamondsLab/diamonds/compare/v1.3.2...v1.3.3
