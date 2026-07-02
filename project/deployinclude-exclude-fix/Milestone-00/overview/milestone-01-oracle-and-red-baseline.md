# Milestone 1 — Oracle & Baseline (M0)

> **Maps to:** [deployinclude-exclude-fix-project-plan.md](../../deployinclude-exclude-fix-project-plan.md) → §5 "M0 — Oracle & true baseline" · Oracle: [deployinclude-exclude-fix-architecture.md](../../deployinclude-exclude-fix-architecture.md)
> **Status:** 📋 planned — *foundations; no code in this milestone.*
> **Prod / impact:** None (docs + read-only analysis only). Highest-leverage milestone: everything downstream asserts the oracle this milestone freezes.
> **Author:** Am0rfu5 · **Date:** 2026-06-27
> **Epic breakouts:** [e1-selector-resolution-spec](../Epic-01/overview/e1-selector-resolution-spec.md) · [e2-red-baseline-capture](../Epic-02/overview/e2-red-baseline-capture.md) · [e3-test-audit-matrix](../Epic-03/overview/e3-test-audit-matrix.md)

> 🔁 **Reframed 2026-06-27 (premise corrected).** The original framing assumed `deployInclude`/`deployExclude`
> had **failing** tests requiring both sides of a conflict. The M0-E2 baseline ([../baseline.md](../baseline.md))
> **disproved that**: at `packages/diamonds` @ `dd4ddf9` (`release/v1.3.3`) the full root suite is **GREEN
> (189 passing / 0 failing)** and single-sided include/exclude already resolve correctly for **fresh deploys**.
> The project is now **design-hardening**, not a red-test fix. This milestone accordingly establishes the
> **true (verified-green) baseline** and demonstrates the *genuine* gaps — **additivity (INV-3)** and the
> **upgrade/redeploy path** — rather than "capturing the failing state."

---

## 1. Why this milestone exists

This is a TDD project, and TDD is only as good as its **oracle**. Before any selector-resolution code
is touched, three things must be true and *written down*:

1. The intended semantics are **authoritative and frozen** — including the edge-case defaults — so
   tests assert a fixed target rather than a moving one. The oracle was **reframed** to match the
   verified state (green-at-HEAD; design-hardening) before ratification.
2. The **true baseline is established** — exactly which assertions pass *today* (the suite is **green**),
   with the `5b2f7af` workaround characterized as upgrade-path-only — so we can prove later that we
   changed behavior on purpose and didn't regress anything silently, and so the *genuine* gaps
   (additivity, upgrade-path) are demonstrated as the real RED.
3. The **existing tests are audited** — because some assertions **pass vacuously** (e.g.
   [DeployIncludeExclude.test.ts:142-164](../../../../../test/deployment/DeployIncludeExclude.test.ts#L142-L164),
   whose `if (registry.has('0xdc38f9ab'))` guard is *false* at HEAD, so it asserts nothing) and others
   leave the approved **additive** semantics (INV-3) and the **upgrade/redeploy path** entirely untested.

It sits at the **head of the critical path**: `M0 → M1 → M2 → M3 → M4`. M0-E1's approval is a hard gate
— no M1+ code may begin until the oracle is ratified.

## 2. Goal & exit criteria

**Goal:** Lock the (reframed) authoritative semantics and establish the **true baseline** (verified green)
while demonstrating the genuine gaps, so the work that follows is a disciplined "make the oracle's
*real* RED cases — additivity and the upgrade-path — pass."

**Exit criteria:**
- [ ] Companion oracle doc **Owner-approved and frozen** (the **reframed** oracle), with the two authored
      defaults explicitly ratified: **INV-7** (within one facet, exclude wins over include) and **INV-8**
      (on dual-include, highest-priority includer wins).
- [ ] **True baseline artifact** ([../baseline.md](../baseline.md)) saved under `Milestone-00/` recording
      per-test results for `DeployIncludeExclude.test.ts` and `SelectorRegistration.test.ts` (**green at
      HEAD**), the runtime routing under both fixtures, and the `5b2f7af` workaround characterized as
      **upgrade/redeploy-path-only** (no current test hits it).
- [ ] **Test-audit matrix** complete: every assertion in both suites classified **keep / rewrite (incl.
      vacuous passes) / add**, every classification tied to an invariant, and coverage gaps named (at
      minimum: additivity INV-3, absence INV-6, **upgrade-path**).
- [ ] No code under `packages/diamonds/src/` or `test/` changed in this milestone (docs/artifacts only).

## 3. Scope

**In scope**
- Ratifying and freezing the oracle (semantics + INV-1…9 + truth table, including Fixture C additivity
  discriminator as a *specified* fixture — not yet built).
- Running the two existing root integration/unit suites once to capture the baseline.
- A complete inventory + classification of existing assertions across both suites.

**Out of scope (deferred)**
- Writing or changing any production code or test code → M1–M3.
- Building the additivity fixture / contracts → M1-E3.
- The pure resolution seam and unit harness → M1.
- Any submodule-unit-test baseline (those tests don't exist yet) → captured when authored in M1.

## 4. Roles on this milestone

| Who | Responsibility |
|-----|----------------|
| **Owner (Am0rfu5)** | **Blocking:** review, ratify (incl. INV-7/INV-8 defaults), and **freeze** the **reframed** oracle (M0-E1). Nothing downstream proceeds until this gate clears. |
| **Engineer (agent-assisted)** | Baseline capture (M0-E2) **done** — green baseline established; produce the test-audit matrix (M0-E3); draft any oracle refinements the Owner requests during review. |

No third-party, credentialed, or outward-facing steps in this milestone.

## 5. Epics

| Epic | Title | Owner | Impact | Status | Breakout |
|------|-------|-------|--------|--------|----------|
| M0-E1 | selector-resolution-spec | Owner | High | 📋 planned (ratify the **reframed** oracle) | [e1-selector-resolution-spec](../Epic-01/overview/e1-selector-resolution-spec.md) |
| M0-E2 | baseline-capture | Engineer | Med | ✅ **DONE** (green baseline captured — [../baseline.md](../baseline.md)) | [e2-red-baseline-capture](../Epic-02/overview/e2-red-baseline-capture.md) |
| M0-E3 | test-audit-matrix | Engineer | High | 📋 planned | [e3-test-audit-matrix](../Epic-03/overview/e3-test-audit-matrix.md) |

### M0-E1 — `selector-resolution-spec` (the oracle gate)
The companion architecture doc is already **drafted and reframed** (green-at-HEAD; design-hardening) with
the resolution algorithm, INV-1…9, and the §4 truth table. This epic is the **Owner review-and-ratify
gate** for that **reframed** oracle, not authoring from scratch. The review must explicitly settle the
two defaults that were authored but not previously confirmed:
- **INV-7** — when the *same* facet lists a selector in both `deployInclude` and `deployExclude`, the
  draft says **exclude wins** (selector removed) + a validator warning. Owner confirms or flips to
  include-wins.
- **INV-8** — when *two* facets force-include the same selector, the draft says the **highest-priority
  includer wins** + a warning. Owner confirms or chooses error-out.

**Acceptance shape:** a frozen oracle doc whose invariants are internally consistent with the truth
table, with INV-7/INV-8 marked ratified, and Fixture C (additivity discriminator) specified well enough
for M1-E3 to build it. **Key risk:** Owner flips a default → ripples into the M1 unit tests; cheap to
absorb here, expensive after M1. **Blocking** all of M1+.

### M0-E2 — `baseline-capture` ✅ DONE
**Done (2026-06-27).** Established the "before" picture — which turned out **GREEN**. Compiled, then ran
the two suites against the **current** code and recorded results to [`Milestone-00/baseline.md`](../baseline.md):
full `yarn test` = **189 passing / 0 failing**; single-sided fixtures resolve correctly for **fresh
deploys**. Because both `ExampleTestDeployExclude` and `ExampleTestDeployInclude` expose the same two
selectors, the artifact records *what the diamond actually does today*:
`DiamondLoupe.facetAddress(0xdc38f9ab)` / `(0x7f0c610c)` per config, and characterizes `5b2f7af` as
**upgrade/redeploy-path-only** (fires on the `Deployed`/different-address case — **no current test hits
it**). The result **corrected the project premise** (no red tests) and reframed it to design-hardening.

**Outcome:** baseline artifact + premise correction landed. The genuine RED states (additivity gap,
upgrade-path repro) are **not** captured here by design — they are authored as failing tests in **M1**
(unit harness) and **M3** (upgrade scenario). See [../baseline.md](../baseline.md) and the
[E2 task list](../Epic-02/tasks-e2-red-baseline-capture.md).

### M0-E3 — `test-audit-matrix`
Inventory **every** `it()` assertion across both suites and classify each: **keep** (already asserts the
oracle), **rewrite** (a **vacuous pass** that asserts nothing — e.g. L142-164, whose `if
(registry.has('0xdc38f9ab'))` guard is *false* at HEAD — must be rewritten to assert INV-6 absence
directly), or **add** (oracle rule with no test today). Map every row to an invariant (INV-1…9) and
surface the coverage gaps the current fixtures can't close — at minimum **INV-3 additivity** (Fixtures A
& B both net to 1 selector/facet whether additive or whitelist), **INV-6 absence**, and the
**upgrade/redeploy path**.

**Acceptance shape:** a matrix (`suite · it() · current assertion · classification · target oracle ·
invariant`) saved under `Milestone-00/`, feeding directly into M1's RED tests and M2/M3's corrections.
**Key risk:** missing a subtly bug-encoding assertion; mitigate by requiring every row to bind to an
invariant (an unbindable assertion is itself a finding).

## 6. Dependencies & sequencing

- **Upstream:** project plan + drafted-and-reframed oracle (both exist).
- **Internal ordering:** M0-E2 and M0-E3 are read-only analysis; **M0-E2 is done** (green baseline) and
  M0-E3 follows from source + that baseline. Their findings (current behavior + coverage gaps) **feed**
  the M0-E1 review, so schedule the E1 ratification *after* E3 lands so the Owner ratifies against
  evidence. (E1 remains the formal gate.)
- **Carried-over owner gate:** M0-E1 approval is the blocking gate for the whole project.
- **Downstream:** M1 consumes the frozen oracle + audit matrix to write RED unit tests; M2/M3 consume
  the corrections list; the baseline is the regression reference for M4.

## 7. Rollback posture

Docs and analysis artifacts only — revert the files. No code, no schema, no on-chain state touched.

## 8. Risks (milestone-scoped)

| Risk | Mitigation |
|------|------------|
| Owner flips INV-7/INV-8 after M1 tests are written | Ratify both **explicitly** in M0-E1 *before* any M1 test code; surface them as named decisions, not buried defaults. |
| Reframe loses sight of a real residual bug | M0-E2's baseline characterizes `5b2f7af` as upgrade-path-only and flags it as the likely home of any residual "both-sides" pain; M3 must actually exercise the upgrade path. |
| Audit mis-files a **vacuous pass** as "keep" | Require every assertion to bind to an invariant; a guard-gated/empty assertion that asserts nothing is a **rewrite**, not a keep. |
| Additivity gap goes unnoticed | M0-E3 must explicitly name INV-3 as uncovered, handing M1-E3 the mandate to build Fixture C. |

## 9. Definition of Done for Milestone 1 (M0)

- Reframed oracle doc **frozen** and Owner-ratified, INV-7/INV-8 settled.
- True baseline artifact saved (per-test results = green; on-chain routing; `5b2f7af` characterized as
  upgrade-path-only) — **M0-E2 done** ([../baseline.md](../baseline.md)).
- Test-audit matrix complete, every assertion classified and invariant-bound, gaps (INV-3, INV-6,
  upgrade-path) and vacuous passes named.
- Zero source/test changes in this milestone; clean handoff to M1.

---

**Next:** M0-E2 is **done** (green baseline — [../baseline.md](../baseline.md)) and the epics are already
broken out (overviews + PRDs). Complete M0-E3 (test-audit matrix), then ratify the **reframed** oracle at
the M0-E1 gate *after* that evidence is in hand, and break out M1.
