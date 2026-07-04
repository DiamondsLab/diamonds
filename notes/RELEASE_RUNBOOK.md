# Release Runbook — `@diamondslab/diamonds`

Step-by-step procedure to cut a release via the **tag-triggered OIDC pipeline**
(`.github/workflows/release.yml`). Supersedes the manual `yarn npm publish` flow
(pre-1.5.0). **[Eng]** = any maintainer/contributor; **[Owner]** = DiamondsLab org
admin + npm `@diamondslab` access (privileged — do **not** automate around).

- **Package:** `@diamondslab/diamonds` (public scope) · **Registry:** npmjs.com
- **Repo:** <https://github.com/DiamondsLab/diamonds> (git submodule of `diamonds-dev-env`)
- **Toolchain:** Node ≥ 18 (`engines`), Yarn `4.10.3` (`packageManager`)
- **Tag convention:** `vX.Y.Z` — **the tag IS the publish trigger**
- Run all commands from `packages/diamonds/` unless a step says otherwise.

> Instantiated from the fleet productization kit (M1-E5, 2026-07-04). First cut on this
> runbook: **v1.5.0**. SemVer + Conventional Commits + Keep a Changelog.
> **Publishing is irreversible** — rehearse (§6) before the tag push; recovery is
> forward-only (§7). Replace `X.Y.Z` throughout.

---

## 0. Preflight — [Eng], gated by [Owner]

- [ ] Working tree clean on `release/vX.Y.Z` (`git status`).
- [ ] `yarn build && yarn test` green locally. (*No lint gate yet: eslint reports a
      pending formatting backlog — see the CI note in `.github/workflows/ci.yml`.*)
- [ ] CI green on the release branch (Actions tab).
      **Package-specific:** pushing from a local clone runs the **pre-push security
      hook** (~2+ min; slither currently blocks on pre-existing findings) — pushes may
      need Owner judgment until the hook rework lands.
- [ ] **[Owner]** npm Trusted Publisher for `@diamondslab/diamonds` bound to
      `DiamondsLab/diamonds` + `release.yml`, **"Allow npm Stage publish" enabled**;
      branch protection + Actions permissions per the fleet `OWNER_GATE_CHECKLIST.md`.
- [ ] Consumer-green fast+full tiers pass (fleet `CONSUMER_GREEN_PROCEDURE.md`).
- [ ] **[Owner]** decide: any in-flight branch content (e.g. security-gates work) in or
      out of this cut. The release ships only what is merged + changelogged.

## 1. Version bump — [Eng]

```bash
npm pkg set version=X.Y.Z         # never `npm version` / `yarn version` (auto-tag risk)
node -p "require('./package.json').version"
```

## 2. Finalize the changelog — [Eng]

- [ ] `## [Unreleased]` → `## [X.Y.Z] - YYYY-MM-DD`; fresh `[Unreleased]` above it.
- [ ] Update link refs (`[Unreleased]: …/compare/vX.Y.Z...HEAD`; add the new tag ref).

## 3. Build + pack audit — [Eng]

```bash
yarn build
npm pack --dry-run
```

- [ ] Manifest matches the **M1-E2 baseline: 88 files** (~70 kB packed / ~323 kB
      unpacked): `dist/**` (no `.map`), `LICENSE`, `README.md`, `CHANGELOG.md`,
      `package.json`. **Excludes** `src/`, tests, `.github/`, community docs, cruft.
- [ ] `npm pack`; install the tarball into a throwaway project; probe all four entry
      points: `.`, `./core`, `./dist/repositories/FileDeploymentRepository`,
      `./package.json`.

```bash
git add package.json CHANGELOG.md && git commit -m "release: vX.Y.Z"
```

## 4. Merge to `main` + tag — [Owner]

- [ ] **[Owner]** approve + merge the PR `release/vX.Y.Z` → `main` (CI green).
- [ ] **[Owner]** push the tag — **this triggers the irreversible publish**:

```bash
git checkout main && git pull
git tag vX.Y.Z && git push origin vX.Y.Z    # -> release.yml publishes with provenance
```

> Tag-only trigger; nothing publishes on branches/PRs. If the local pre-push hook
> blocks the tag push on pre-existing findings, the Owner may create the ref via
> `gh api repos/DiamondsLab/diamonds/git/refs -f ref=refs/tags/vX.Y.Z -f sha=<sha>`
> — same publish trigger, Owner-decided.

## 5. Verify the publish — [Owner/Eng]

- [ ] `Release` workflow run green (Actions tab).
- [ ] `npm view @diamondslab/diamonds version` → `X.Y.Z`; provenance badge on npmjs.com.
- [ ] Clean install resolves the four entry points (commands in §3).

## 6. Dry-run rehearsal — [Eng] (run BEFORE §4)

```bash
npm publish --dry-run    # version + file list, no upload
npm pack                 # tarball for the throwaway install test
```

Then build the consuming monorepo from its root (`yarn compile`) and run the
consumer-green fast+full tiers.

## 7. Rollback / recovery

**Before the tag push:** delete the local tag / don't push; revert the `main` merge if
needed. **After publish (irreversible — npm forbids re-publishing a version):**

```bash
npm deprecate '@diamondslab/diamonds@X.Y.Z' 'Broken release — use X.Y.(Z+1)'
# fix forward: repeat §1–§5 with X.Y.(Z+1)
npm dist-tag add @diamondslab/diamonds@X.Y.(Z+1) latest   # if latest points at the bad one
```

## 8. Post-release — [Eng]

- [ ] Bump the monorepo root submodule pointer to the release commit; root builds green.
- [ ] **Refresh the `packages/hardhat-diamonds` nested copy** (`yarn install` in that
      submodule) so its standalone tests see the new version; re-run consumer-green
      check (d) on that edge (fleet M0-E3 finding F1).
- [ ] (Optional) **[Owner]** GitHub Release with the `[X.Y.Z]` changelog section.
- [ ] Known gap: `v1.3.3` was never tagged — push that tag if the `[1.4.0]`
      changelog compare link should resolve.
