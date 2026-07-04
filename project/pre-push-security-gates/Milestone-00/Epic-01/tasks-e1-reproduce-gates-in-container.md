# Tasks — M0-E1 Reproduce Gates In-Container

## Relevant Files & Resources

- `../Epic-01/prd-e1-reproduce-gates-in-container.md` - The Change Plan this task list executes.
- `overview/e1-reproduce-gates-in-container.md` - The epic overview both docs expand.
- `packages/diamonds/.husky/pre-push` - Source of truth for each gate's exact command/flags (read-only reference).
- `packages/diamonds/package.json` - The `audit` / `semgrep:scan` / `slither:scan` / `git-secrets:scan` / `test` scripts each gate maps to (read-only reference).
- `packages/diamonds/.semgrep.yml`, `packages/diamonds/slither.config.json` - Scan configs (read-only reference).
- `packages/diamonds/project/pre-push-security-gates/baseline.md` - **Created here**: the "Reliable in-container invocations" table section (findings section is M0-E2).
- `packages/diamonds/project/pre-push-security-gates/Milestone-00/Epic-01/CHANGELOG.md` - epic change log to append.

### Notes

- **Read-only epic** — no source, config, or hook is modified; the only new file is `baseline.md`. No backup/snapshot needed.
- Each recorded command must **mirror the exact flags/config** of the corresponding `.husky/pre-push` line + `package.json` script — a command that "works" but differs is a defect.
- Validation commands are read-only: run each recorded command and confirm it completes **without** the yarn `findPackageLocation` error; confirm `git status` shows no source/config/hook change.
- All work happens in `packages/diamonds/` (the `@diamondslab/diamonds` submodule).

## Tasks

- [x] 0.0 Prepare & safeguard
  - [x] 0.1 In `packages/diamonds/`, create/checkout a working branch for the planning docs (e.g. `git checkout -b chore/pre-push-security-gates`) — or confirm the intended branch
  - [x] 0.2 No backup/snapshot required (read-only epic; only `baseline.md` is written) — note this explicitly
  - [x] 0.3 Capture the pre-change baseline: `git -C packages/diamonds status --short` (expect only the new project docs), and note current branch + working-tree state
- [x] 1.0 Establish reliable in-container invocations for the remaining gates (audit, semgrep, git-secrets)
  - [x] 1.1 **npm audit** — run `yarn npm audit --severity moderate` in `packages/diamonds/`; confirm it completes and returns the moderate result without the `findPackageLocation` error. If it trips the bug, record a working equivalent (e.g. `npm audit --audit-level=moderate`). Record the exact command + exit behavior
  - [x] 1.2 **semgrep** — run `semgrep scan --config .semgrep.yml --exclude-rule weak-encryption` (direct binary); confirm it completes and lists findings. Record the exact command + exit behavior (note: `--error` from the script is optional for the harness)
  - [x] 1.3 **git-secrets** — run `git secrets --scan`; confirm it completes (clean/dirty). Record the exact command + exit behavior
  - [x] 1.4 Cross-check each recorded command's flags/config against the matching `.husky/pre-push` line and `package.json` script; note any intentional divergence
- [x] 2.0 Record slither + tests current behavior (best-effort, not hardened)
  - [x] 2.1 **slither** — run `slither . --config-file slither.config.json --ignore-compile` best-effort; record whether it runs, needs compiled artifacts, or errors. Mark **not hardened** (removed in M3)
  - [x] 2.2 **tests** — note `yarn test` trips the state bug; record a working alternative only if trivial (e.g. `npx hardhat test`) and its current result. Mark **not hardened** (leaves the gate in M4)
- [x] 3.0 Assemble the "Reliable in-container invocations" table in `baseline.md`
  - [x] 3.1 Create `packages/diamonds/project/pre-push-security-gates/baseline.md` (if absent) with a header + timestamp + working-tree note
  - [x] 3.2 Write the table: columns `Gate | Exact in-container command | Exit behavior | Hardened? | Notes` — one row per gate (audit, semgrep, git-secrets = hardened; slither, tests = best-effort)
  - [x] 3.3 Add a one-line pointer that the **findings** for each gate are recorded by M0-E2 in the same file
- [x] 4.0 Validate the change
  - [x] 4.1 Re-run each hardened command (1.1–1.3) once more; confirm each completes without the `findPackageLocation` error and matches the recorded exit behavior
  - [x] 4.2 Confirm `git -C packages/diamonds status --short` shows no change to any source/config/hook — only the new `baseline.md` (+ project docs)
- [x] 5.0 Record the change
  - [x] 5.1 Append what was produced (the invocations table + which gates are hardened vs best-effort) to `Milestone-00/Epic-01/CHANGELOG.md`
  - [x] 5.2 Note in the CHANGELOG that M0-E2 will add the findings sections to the same `baseline.md`
