# Pre-Push Security Gates — Project Plan

> **Status:** 📋 Plan of record — for owner approval · **Author:** Engineer (with Claude) · **Date:** 2026-07-03
> **Repo:** `@diamondslab/diamonds` submodule (`packages/diamonds/`) — its own git repo. All configs/hooks referenced live at that repo root (`.husky/`, `slither.config.json`, `.semgrep.yml`, `package.json`).
> **Governing constraint:** `.husky/pre-push` must pass **end-to-end inside the devcontainer** and a **protected-branch push (`main`/`develop`) must succeed without `--no-verify`**. No security posture is weakened without a documented, owner-visible rationale.
> **Architecture doc:** none — this is a fix/hardening project with no system design; the plan alone governs.

## 1. How to read this plan

Work is decomposed into **milestones** (`M0`…`M4`, zero-indexed; `M0` = groundwork) and **epics** (`M<n>-E<m>`). Each milestone is an independently-valuable, releasable deliverable that leaves the repo in a working state; each epic is a coherent unit of work. IDs are stable handles for the rest of the pipeline (`/breakout-milestone → /breakout-epics → /create-prd → /generate-tasks → /process-task-list`). One role throughout: **Engineer** (executes), with **Owner** gates called out explicitly for outward-facing/irreversible actions.

## 2. Objectives & success criteria

| # | Objective | Measurable definition of done |
|---|-----------|-------------------------------|
| O1 | **npm audit gate green** | `yarn npm audit --severity moderate` exits 0 (all **26** advisories — 13 high + 13 moderate, axios+lodash+transitive — cleared) |
| O2 | **semgrep gate green** | `yarn semgrep:scan` exits 0 (0 blocking findings) — real issues fixed, non-applicable rules scoped/annotated with rationale |
| O3 | **slither gate removed** | slither is no longer a blocking pre-push step; removal is documented (tooling repo; contracts are test-only fixtures) |
| O4 | **git-secrets gate green** | `yarn git-secrets:scan` clean (already passing — guard against regression) |
| O5 | **Hook runs in-container** | `.husky/pre-push` and `.husky/pre-commit` complete inside the devcontainer without hitting the yarn `findPackageLocation` state-file bug |
| O6 | **Heavy checks off the local push gate** | Tests + slither no longer block the pre-push hook; test enforcement is via the monorepo suite / manual runs — **CI is out of scope** |
| **Gate** | **Acceptance** | **A real push to `main` (or `develop`) succeeds without `--no-verify` or `EMERGENCY_BYPASS`, with the pre-push hook running and passing.** |

## 3. Guiding execution principles

- **Reversible-first.** Every change is a small, revertable commit; hook/config edits are trivially rolled back.
- **One gate at a time.** Land audit → semgrep → slither → hook/CI in order; keep the suite green after each.
- **Don't weaken silently.** Removing/scoping a gate (slither, semgrep rules, tests) requires a written rationale in the repo, visible to the owner. Test enforcement stays with the monorepo suite / manual runs — **CI is explicitly out of scope**, so nothing is moved to a CI backstop.
- **Tooling-repo lens.** `@diamondslab/diamonds` is a **TypeScript library/tool**, not a smart-contract product; the Solidity contracts in-repo exist only as **test fixtures**. Contract-security analyzers (slither, and semgrep's Solidity rules) are applied with that in mind.
- **Owner-gate outward-facing actions.** The final protected-branch push and any CI/secret/Actions enablement are owner-visible, explicit steps — never routed around.
- **Devcontainer reality.** Prefer direct binaries / `npm run` over `yarn <script>` inside hooks, because `yarn`'s node-modules linker hits a `findPackageLocation` state-file bug in this container (same root cause as the broken `yarn workspace:build`).

## 4. Milestone map (at a glance)

| ID | Title | Outcome | Impact / Risk |
|----|-------|---------|---------------|
| **M0** | Baseline & Reliable Scan Harness | Every pre-push gate reproducible in-container; all current findings enumerated + baselined | Low — read-only groundwork |
| **M1** | Audit Gate: Remove Unused Vulnerable Deps | `yarn npm audit` green (**26** advisories cleared: 13 high + 13 moderate) | Low-Med — **axios + lodash are unused direct deps** (removable, no breaking upgrade); residual transitive advisories triaged |
| **M2** | Semgrep Gate: Triage, Scope, Fix | `yarn semgrep:scan` green (real fixes + non-applicable rules scoped) | Med — touches src + ruleset |
| **M3** | Decommission Slither | slither removed as a blocking gate, documented | Low — policy + hook/config edit |
| **M4** | Lean, Resilient Hook | Hook runs in-container (audit+semgrep+secrets); tests+slither dropped from the gate; protected-branch push succeeds unbypassed | Med — hook redesign + outward-facing push |

**Critical path:** `M0 → M1 → M2 → M3 → M4`. M1/M2/M3 clear individual blocking gates and can be reviewed independently, but the **final acceptance (unbypassed push)** lives in M4 and requires all prior gates green. M2's rule-scoping and M3's slither removal share the same tooling-repo rationale (author once in M0, apply in both).

```
M0 baseline ──► M1 audit ──► M2 semgrep ──► M3 slither ──► M4 hook ──► ✅ unbypassed push
   (harness)     (unused-deps) (triage)      (remove)      (lean+proof)
```

## 5. Milestones & epics

### M0 — Baseline & Reliable Scan Harness
**Goal:** Be able to run each pre-push gate reliably inside the devcontainer (dodging the yarn state bug) and capture the current state of every blocking finding as a baseline to measure against.
**Exit criteria:** A `baseline.md` enumerating audit / semgrep / slither / git-secrets / test results (counts, severities, rule ids, files); a documented direct-binary invocation for each gate that works in-container.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M0-E1 | Reproduce gates in-container | For each gate, find a reliable invocation that avoids `yarn <script>` (direct `semgrep`/`slither`/`git secrets`/`npm audit` or `npm run`); confirm each runs | Engineer | Groundwork |
| M0-E2 | Findings baseline | Enumerate every current blocking finding (audit: **26 — 13 high/13 mod, axios+lodash**; semgrep: **10, all `typescript-any-usage`** in `diamond-abi-cli.ts`; slither: errors; secrets: clean; tests: 51/0) into `baseline.md`; write the shared **tooling-repo rationale** note reused by M2/M3 | Engineer | Reference | *(DONE 2026-07-03)* |

### M1 — Audit Gate: Remove Unused Vulnerable Deps + Residual Remediation
**Goal:** Clear **all 26 npm-audit advisories** (13 high + 13 moderate) so `yarn npm audit --severity moderate` passes. **Root cause:** `axios` (`1.12.2`, ~23 advisories) and `lodash` (`4.17.21`, ~3) are both direct `dependencies` with **0 imports** across `src`/`scripts`/`test` → **unused, removable with no code or breaking-change impact.** *(Baseline correction: the earlier "2 lodash" figure was a truncated-output artifact — see M0 `baseline.md`.)*
**Exit criteria:** `yarn npm audit --severity moderate` → 0 findings; `yarn build` + `yarn test` still green; lockfile regenerated; any **residual (transitive)** advisory documented + resolved or accepted (owner sign-off).

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M1-E1 | Confirm unused + enumerate | Confirm `axios`+`lodash` have 0 usages anywhere (baseline: src/scripts/test = 0); from `baseline.md` list all 26 by package/severity; flag any advisory whose dependent is **transitive** (won't clear on direct removal) | Engineer | Ref |
| M1-E2 | Remove unused deps | Remove `axios` + `lodash` from `dependencies`; regenerate lock; re-audit | Engineer | Small |
| M1-E3 | Residual + verify | Resolve any residual transitive advisory (upgrade / `resolutions`) or document accepted-risk with **owner sign-off**; confirm `yarn npm audit --severity moderate` = 0; build + tests green | Engineer + Owner | Small-Med |

### M2 — Semgrep Gate: Triage, Scope, Fix
**Goal:** Take `yarn semgrep:scan` to 0 blocking findings via triage (fix genuine issues; scope/annotate non-applicable rules). *(Baseline refinement: all **10 current findings are `typescript-any-usage`** in one product file, `src/cli/diamond-abi-cli.ts` — **not** Solidity rules on fixtures. So M2 is TS `any` cleanup/annotation or tuning that one rule; the custom `.semgrep.yml` also carries Solidity-security rules (reentrancy, access-control, …), and the fixtures-scoping path below applies only if those ever fire.)*
**Exit criteria:** `yarn semgrep:scan` exits 0; every suppressed/scoped finding has a written justification; genuine code issues fixed.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M2-E1 | Enumerate & classify | List all 10 findings (rule id, file, line). Classify: **(a)** Solidity-security rules firing on **test-fixture contracts** (not-applicable — tooling repo), **(b)** TS rules (e.g. `typescript-any-usage`) = real code-quality, **(c)** genuine security issues | Engineer | Reference |
| M2-E2 | Scope non-applicable rules | For (a): scope `.semgrep.yml` `paths:`/`exclude` to skip test-fixture contracts & non-product paths (mirror slither's `filter_paths`), or narrow the rule; document why | Engineer | Med |
| M2-E3 | Fix / annotate the rest | For (b)/(c): fix genuine issues in code; where a finding is a justified false positive, add inline `# nosemgrep: <rule-id>` with a reason. Re-run to 0 blocking | Engineer | Med |

### M3 — Decommission Slither
**Goal:** Remove slither as a **blocking** gate. Rationale (owner-decided): diamonds is a TS tool, not a smart-contract project; in-repo contracts are test fixtures only, so contract static analysis is not an appropriate release gate here.
**Exit criteria:** slither no longer runs in `.husky/pre-push`; removed from the `security-check` aggregate and any other blocking path; rationale documented; fate of `slither.config.json` + `slither:scan`/`slither:check` scripts decided (keep as optional manual **or** remove).

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M3-E1 | Remove slither gate + document | Delete the slither step from `.husky/pre-push`; remove from `security-check`; write the decommission rationale (repo doc). Decide keep-as-manual vs remove `slither.config.json` + scripts | Engineer | Low |

### M4 — Lean, Resilient Hook
**Goal:** Redesign the local hooks to a **lean, devcontainer-resilient** gate (audit + semgrep + git-secrets, no yarn state-bug); drop tests + slither from the push gate; prove it end-to-end. **CI is out of scope** — test enforcement stays with the monorepo suite / manual runs.
**Exit criteria:** `.husky/pre-push` + `.husky/pre-commit` complete in-container; a real protected-branch push succeeds without `--no-verify`.

| Epic | Title | Summary | Owner | Impact |
|------|-------|---------|-------|--------|
| M4-E1 | Redesign `pre-push` (lean + resilient) | Local gates = audit + semgrep + git-secrets via **direct binaries / `npm run`** (no `yarn <script>`); keep OSV/snyk non-blocking; make `perf-monitor` optional/guarded; **drop tests + slither** from the gate (tests → monorepo/manual, documented) | Engineer | Med |
| M4-E2 | Fix `pre-commit` in-container | Apply the same yarn-resilience so `.husky/pre-commit` (lint-staged etc.) runs manually in the devcontainer | Engineer | Low |
| M4-E3 | Acceptance proof | Run `.husky/pre-push` end-to-end green in-container; then **Owner-approved** real push to `main`/`develop` without `--no-verify` | Engineer + **Owner** | Outward-facing |

## 6. Cross-cutting workstreams

- **Change log / rationale docs** — every gate weakened or removed (slither, scoped semgrep rules) gets a documented reason in-repo; per-epic `CHANGELOG.md` entries.
- **Keep-green discipline** — after each milestone, the previously-passing gates and the submodule test suite (`51/0`) stay green.
- **Non-blocking scanners** — OSV and Snyk remain warn/skip (Snyk needs auth — a deferred **Owner** task, out of scope here). Don't make them blocking.
- **Tooling-repo rationale** — authored once (M0-E2), reused by M2 (rule scoping) and M3 (slither removal).

## 7. Dependencies & sequencing rules

- **M0 precedes all** — you can't confirm a gate is green without a reliable way to run it in-container.
- **M1, M2, M3 are independent** blocking-gate fixes; recommended order audit→semgrep→slither (cheapest→policy), but they don't hard-depend on each other.
- **M4 depends on M1+M2+M3** — the lean hook + acceptance push require every remaining blocking gate to already be green.
- **M4-E3 is the only outward-facing step** — a real protected-branch push; requires Owner approval.
- **CI is out of scope** — tests are dropped from the push gate; enforcement stays with the monorepo suite / manual runs (no CI backstop is created).

## 8. Risk register (plan-level)

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|------------|-------|
| Removing slither / scoping semgrep hides a *real* issue | Med | Med | Document rationale; retain semgrep+audit; CI can re-add contract analysis later if the repo ever ships contracts | Engineer |
| axios/lodash needed transitively (removing the direct dep doesn't clear the advisory) | Med | Low | M1-E1 flags transitive-dependent advisories; those get a `resolutions`/upgrade or a documented accepted-risk (M1-E3, owner sign-off) | Engineer |
| Removing a direct dep breaks a build/test path that used it implicitly | Low | Med | src/scripts/test show 0 imports; M1-E3 re-runs build + tests after removal | Engineer |
| Tests dropped from the push gate with no CI backstop (CI out of scope) | Med | Med | Enforcement stays with the monorepo suite (220/40/0) + manual `yarn test`; document that pushes no longer run tests | Engineer |
| Lean local hook misses something the full suite caught | Med | Low | CI is the authoritative heavy gate; local hook is fast + resilient, not the sole line | Engineer |
| Protected-branch push has other server-side rules (branch protection) | Low | Med | M4-E4 is Owner-run; surface any server-side rejection rather than force | Owner |
| Devcontainer yarn bug can't be fully worked around in hooks | Low | Med | Use direct binaries/`npm run`; if a step can't run reliably, move it to CI | Engineer |

## 9. Rollback posture per milestone

| Milestone | Primary rollback lever |
|-----------|------------------------|
| M0 | None needed (read-only; baseline doc only) |
| M1 | Revert the `package.json`/lockfile commit (restore axios + lodash) |
| M2 | Revert `.semgrep.yml` + code commits; findings return but nothing else breaks |
| M3 | Re-add the slither step to `.husky/pre-push` + restore config/scripts from git |
| M4 | Revert the hook redesign commit (restores prior `.husky/*`); delete the CI workflow; no push is forced until the hook is green |

## 10. Deliverables checklist (project-level)

- [ ] `M0` `baseline.md` — current findings + reliable in-container invocations + tooling-repo rationale
- [ ] `M1` unused axios + lodash removed; all 26 advisories cleared; `yarn npm audit --severity moderate` green; lock regenerated; residual/accepted advisories documented
- [ ] `M2` `.semgrep.yml` scoped + code fixed/annotated; `yarn semgrep:scan` green with documented suppressions
- [ ] `M3` slither removed from hook + `security-check`; decommission rationale doc; config/scripts fate recorded
- [ ] `M4` lean resilient `.husky/pre-push` + `.husky/pre-commit` (tests+slither off the gate); **unbypassed protected-branch push succeeds**
- [ ] Per-epic `CHANGELOG.md` entries; git-secrets still clean; OSV/Snyk still non-blocking

## 11. Open questions

1. **Unused-dep removal** — `axios` + `lodash` are unused direct deps (0 imports); M1 removes them. Confirm no out-of-band consumer relies on `@diamondslab/diamonds` re-exporting them transitively. *(The earlier "escompat" question is moot — this is removal, not replacement.)*
2. **Slither artifacts** — keep `slither.config.json` + `slither:scan`/`slither:check` as *optional manual* tools, or remove them entirely? (Decided in M3-E1.)
3. **Which protected branch** for the M4-E3 acceptance push — `main`, `develop`, or both? Any server-side branch-protection rules to account for?

## 12. Next step — breaking this out

Expand the first milestone with `/breakout-milestone`. The pipeline fills this tree under `packages/diamonds/project/pre-push-security-gates/`:

```
packages/diamonds/project/pre-push-security-gates/
├── pre-push-security-gates-project-plan.md      ← this document (plan of record)
├── Milestone-00/                                ← M0
│   ├── overview/
│   │   └── milestone-01-baseline-and-scan-harness.md   ← /breakout-milestone (file # 1-based)
│   ├── Epic-01/
│   │   ├── overview/e1-<slug>.md                ← /breakout-epics → input to /create-prd
│   │   ├── prd-e1-<slug>.md                     ← /create-prd
│   │   ├── tasks-e1-<slug>.md                   ← /generate-tasks
│   │   └── CHANGELOG.md
│   └── Epic-02/ …
├── Milestone-01/ …  (M1 audit)
├── Milestone-02/ …  (M2 semgrep)
├── Milestone-03/ …  (M3 slither)
└── Milestone-04/ …  (M4 hook)
```

Indexing: directory `Milestone-NN` is zero-padded to the `M<n>` id (`M0`→`Milestone-00`); the overview filename/title use the 1-based human number (`M0`→`milestone-01-…` / "Milestone 1"). Epic dirs/files use the `E<m>` number (`M<n>-E1`→`Epic-01/overview/e1-<slug>.md`).

**Next:** `/df3ndr:breakout-milestone` for **M0 — Baseline & Reliable Scan Harness**.
