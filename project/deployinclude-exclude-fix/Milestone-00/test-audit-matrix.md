# M0-E3 Test-Audit Matrix (2026-06-28)

> Deliverable of epic **M0-E3** ([prd](Epic-03/prd-e3-test-audit-matrix.md)). Classifies **every** `it()`
> in the two selector suites against the **frozen oracle** ([architecture](../deployinclude-exclude-fix-architecture.md), §7 ratified 2026-06-28).
> **Classification:** `keep` (already asserts the oracle) · `correct` (vacuous/wrong/contradicts oracle → rewrite) · `add` (oracle rule with no test).
> Read with the green [baseline.md](baseline.md). Static analysis only — no test/source edited.

## A. `test/deployment/SelectorRegistration.test.ts` (6 `it()` — pure unit/parse; all bug-independent)

| # | `it()` | current assertion | class | target / action | invariant |
|---|--------|-------------------|-------|-----------------|-----------|
| A1 | calculate selector for `testDeployExclude()` | `id(sig)[:10] == 0xdc38f9ab` | **keep** | precondition (selector arithmetic) | — (supports all) |
| A2 | calculate selector for `testDeployInclude()` | `== 0x7f0c610c` | **keep** | precondition | — |
| A3 | parse `deployExclude` from exclude config | config has `deployExclude:["testDeployExclude()"]` | **keep** | config-shape precondition | INV-5 (shape) |
| A4 | parse `deployInclude` from include config | config has `deployInclude:["testDeployInclude()"]` | **keep** | config-shape precondition | INV-5 (shape) |
| A5 | facet priority ordering | Exclude@50 < Include@60 | **keep** | priority-model precondition | supports INV-2 |
| A6 | various signatures → selectors | 4 known sig→selector pairs | **keep** | precondition | — |

**Verdict:** all `keep`. These assert *preconditions* (selector math, config parsing, priority), not the
resolution invariants — fine as-is, but note **none of them prove resolution behavior**; that's the
integration suite + the new unit harness (M1).

## B. `test/deployment/DeployIncludeExclude.test.ts` (17 `it()`)

### B-exclude — describe "deployExclude Tests" (4)
| # | `it()` | current assertion | class | target / action | invariant |
|---|--------|-------------------|-------|-----------------|-----------|
| B1 | verify Diamond deployment | DiamondAddress set; has DiamondCut+Loupe | **keep** | deployment sanity | — |
| B2 | `0xdc38f9ab` NOT registered with Exclude facet | `funcSelectors` ∌ `0xdc38f9ab` | **keep** | asserts INV-1 directly | **INV-1** |
| B3 | Include facet NOT deployed with exclude config | `DeployedFacets` ∌ `ExampleTestDeployInclude` | **keep** | config-scoping | — |
| B4 | registry shows `testDeployExclude()` has no facet assignment (**L142-164**) | `if (registry.has('0xdc38f9ab')) expect facetName=='ExampleTestDeployExclude'` | **correct** ⚠️ | **VACUOUS** — guard is **false** at HEAD so nothing runs; the inner assert encodes the *bug*. **Rewrite** to assert absence directly: `facetAddress('0xdc38f9ab') == ZeroAddress` (no facet owns it). | **INV-6** |

### B-include — describe "deployInclude Tests" (5)
| # | `it()` | current assertion | class | target / action | invariant |
|---|--------|-------------------|-------|-----------------|-----------|
| B5 | verify Diamond deployment (include) | has DiamondCut+Loupe+Include | **keep** | deployment sanity | — |
| B6 | `0x7f0c610c` IS registered with Include facet | `funcSelectors` ∋ `0x7f0c610c` | **keep** | asserts INV-2 override | **INV-2** |
| B7 | call `testDeployInclude()` via proxy | returns `true` | **keep** | runtime routing | INV-2 |
| B8 | call `testDeployExclude()` via proxy | returns `true` | **keep** | runtime routing (routes to Exclude) | priority |
| B9 | Exclude facet deployed with include config | present; `funcSelectors`==`[0xdc38f9ab]` (length 1) | **keep** | override left Exclude with only its own selector | **INV-2** + priority |

### B-e2e — describe "E2E Tests with Deployment Records" (5)
| # | `it()` | current assertion | class | target / action | invariant |
|---|--------|-------------------|-------|-----------------|-----------|
| B10 | deployment record written to correct path | file exists | **keep** | record I/O | — |
| B11 | load record JSON; DiamondAddress valid | 42-char `0x…` matches deployed | **keep** | record I/O | — |
| B12 | record registry matches config | Include=`[0x7f0c610c]`(1), Exclude=`[0xdc38f9ab]`(1) | **keep** | override end-state in record | **INV-2** |
| B13 | loupe `facetFunctionSelectors()` at runtime | each facet returns its 1 selector | **keep** | runtime single-owner | INV-2/**INV-4** |
| B14 | loupe `facetAddress()` ownership | `0x7f0c610c`→Include, `0xdc38f9ab`→Exclude | **keep** | strongest ownership assertion | INV-2/**INV-4** |

### B-edge — describe "Error Handling Tests" (3)
| # | `it()` | current assertion | class | target / action | invariant |
|---|--------|-------------------|-------|-----------------|-----------|
| B15 | non-existent fn in `deployExclude` (invalid-exclude) | try/catch: DiamondAddress exists **or** error `/function\|selector\|invalid/` | **keep (weak)** | tighten to assert no-op + deploy success directly | **INV-9** |
| B16 | non-existent fn in `deployInclude` (invalid-include) | same broad try/catch | **keep (weak)** | tighten as above | **INV-9** |
| B17 | both include+exclude in same facet (include-and-exclude, **L569-591**) | deployment **succeeds** | **correct** ⚠️ | **Contradicts ratified INV-7 (hard error, DR-1/DR-4).** Enforcement deferred to the validator, so reframe to **pending/deferred** (invalid-but-unenforced), NOT "handled successfully". Do **not** assert success. | **INV-7** (deferred) |

## C. Classification summary
- **keep:** 19 (A1-A6, B1-B3, B5-B14) — of which B15/B16 are *weak keeps* (broad try/catch).
- **correct (rewrite):** 2 — **B4** (vacuous → assert INV-6 absence directly) and **B17** (contradicts INV-7 → pending/deferred).
- **add:** see §D.

## D. Coverage gaps — the "add" list (input to M1/M3/M4)
| gap | why uncovered | remedy | invariant | owner-epic |
|-----|---------------|--------|-----------|------------|
| **Additivity** | Fixtures A & B both net to 1 selector/facet whether include is additive or whitelist | **Fixture C** test: Include@60 owns **both** `0x7f0c610c` *and* `0xdc38f9ab` (no higher-priority competitor) | **INV-3** | M1-E3 / M2-E1 |
| **Absence (direct)** | only vacuously covered (B4) | the B4 rewrite | **INV-6** | M2-E2 |
| **Upgrade/redeploy path** | no deploy→upgrade test; `Deployed`/different-address path never hit | upgrade-scenario test (version bump changing include/exclude; facet redeploy) asserting correct `Add`/`Replace` + ownership | **INV-4** (upgrade) | M3-E1 |
| **Legacy both-sides ≡ single-sided** | no test that the old workaround yields the same result | optional regression fixture | **INV-5** | M4-E1 |
| **Asymmetric override** | fixtures are symmetric (both facets expose both selectors) | optional: override where facets expose *different* selector sets | INV-2 | M1-E2 |
| INV-7 / INV-8 **enforcement** | hard-error enforcement **deferred to validator** (DR-3) | NOT added here; B17 → pending/deferred | INV-7/8 | (validator effort) |

## E. Notes for downstream
- The matrix columns mirror the **§11 traceability** table — slot `keep`/rewritten rows straight in at M4-E3.
- The integration suite already covers **INV-1, INV-2, INV-4** well (B2, B6/B9/B12/B14, B13/B14); the
  real holes are **INV-3 (additivity)** and the **upgrade path** — the two headline items of the reframe.
- INV-9 is covered but **weakly** (broad try/catch); tighten in M4-E1.
- Provisional? No — the oracle is **frozen** (DR-0…DR-5), so this matrix is final, not "pending OP-1".
