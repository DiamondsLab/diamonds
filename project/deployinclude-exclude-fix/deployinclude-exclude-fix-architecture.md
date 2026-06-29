# deployInclude / deployExclude — Selector-Resolution Specification (TDD Oracle)

> **Status:** ✅ **RATIFIED & FROZEN — 2026-06-28 (M0-E1 / OP-1 cleared).** TDD oracle; code conforms to this. Amending any invariant **re-opens** the gate. See §7 Decision Log.
> **Author:** Am0rfu5 · **Date:** 2026-06-27
> **Companion to:** [deployinclude-exclude-fix-project-plan.md](./deployinclude-exclude-fix-project-plan.md) — read this spec first; the plan executes it.
> **Scope of authority:** This document is the **authoritative oracle**. Where the current code disagrees with this spec, **the code is wrong and must be changed to match** (TDD: tests assert this spec, then code is made to pass).

This spec lives in the `@diamondslab/diamonds` submodule because the behavior it governs lives in
`packages/diamonds/src/strategies/BaseDeploymentStrategy.ts`. The integration tests that prove it
live one level up, in the dev-env root (`test/deployment/`).

---

## 1. Problem statement

`deployInclude` / `deployExclude` are per-facet, per-version directives that shape **which function
selectors a facet contributes** to an ERC-2535 diamond, and **which facet owns a selector** when more
than one facet exposes it. Each directive is intended to be **independently sufficient** — `deployExclude`
alone removes; `deployInclude` alone overrides — without the operator specifying both sides of a conflict.

> 🔎 **Verified current state (2026-06-27, `packages/diamonds` @ `dd4ddf9` / `release/v1.3.3`).** Contrary
> to the original framing, at this checkout the **full root suite is green** (189 passing / 0 failing) and
> the **single-sided** include/exclude fixtures already resolve correctly for **fresh deploys** (§4.1–§4.2).
> The `release/v1.3.3` fixes (`4edfc97`, `74e2d53`, `0ebd91f`, `5b2f7af`) closed the fresh-deploy case. This
> document is therefore a **design-hardening** oracle, not a red-test fix. The genuine open gaps are
> **(a)** additivity (INV-3) is **untested**, **(b)** the **upgrade/redeploy path is unexercised** (the
> likely home of any residual "both-sides required" failure), and **(c)** dead/inverted resolution code
> remains. The invariants below still define the intended semantics and remain the test targets.

### 1.1 Current behavior — what works, and what is fragile

In `BaseDeploymentStrategy`:

- **Fresh-deploy override works by registry overwrite, not by the named branch.** Facets are processed in
  **ascending priority-number order**, so a lower-priority `deployInclude` facet is processed **last** and
  its `registry.set(selector, …)` simply **overwrites** the higher-priority facet's earlier `Add` entry —
  yielding the correct owner. This is why the single-sided include fixture passes.
- **The "higher priority split" is dead/inverted code.** It filters `entry.priority > priority`
  ([BaseDeploymentStrategy.ts:366-378](../../src/strategies/BaseDeploymentStrategy.ts#L366-L378)); since a
  higher-priority facet has a *smaller* priority number, the branch never matches a real higher-priority
  conflict. It was inert for fresh deploys (the overwrite above does the work) and **REMOVED in M3-E3** —
  the cases it nominally handled fall through to the `5b2f7af` Replace branch with the identical result.
- **`5b2f7af` targets the upgrade/redeploy case, which no current test hits.** Its `Replace`-instead-of-`Add`
  fallback fires only when a selector already exists at a *different* address with a non-`Add` action (a
  previously `Deployed` facet / redeploy). Fresh-deploy tests never exercise this path, so its correctness
  is **unverified** — this is where single-sided include/exclude most plausibly still breaks.
- **The deploy-time filter makes `deployInclude` a whitelist, violating INV-3.**
  [BaseDeploymentStrategy.ts:223-238](../../src/strategies/BaseDeploymentStrategy.ts#L223-L238) drops every
  non-included selector of the facet. The symmetric fixtures hide this (the dropped selector is reclaimed by
  the higher-priority facet anyway), but per §2.2 `deployInclude` must be **additive**; Fixture C (§4.3)
  would expose this as a real failure.

---

## 2. Authoritative semantics (owner-confirmed 2026-06-27)

Two mechanisms, **each independently sufficient**, **neither requires editing the other facet**:

### 2.1 `deployExclude` — independent removal
Listing a selector in facet **F**'s `deployExclude` means **F never owns that selector**. Full stop.
- No companion `deployInclude` on any other facet is required.
- The excluded selector is still eligible to be owned by **another** facet that legitimately exposes it
  (resolved by priority). If **no** other facet claims it, the selector is **absent** from the deployed
  diamond.

### 2.2 `deployInclude` — override, **additive** (NOT a whitelist)
Listing a selector in facet **F**'s `deployInclude` means **F owns that selector, overriding any
higher-priority facet** that also exposes it (that facet relinquishes it).
- No companion `deployExclude` on the higher-priority facet is required.
- **Additive:** `deployInclude` does **not** drop F's other selectors. F's remaining (non-included)
  selectors still participate in **normal priority resolution** and may be owned by F when F is the
  highest-priority exposer. *(This is the key correction vs. the current whitelist behavior, and vs.
  the rejected "whitelist" interpretation.)*

### 2.3 Resolution algorithm (target)

```
ownership = {}                       # selector -> facet
forced    = {}                       # selector -> facet (deployInclude winners)

# Pass 1 — candidate sets (apply deployExclude)
for facet F in config:
    candidates[F] = selectorsOf(F.abi) \ selectors(F.deployExclude)   # INV-1

# Pass 0 — validation (HARD ERRORS; enforcement OWNED BY the basestrategy-fulfillment validator)
#   reject if any facet lists a selector in BOTH deployInclude and deployExclude   # INV-7 (hard error)
#   reject if two facets deployInclude the SAME selector                            # INV-8 (hard error)

# Pass 2 — forced ownership (deployInclude override; dual-list/dual-include already rejected)
for facet F in priority order (highest priority first):
    for sel in selectors(F.deployInclude):
        if sel in selectorsOf(F.abi):
            forced[sel] = F

# Pass 3 — priority resolution for everything else (additive)
for sel, F in forced: ownership[sel] = F
for facet F in priority order (highest priority first):
    for sel in candidates[F]:
        if sel in forced: continue               # forced winner already owns it
        if sel not in ownership:                 # first (highest-priority) exposer wins
            ownership[sel] = F

# Pass 4 — cut actions (Add vs Replace) derived from prior on-chain/registered state  # INV-4
```

---

## 3. Invariants (assert these)

| ID | Invariant |
|----|-----------|
| **INV-1** | A selector in F's `deployExclude` is **never** owned by F — independent of any other facet's config. |
| **INV-2** | A selector in F's `deployInclude` is owned by F **even when a higher-priority facet G exposes it** (G relinquishes it). **No `deployExclude` on G is required.** |
| **INV-3** | `deployInclude` is **additive**: F's non-included selectors still undergo normal priority resolution and may be owned by F. `deployInclude` is **not** a whitelist. |
| **INV-4** | Every owned selector resolves to **exactly one** facet (EIP-2535). The generated cut is `Add` (net-new) or `Replace` (owner change / redeploy) — **never** producing `"Can't add function that already exists"` or an orphaned-selector error. |
| **INV-5** | **No schema change.** The legacy both-sides config (exclude on G **and** include on F) yields the **same** result as include on F alone. |
| **INV-6** | An excluded selector with **no** other claimant is **absent** from the deployed diamond (`DiamondLoupe.facetAddress(sel) == address(0)`). |
| **INV-7** | Within a **single** facet, listing a selector in **both** `deployExclude` and `deployInclude` is a **fatal misconfiguration → hard error** (rejected; never silently resolved). **Enforcement owned by the `basestrategy-fulfillment` validator** (deferred from this project); here it is policy + a flagged test. *(Ratified 2026-06-28, DR-1/DR-3.)* |
| **INV-8** | Two facets force-including the **same** selector is a **fatal misconfiguration → hard error** (rejected; no silent priority tie-break). **Enforcement deferred** to the `basestrategy-fulfillment` validator. *(Ratified 2026-06-28, DR-2/DR-3.)* |
| **INV-9** | A non-existent function signature in `deployInclude`/`deployExclude` is a **no-op** (nothing to add/remove); deployment **succeeds**. |

---

## 4. Resolution truth table (oracle for the test suite)

Both `ExampleTestDeployExclude` and `ExampleTestDeployInclude` expose **both** selectors:
`testDeployExclude() = 0xdc38f9ab`, `testDeployInclude() = 0x7f0c610c`.

### 4.1 Fixture A — `examplediamond-exclude.config.json`
Only `ExampleTestDeployExclude` @ priority 50, with `deployExclude: ["testDeployExclude()"]`.

| selector | exposed by | directive | **owner (oracle)** | invariant |
|----------|-----------|-----------|--------------------|-----------|
| `0xdc38f9ab` testDeployExclude | Exclude@50 | excluded on Exclude | **(none — absent)** | INV-1, INV-6 |
| `0x7f0c610c` testDeployInclude | Exclude@50 | — | **Exclude@50** | only exposer |

> ⚠️ The current test [DeployIncludeExclude.test.ts:142-164](../../../../test/deployment/DeployIncludeExclude.test.ts#L142-L164)
> passes **vacuously**: at HEAD the selector is correctly absent, so its `if (registry.has('0xdc38f9ab'))`
> guard is **false** and the inner assertion never runs. The behavior is already correct (INV-6); the test
> just doesn't prove it. It **must be rewritten** to assert absence directly (e.g.
> `facetAddress('0xdc38f9ab') === ZeroAddress`).

### 4.2 Fixture B — `examplediamond-include.config.json`
`ExampleTestDeployExclude` @50 (no directive); `ExampleTestDeployInclude` @60 with
`deployInclude: ["testDeployInclude()"]`.

| selector | exposed by | directive | **owner (oracle)** | invariant |
|----------|-----------|-----------|--------------------|-----------|
| `0x7f0c610c` testDeployInclude | Exclude@50, Include@60 | included on Include@60 | **Include@60** (override) | INV-2 |
| `0xdc38f9ab` testDeployExclude | Exclude@50, Include@60 | — | **Exclude@50** (priority) | priority |

Net: `Include@60` owns `{0x7f0c610c}`; `Exclude@50` owns `{0xdc38f9ab}` — each exactly one selector,
matching the existing `lengthOf(1)` integration assertions.

### 4.3 Fixture C — **NEW**, additivity discriminator (must be added — see plan M1/M3)
Fixtures A and B both net out to one selector per facet **whether include is additive or a whitelist**,
so they do **not** prove INV-3. Add a fixture where the including facet owns an **extra** selector that
no higher-priority facet claims:

Proposed `examplediamond-include-additive.config.json` — `ExampleTestDeployInclude` @60 with
`deployInclude: ["testDeployInclude()"]`, and **no** `ExampleTestDeployExclude` in the config (so
`testDeployExclude()` has no higher-priority competitor):

| selector | exposed by | directive | **owner (additive oracle)** | **owner if whitelist (rejected)** |
|----------|-----------|-----------|------------------------------|-----------------------------------|
| `0x7f0c610c` testDeployInclude | Include@60 | included | **Include@60** | Include@60 |
| `0xdc38f9ab` testDeployExclude | Include@60 | — | **Include@60** (additive, INV-3) | (none — dropped) |

> A passing test here (Include@60 owns **both**) is the only thing that distinguishes the approved
> "additive" semantics from the rejected "whitelist" semantics. Without it, INV-3 is untested.

### 4.4 Edge-case fixtures (already referenced by the suite)
| fixture | scenario | oracle |
|---------|----------|--------|
| `test-assets/test-diamonds/invalid-exclude.config.json` | `deployExclude` names a non-existent fn | no-op; deploy succeeds (INV-9) |
| `test-assets/test-diamonds/invalid-include.config.json` | `deployInclude` names a non-existent fn | no-op; deploy succeeds (INV-9) |
| `test-assets/test-diamonds/include-and-exclude.config.json` | same selector in both lists, same facet | **INV-7 violation → invalid config (hard error policy).** Enforcement deferred to the validator, so the existing test (asserts **success**, [L569-591](../../../../test/deployment/DeployIncludeExclude.test.ts#L569-L591)) must be reframed to **pending/deferred**, not 'handled'. |

---

## 5. Out of scope
- **OZDefenderDeploymentStrategy** — deprecated; excluded from this work (it must merely keep compiling).
- **Config-schema changes** — the `deployInclude` / `deployExclude` shape is unchanged (INV-5).
- The broader `basestrategy-fulfillment` convergent redesign (declarative convergence, schema
  collapse). This fix is a **subset** that must remain compatible with that direction but does not
  implement it.

## 6. Relationship to `basestrategy-fulfillment`
The pure resolution function this fix introduces (plan M1) is the natural seed of the
"single shared pure selector-resolution core" called for by the larger redesign. It is scoped minimally
here (a testable seam over existing behavior), but should be authored so it can later be promoted into
that shared core without redesign.

## 7. Decision log (M0-E1 ratification — 2026-06-28)

| ID | Decision | Rationale / consequence |
|----|----------|--------------------------|
| **DR-0** | The **reframed** oracle (verified green-at-HEAD; design-hardening) is **accepted**; INV-1…6 and INV-9 ratified as written; `deployInclude` is **additive** (not a whitelist). | Matches the M0-E2 baseline; additive was owner-chosen earlier. |
| **DR-1** | **INV-7 = hard error** (same-facet include+exclude of one selector is rejected, not resolved). | Owner choice 2026-06-28; stronger than the drafted "exclude wins + warn". |
| **DR-2** | **INV-8 = hard error** (two facets force-including one selector is rejected). | Owner choice 2026-06-28; aligns with the validator's hard-fail-pre-launch philosophy. |
| **DR-3** | **Enforcement of INV-7/INV-8 is deferred** to the `basestrategy-fulfillment` **config validator**; this project **specifies the policy and flags the contradicting test** but does **not** build the throw here. | Owner choice ("defer to validator"). Keeps M2/M3 tight. **Cross-project dependency:** full enforcement lands with the validator effort, not here. |
| **DR-4** | **Consequence:** the existing `include-and-exclude` edge test ([DeployIncludeExclude.test.ts:569-591](../../../../test/deployment/DeployIncludeExclude.test.ts#L569-L591)) asserts the config **succeeds**, contradicting DR-1. It must become a **pending/deferred** case (invalid-but-unenforced). Plan **M4-E1** and the **§11 traceability** rows for INV-7/INV-8 are marked **deferred to validator**. | Surfaced during ratification; prevents a test that contradicts ratified policy. |
| **DR-5** | **Fixture C** (additivity discriminator, §4.3) is **confirmed buildable** as specified; **M1-E3** may proceed. | Unblocks the headline INV-3 gap. |

**Freeze:** with DR-0…DR-5 recorded, the oracle is **frozen (2026-06-28)** and **OP-1 is cleared** — M1 may begin. Amending any invariant re-opens the gate.

## 8. Glossary
- **priority** — integer per facet; **lower = higher priority**; default `1000`.
- **owner** — the single facet whose address a selector routes to in the deployed diamond.
- **candidate set** — a facet's ABI selectors after applying its `deployExclude`.
- **forced / override** — ownership granted by `deployInclude`, ahead of priority resolution.
