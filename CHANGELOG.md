# Changelog

All notable changes to `@diamondslab/diamonds` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.3.3]: https://github.com/DiamondsLab/diamonds/compare/v1.3.2...v1.3.3
