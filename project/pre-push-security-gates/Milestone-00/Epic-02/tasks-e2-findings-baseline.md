# Tasks — M0-E2 Findings Baseline + Rationale

## Relevant Files & Resources

- `prd-e2-findings-baseline.md` - The Change Plan this task list executes.
- `overview/e2-findings-baseline.md` - The epic overview both docs expand.
- `../Epic-01/prd-e1-reproduce-gates-in-container.md` + `../../baseline.md` - M0-E1 invocations to reuse (dependency).
- `packages/diamonds/.semgrep.yml` - rule ids to label the 10 semgrep findings (read-only reference).
- `packages/diamonds/src/…` (e.g. `src/cli/diamond-abi-cli.ts`) - files semgrep flags, read to classify (read-only).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - **Edited here**: append *Findings* + *Tooling-repo rationale* sections.
- `packages/diamonds/project/pre-push-security-gates/Milestone-00/Epic-02/CHANGELOG.md` - epic change log to append.

### Notes

- **Read-only epic** — no source, config, or hook is modified; only `baseline.md` is appended to. No backup needed.
- **Secret-safety:** for `insecure-private-key` / `hard-coded-secret` findings, record **rule id + file + line only** — never transcribe the flagged value into `baseline.md`.
- Classifications are **preliminary** (authoritative triage is M2-E1); one-word class per finding, short note only where non-obvious.
- Validation is read-only: re-run gates, count rows, and `git status`.
- All work in `packages/diamonds/` on branch `chore/pre-push-security-gates` (created in M0-E1).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 Confirm on branch `chore/pre-push-security-gates` (created in M0-E1) — not `main`
  - [x] 0.2 No backup/snapshot required (read-only; only `baseline.md` appended) — note explicitly
  - [x] 0.3 Capture pre-change baseline: `git -C packages/diamonds status --short` (expect only project docs + pre-existing `yarn.lock`)
- [x] 1.0 Capture & record per-gate findings in `baseline.md` (Findings section)
  - [x] 1.1 **npm audit** — run the M0-E1 command; record both advisory ids (`1115810`, `1120370`), title/URL, `lodash@4.17.21`, "no upstream 4.x patch" (mitigation → M1)
  - [x] 1.2 **semgrep** — run the M0-E1 command with full output; build a table of all **10** findings (`# | rule id | file | line | preliminary class`), class ∈ {Solidity-on-fixture, TS/any, genuine}. **Do not transcribe any flagged secret value** — location only
  - [x] 1.3 **git-secrets** (clean) + **tests** (invocation + current count ~51/0) subsections
  - [x] 1.4 **slither** — record best-effort result (errors: crytic-compile `KeyError: 'output'`, does-not-run) as M3 evidence
- [x] 2.0 Author the tooling-repo rationale note in `baseline.md`
  - [x] 2.1 Write the rationale paragraph: diamonds is a TS library/tool; in-repo Solidity contracts are test fixtures; contract-security analyzers applied with that lens — **not** a blanket waiver (audit + semgrep-on-product-code stay enforced). Mark it the single source cited by M2 + M3
- [x] 3.0 Validate the change
  - [x] 3.1 Confirm the semgrep table has **10** rows and the audit subsection names **both** advisory ids
  - [x] 3.2 Confirm **no secret value** was transcribed (grep the new sections for obvious key/secret patterns; locations only)
  - [x] 3.3 Confirm `git -C packages/diamonds status --short` shows no source/config/hook change — only `baseline.md` (+ this epic's docs)
- [x] 4.0 Record the change
  - [x] 4.1 Append what was produced (findings for all 5 gates + rationale) to `Milestone-00/Epic-02/CHANGELOG.md`
  - [x] 4.2 Commit only the project docs (exclude the pre-existing `yarn.lock`) with a Conventional Commit message referencing Task 4.0
