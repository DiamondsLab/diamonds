# Tasks — M2-E1 Enumerate & Classify

## Relevant Files & Resources

- `prd-e1-enumerate-classify.md` - The Change Plan this task list executes.
- `overview/e1-enumerate-classify.md` - The epic overview both docs expand.
- `packages/diamonds/src/cli/diamond-abi-cli.ts` - read the 10 flagged `any` sites (read-only).
- `packages/diamonds/.semgrep.yml` - the `typescript-any-usage` rule (read-only reference).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - **Edited**: M2 classification + recommended posture.
- `packages/diamonds/project/pre-push-security-gates/Milestone-02/Epic-01/CHANGELOG.md` - epic change log.

### Notes

- **Read-only epic** — no code/config change; only `baseline.md` appended. No backup needed.
- On branch `chore/pre-push-security-gates`. All work in `packages/diamonds/`.
- The disposition posture (fix/annotate/tune) is the **owner's** decision, surfaced after this epic — this epic only classifies + recommends.

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch `chore/pre-push-security-gates` (not `main`)
  - [x] 0.2 No backup needed (read-only) — note explicitly
  - [x] 0.3 Capture `git -C packages/diamonds status --short` baseline
- [x] 1.0 Read + classify the 10 `any` sites
  - [x] 1.1 Read `src/cli/diamond-abi-cli.ts` around lines 348, 350, 355, 359, 375, 394, 474, 477, 478, 479; note what each `any` represents
  - [x] 1.2 Classify each: **fixable-with-a-real-type** vs **justified-any** (dynamic CLI/JSON)
  - [x] 1.3 Propose a per-finding disposition (fix / `// nosemgrep: typescript-any-usage <reason>` / rule-tune)
- [x] 2.0 Recommend posture + record
  - [x] 2.1 Summarize fixable-vs-justified counts; recommend an overall posture (fix-all / annotate-all / tune-the-rule / mix) with a one-line rationale
  - [x] 2.2 Write the per-finding table + recommendation into `baseline.md` (M2 section)
- [x] 3.0 Validate the change
  - [x] 3.1 Confirm all 10 lines are classified + a posture is recommended
  - [x] 3.2 Confirm `git -C packages/diamonds status --short` shows only `baseline.md` (+ epic docs) — no source/config change
- [x] 4.0 Record the change
  - [x] 4.1 Append the classification summary + recommendation to `Milestone-02/Epic-01/CHANGELOG.md`
  - [x] 4.2 Commit the project docs (exclude the pre-existing `yarn.lock`) referencing Task 4.0
