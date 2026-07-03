# Epic 2 — Disposition → Gate Green (M2-E2)

> **Parent milestone:** [Milestone 3 — Semgrep Gate: Triage & Disposition (M2)](../../overview/milestone-03-semgrep-triage-disposition.md) · **Maps to:** [`pre-push-security-gates-project-plan.md`](../../../pre-push-security-gates-project-plan.md) §5 M2 → M2-E2
> **Owner:** Engineer (+ Owner decision on posture) · **Impact/blast radius:** `src/cli/diamond-abi-cli.ts` and/or `.semgrep.yml`; no runtime behavior change · **Estimated effort:** S–M · **Status:** 📋 planned

## 1. Objective
Apply the disposition chosen in M2-E1 (owner-approved posture) to take `yarn semgrep:scan` to **0 blocking findings**, then confirm nothing regressed. The change is type-level and/or config-level — no runtime behavior change.

## 2. Acceptance criteria
- [ ] `yarn semgrep:scan` → **0 blocking findings** (exit 0).
- [ ] Each of the 10 findings is dispositioned: a real type applied, an inline `// nosemgrep: typescript-any-usage` with a written reason, or the `typescript-any-usage` rule tuned in `.semgrep.yml` (with justification).
- [ ] `yarn build` (or `npm run build`) green; submodule `test:unit` still green (no regression).
- [ ] The disposition + result recorded in `baseline.md` + CHANGELOG.

## 3. Tasks
| # | Task | Owner | Done when |
|---|------|-------|-----------|
| 1 | Apply the chosen disposition per M2-E1 (fix types / add `// nosemgrep: typescript-any-usage <reason>` / tune `.semgrep.yml`) | Engineer | edits applied |
| 2 | Re-run `yarn semgrep:scan` (with `--error` as the hook does); confirm 0 blocking | Engineer | exit 0 |
| 3 | Re-run `yarn build` + submodule `test:unit`; confirm green (no regression) | Engineer | both green |
| 4 | Record dispositions + result in `baseline.md` + CHANGELOG | Engineer | recorded |

## 4. Dependencies & owner gates
- **Upstream:** M2-E1 (classification + recommended posture) + **owner decision** on posture (surfaced at create-prd).
- **Owner gates:** the posture decision (fix/annotate/tune) is the owner's call; no credential/provisioning gate.
- **Downstream:** M4 (the unbypassed push needs this gate green).

## 5. Risks
| Risk | Mitigation |
|------|------------|
| A type fix subtly changes CLI behavior | Keep edits type-only + minimal; re-run `yarn build` + `test:unit` |
| Disabling the rule wholesale hides future real `any` issues | Prefer per-site fixes/annotations; if tuning, scope narrowly (e.g. exclude the CLI path) + document |
| `semgrep --error` still flags something after annotation (wrong comment syntax) | Verify the `nosemgrep` inline-suppression syntax for TS; re-run to confirm 0 |

## 6. Notes
- Reversible: revert the commit touching `diamond-abi-cli.ts` / `.semgrep.yml`.
- No dependency or runtime change — this is types/annotations/config only.
- Closes the semgrep gate; combined with M1 (audit) that leaves slither (M3) + the hook (M4) before the unbypassed push.
