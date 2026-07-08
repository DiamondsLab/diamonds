# Step 05 — Verification Strategy (Phase-6-Executable Instruments)

> **Status:** ✅ FINALIZED v1.0 — OP-8 ratified (draft-and-react, Owner 2026-07-07) · **Date:** 2026-07-07
> **Consumes:** Verification brief F.2 (M1-E3); Coordination Register §5 (M2-E1); Plan §6 per-MC verification methods. **Central discipline:** instruments, not descriptions. **Interview mode:** draft-and-react.
> **Purpose:** refine I-1..I-4 into Phase-6-executable form so Step 06 moves Correctness Verification CONDITIONAL → PASS.

---

## I-1 — Conformance Suite (MC-04) — 17 cases enumerated

**Execution:** per-PR CI, block-merge. **Output:** `diamonds-conformance-v1.0` JSON (bundled by MC-12).

**Category 1 — Lifecycle (5): each phase invokes pre/main/post in order.**

| ID             | Input                                | Expected                                | Predicate              |
| -------------- | ------------------------------------ | --------------------------------------- | ---------------------- |
| C1-01 Deploy   | subclass; `deployDiamond()`          | order `[preDeploy, deploy, postDeploy]` | `callLog === expected` |
| C1-02 Cut      | pending facet change; `diamondCut()` | `[preCut, cut, postCut]`                | `callLog === expected` |
| C1-03 Callback | post-deploy callback registered      | `[preCallback, callback, postCallback]` | `callLog === expected` |
| C1-04 Registry | facet add/replace/remove             | `[preRegistry, registry, postRegistry]` | `callLog === expected` |
| C1-05 Verify   | post-deploy verification phase       | `[preVerify, verify, postVerify]`       | `callLog === expected` |

**Category 2 — Post-condition (7): each method leaves documented state.**

| ID    | After                         | Predicate                                              |
| ----- | ----------------------------- | ------------------------------------------------------ |
| C2-01 | `deployDiamond()`             | `record.diamondAddress` set; `record.facets` populated |
| C2-02 | `diamondCut()` add            | selectors ∪ new; no collisions                         |
| C2-03 | `diamondCut()` replace        | selector→facet remapped; count stable                  |
| C2-04 | `diamondCut()` remove         | selectors ∖ removed                                    |
| C2-05 | callback                      | callback side-effect state present                     |
| C2-06 | `updateDeployedDiamondData()` | persisted record == in-memory                          |
| C2-07 | verify phase                  | on-chain selectors == record selectors                 |

**Category 3 — Edge-case (5): MC-04 Branch-1 mitigation.**

| ID    | Scenario                                    | Predicate                                            |
| ----- | ------------------------------------------- | ---------------------------------------------------- |
| C3-01 | partial deployment (fail mid-facet)         | no diamond address persisted; record rolled back     |
| C3-02 | multi-call atomicity (cut throws mid-batch) | record unchanged from pre-call snapshot              |
| C3-03 | deployment-record migration (old schema)    | migrated record validates against current Zod schema |
| C3-04 | re-deploy detection                         | `DiamondDeployer` upgrades, does not re-create       |
| C3-05 | selector collision                          | collision detected; deploy aborts with typed error   |

**Failure handling:** any case fails → block merge. **Coverage:** all 15 lifecycle methods + 3 documented edge cases.

## I-2 — MK-01 Byte-Identity Test (MC-21) — fixture + predicate

**Fixture:** deploy a fixed 3-facet diamond twice against the same `ethers.Wallet` — once via v1.3.2 `RPCDeploymentStrategy(rpcUrl, privateKey, …)`, once via v2.0 `RPCDeploymentStrategy(signer, …)` with `signer = new ethers.Wallet(privateKey, provider)`.

**Predicate:**

```
normalize(artifact) = strip {addresses, nonces, timestamps, gasPrice} → { selectorSets, cutCalldata (minus addr), facetOrder }
assert deepEqual( normalize(v1_artifact), normalize(v2_artifact) )
```

**Execution:** per-PR CI, block-merge. **Verifies:** the Signer refactor changes the _injection surface_ only, not deployment output (SR-03 closure; MK-01 preserved).

## I-3 — Proxy-Reader Question Set (MC-07) — 5 questions + answer keys

**Success:** ≥80% (4/5) correct, fresh AI session against the deployed v2.0 docs. One question per reader need, spanning all three layers.

| #   | Layer      | Question                                                                                              | Answer key                                                                             |
| --- | ---------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Q1  | L1         | "Using only the Quickstart, what command deploys a diamond locally and where is the record written?"  | the documented deploy command; record path under the configured deployments dir        |
| Q2  | L2         | "Name the three built-in deployment strategies and what distinguishes RPC from Local."                | Base/Local/RPC; RPC uses an injected Signer/remote provider vs Local's Hardhat network |
| Q3  | L2→L3      | "To add a custom strategy, which base class do you extend and which methods are the extension hooks?" | `BaseDeploymentStrategy`; the `protected async …Tasks()` pre/main/post hooks           |
| Q4  | L3         | "From the migration doc, what constructor change does v2.0 make to RPCDeploymentStrategy?"            | `privateKey: string` → `signer: Signer` (clean break, no shim)                         |
| Q5  | L3/auditor | "From verify-a-release, list the four spokes and which checks SHA-256 integrity."                     | Integrity/CommitIdentity/Content/Reproduction; Spoke A = SHA-256                       |

**Discipline:** questions chosen to be representative of real reader needs (install, concept, extension, migration, verification).

## I-4 — Auditor-Persona Prompt (MC-12) — full prompt + rubric

**Persona:** external smart-contract auditor; fresh AI session; only an npm URL + GitHub release URL; no practitioner support; goal = confirm published code matches released source (F-41). **Target:** v2.0 six-file bundle + four spokes. **Grounding (M0-E2):** shipped 1.5.0 `release.yml` produces `npm publish --provenance` only (1 of 6 artifacts) — this instrument verifies the v2.0 target and documents that gap.

**Prompt:**

```
You are an independent smart-contract release auditor. You have ONLY:
  • npm package URL: <https://www.npmjs.com/package/@diamondslab/diamonds/v/2.0.0>
  • GitHub release URL: <…/releases/tag/v2.0.0>
No maintainer will answer questions. Starting from the release-evidence manifest
(diamonds-v2.0.0-release-evidence.json) as your entry point, execute:
  Spoke A — Integrity:      verify each listed file's SHA-256 == manifest.files[*].sha256.
  Spoke B — CommitIdentity: verify manifest.release.commit == GitHub release commit == npm provenance commit.
  Spoke C — Content:        review the CycloneDX 1.5 SBOM, the conformance output, and the migration doc for coherence.
  Spoke D — Reproduction:   (optional) yarn install --frozen-lockfile against the bundled lockfile; confirm SBOM consistency.
Report, per spoke: verified | discrepancies-found | incomplete — with the evidence you used.
```

**Expected-output rubric:**

- Well-formed release → all four spokes "verified".
- **Seeded-discrepancy check** (test harness): corrupt one file's bytes so its SHA ≠ manifest → **Spoke A must report "discrepancies-found"**; failure to catch = instrument defect.
- Missing provenance (the current 1.5.0 state) → Spoke B "incomplete" (documents the v2.0 gap).

## §5 — Executability & CV-Resolvable Check

| Instrument       | Executable?                            | Coverage gap?                             |
| ---------------- | -------------------------------------- | ----------------------------------------- |
| I-1 Conformance  | ✅ 17 concrete case tuples             | none                                      |
| I-2 MK-01        | ✅ fixture + normalize predicate       | none                                      |
| I-3 Proxy-reader | ✅ 5 Qs + answer keys                  | none                                      |
| I-4 Auditor      | ✅ full prompt + rubric + seeded check | 1.5.0 provenance-only noted (v2.0 target) |

**All four instruments are Phase-6-executable, not descriptions.** Consistent with Coordination Register §5. **The Correctness-Verification CONDITIONAL is RESOLVABLE** — Step 06 scorecard refresh reports CV → PASS.

## §6 — New Observations

- **P3-Obs-14:** Step 05 for a first-design Verification brief mostly _enumerates_ the Step 03 shape; the toolkit could note that a well-specified F.2 (shape + worked examples) makes Step 05 near-mechanical — a positive signal that the OP-6 "shape + worked examples" choice paid off. Route: Phase 3 v1.1 (methodology insight, low priority).

## Version History

| Version    | Date       | Change                                                                                       |
| ---------- | ---------- | -------------------------------------------------------------------------------------------- |
| v0.1-draft | 2026-07-07 | Initial Verification Strategy; four instruments refined to Phase-6-executable; CV resolvable |
| v1.0       | 2026-07-07 | OP-8 ratified. Finalized.                                                                    |
