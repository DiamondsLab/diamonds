# M0-E2 Baseline — Verified Current State (2026-06-27)

> Deliverable of epic **M0-E2** ([prd](Epic-02/prd-e2-red-baseline-capture.md) · [tasks](Epic-02/tasks-e2-red-baseline-capture.md)).
> **Headline:** the suite is **GREEN at HEAD** — the original "failing tests / requires both sides"
> premise does **not** reproduce. This baseline reframed the project to **design-hardening** (see the
> [project plan](../deployinclude-exclude-fix-project-plan.md) and [oracle §1](../deployinclude-exclude-fix-architecture.md)).

## Environment (reproduction)
- Parent repo: `feature/epic5-security-scanning-pipeline` @ `31876f1`
- Submodule `packages/diamonds`: `release/v1.3.3` @ `dd4ddf9` (includes `5b2f7af`), working tree clean
- Node `v22.22.2`, Yarn `4.10.3`
- Prep: `yarn compile` (exit 0; Diamond ABI + TypeChain regenerated)
- Commands: `yarn test test/deployment/SelectorRegistration.test.ts`; `… DeployIncludeExclude.test.ts`;
  all three `test/deployment/*` together; full `yarn test`
- No local edits to `test/` or fixtures; fixtures are **single-sided** (include config: `deployInclude`
  only; exclude config: `deployExclude` only)

## Test results
| Run | Result |
|-----|--------|
| `SelectorRegistration.test.ts` (alone) | **6 passing / 0 failing** |
| `DeployIncludeExclude.test.ts` (alone) | **17 passing / 0 failing** |
| All 3 `test/deployment/*` together | **29 passing / 0 failing** |
| **Full `yarn test`** | **189 passing · 69 pending · 0 failing** (~2m, exit 0) |

Log "errors" are expected and unrelated: OZDefender (`test_api_key`, the deprecated strategy) and
`DiamondMonitor` mock-event handlers asserting error handling. No deployInclude/exclude failure.

## Runtime routing (derived from passing E2E assertions + code trace)
| Config | `0xdc38f9ab` testDeployExclude() | `0x7f0c610c` testDeployInclude() |
|--------|----------------------------------|----------------------------------|
| **exclude** config | **absent** — never registered (correct, INV-6) | `ExampleTestDeployExclude` |
| **include** config | `ExampleTestDeployExclude` (priority) | `ExampleTestDeployInclude` (override) |

**Why it works (fresh deploy):** facets process in ascending priority-number order, so the lower-priority
`deployInclude` facet is processed **last** and its `registry.set(...)` overwrites the higher facet's
earlier `Add` entry → correct owner, no companion `deployExclude` needed.

## `5b2f7af` characterization
The `Replace`-instead-of-`Add` fallback fires only when a selector already exists at a **different
address** with a **non-`Add`** action — i.e. a previously `Deployed` facet / **redeploy / upgrade**. The
fresh-deploy fixtures never reach this branch, so its correctness is **unverified by the current suite**.
This is the most plausible home of the original "both-sides required" pain.

## Genuine open gaps (the real work — see plan M1–M3)
1. **Additivity (INV-3) untested.** The deploy-time filter ([BaseDeploymentStrategy.ts:223-238](../../src/strategies/BaseDeploymentStrategy.ts#L223-L238))
   treats `deployInclude` as a **whitelist**, dropping the facet's other selectors. The symmetric
   fixtures hide this (dropped selector reclaimed by the higher-priority facet). → needs **Fixture C**.
2. **Upgrade/redeploy path unexercised.** No test deploys then upgrades with an include/exclude change /
   facet redeploy. → needs an **upgrade-scenario test**.
3. **Dead/inverted code.** `registryHigherPrioritySplit` (`entry.priority > priority`) never matches a
   real higher-priority conflict; inert for fresh deploys. → **remove/fix**.
4. **Vacuous assertion.** `DeployIncludeExclude.test.ts:142-164` passes only because its
   `if (registry.has('0xdc38f9ab'))` guard is **false**; it asserts nothing. → **rewrite to assert
   absence directly**.

## Conclusion
M0-E2 is **complete**: the baseline is established and the premise corrected. The genuine RED states
(additivity, upgrade-path) are **not** captured here by design — they are authored as failing tests in
**M1** (unit harness) and **M3** (upgrade scenario) per the reframed plan.
