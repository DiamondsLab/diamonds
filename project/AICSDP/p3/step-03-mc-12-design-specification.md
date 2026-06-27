# Design Specification Artifact — MC-12 brief

**Brief ID:** MC-12 brief
**Source MC(s):** MC-12 (Publish pipeline + provenance + release-evidence)
**Origin:** Plan §6.4 (primary)
**Primary Artifact Type:** Schema
**Secondary Type:** None
**Specification Date:** 2026-05-26
**Practitioner:** Solo maintainer (DiamondsLab)
**AI Model:** Claude Opus 4.7
**Improvement Plan Version:** v1.0 (2026-05-22, no amendments)
**Step 02 Register Reference:** Step 02 §2.4 (MC-12 brief)
**Status:** Draft — Pending Practitioner Final Review

> ⚠️ This artifact specifies the chosen mechanism at design level.
> It is Phase-5-implementable without further design work. Phase 4
> architecture decisions, Phase 5 implementation details, and Phase
> 6 verification execution are out of scope.

---

## §1 — Brief Intake Confirmation

| Field                                | Value                                                                                                                                                   | Confirmed                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Brief ID                             | MC-12 brief                                                                                                                                             | Yes                                  |
| Phase 2 chosen mechanism (full text) | "npm `--provenance` + cyclonedx-npm SBOM + lockfile snapshot + release-evidence artifact." (Plan §6.4)                                                  | Yes                                  |
| Plan §6.4 design questions           | Q1: Release-evidence artifact layout; Q2: SBOM contents required; Q3: Lockfile-snapshot format; Q4: Auditor use-flow                                    | Yes — all four addressed in §2 below |
| Inherited constraints                | HC-06 (no external certification required); F-41 (auditor reproducibility)                                                                              | Yes                                  |
| Verification method named in Plan    | Auditor-persona check: fresh AI session given npm URL + GitHub release URL verifies published code matches released source without practitioner support | Yes                                  |
| Artifact type (primary)              | Schema — confirmed against Step 02 §2.4 classification                                                                                                  | Yes                                  |
| Step 01 §11.1 gap carryover          | None                                                                                                                                                    | Yes                                  |
| Step 02 §7 carryover                 | None                                                                                                                                                    | Yes                                  |

---

## §2 — Design Specification

### §2.1 — Artifact Layout

**Design specification:**

Each v2.0+ release of `@diamondslab/diamonds` produces an **evidence bundle** consisting of individual files attached to the GitHub Release, accompanied by a manifest file that documents the bundle. The bundle's entry point is the manifest.

**Files in a v2.0.0 release bundle:**

| Artifact                  | Filename                                  | Format                                                      |
| ------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Manifest                  | `diamonds-v2.0.0-release-evidence.json`   | Custom JSON schema (see §2.1.2)                             |
| SBOM                      | `diamonds-v2.0.0-sbom.json`               | CycloneDX 1.5 JSON                                          |
| Lockfile                  | `diamonds-v2.0.0-yarn.lock`               | Raw Yarn lockfile (unmodified)                              |
| npm provenance            | `diamonds-v2.0.0-npm-provenance.json`     | npm provenance attestation v0.1                             |
| Conformance output        | `diamonds-v2.0.0-conformance-output.json` | Diamonds conformance schema v1.0 (defined by MC-04 Phase 5) |
| Migration doc (v2.0 only) | `diamonds-v2.0.0-migration-v1-to-v2.md`   | Markdown                                                    |

**Naming convention:** `diamonds-v<VERSION>-<artifact>.<ext>` — every filename carries the release version explicitly to prevent cross-release ambiguity when files are downloaded into a common folder.

**Future releases (v2.x and beyond):** Same six-file shape minus the migration doc (which is v2.0-specific). Future v3.0 would have its own `migration-v2-to-v3.md`.

#### §2.1.1 — Why files + manifest (not single archive)

A single archive (tarball or zip) would be opaque to the AI-auditor proxy-reader scenario Plan §6.4 specifies; AI sessions running in chat interfaces typically lack shell access to extract archives, so they couldn't inspect the bundle without practitioner intervention. Individual files + manifest gives the AI auditor: (a) an entry point for discovery (the manifest); (b) per-file integrity verification (the SHA-256 hashes); (c) freedom to fetch only the files relevant to their concern.

#### §2.1.2 — Manifest schema

The manifest file (`diamonds-v<VERSION>-release-evidence.json`) follows this schema:

```json
{
  "schemaVersion": "1.0",
  "release": {
    "tag": "v2.0.0",
    "diamondsVersion": "2.0.0",
    "publishedAt": "2026-08-15T12:34:56Z",
    "commit": "abc123def456..."
  },
  "files": {
    "sbom": {
      "path": "diamonds-v2.0.0-sbom.json",
      "sha256": "...",
      "format": "CycloneDX-1.5-JSON"
    },
    "lockfile": {
      "path": "diamonds-v2.0.0-yarn.lock",
      "sha256": "...",
      "format": "yarn-lock-v1"
    },
    "provenance": {
      "path": "diamonds-v2.0.0-npm-provenance.json",
      "sha256": "...",
      "format": "npm-provenance-attestation-v0.1"
    },
    "conformance": {
      "path": "diamonds-v2.0.0-conformance-output.json",
      "sha256": "...",
      "format": "diamonds-conformance-v1.0"
    },
    "migrationDoc": {
      "path": "diamonds-v2.0.0-migration-v1-to-v2.md",
      "sha256": "...",
      "format": "markdown"
    }
  },
  "externalReferences": {
    "npmPackage": "https://www.npmjs.com/package/@diamondslab/diamonds/v/2.0.0",
    "githubRelease": "https://github.com/DiamondsLab/diamonds/releases/tag/v2.0.0",
    "githubCommit": "https://github.com/DiamondsLab/diamonds/commit/abc123..."
  },
  "verificationChecks": {
    "integrity": "Verify each file's SHA-256 hash matches manifest",
    "commitIdentity": "Verify manifest commit, GitHub release commit, and npm provenance commit all match",
    "content": "Inspect SBOM, conformance output, and migration doc for content review",
    "reproduction": "Optionally run 'yarn install --frozen-lockfile' against the lockfile and verify SBOM consistency"
  }
}
```

The `schemaVersion` field versions the manifest schema itself; future evolution increments this. The `verificationChecks` field documents the four-spoke auditor flow (per §2.4) inside the manifest for AI-auditor discovery.

### §2.2 — Format Requirements

**Format decisions per file:**

| Evidence file      | Format                                                          | Rationale                                                                                                                                    |
| ------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| SBOM               | **CycloneDX 1.5 JSON**                                          | Plan §6.4 specifies CycloneDX baseline; `cyclonedx-npm` produces 1.5 JSON by default; JSON is AI-auditor-parseable; XML variant adds nothing |
| Lockfile           | **Raw `yarn.lock` (unmodified)**                                | The lockfile IS the source of truth for Yarn dependency resolution; any derived form would diverge or require additional verification        |
| npm provenance     | **npm provenance attestation v0.1 JSON**                        | Format determined by npm's tooling; not a Diamonds choice                                                                                    |
| Conformance output | **Diamonds-specific JSON schema (`diamonds-conformance-v1.0`)** | Defined by MC-04 brief's Phase 5 implementation; MC-12's manifest references it as `files.conformance.format`                                |
| Migration doc      | **Markdown**                                                    | Designed in MC-04 §2.1 and MC-21 §2.4 as `examples/migration-v1-to-v2.md`                                                                    |
| Manifest           | **Custom JSON schema** (per §2.1.2)                             | Diamonds-specific; `schemaVersion: "1.0"`                                                                                                    |

**SBOM extension policy:** **No Diamonds-specific extensions** beyond CycloneDX 1.5 baseline. Pure CycloneDX semantics. Diamonds-specific facts that need surfacing (conformance claims, migration narrative) are carried by other evidence files in the bundle, not by SBOM extensions.

Rationale: Adding `diamondslab:` namespace properties would only pay weight if there were a downstream consumer using them (none this cycle). HC-06 ("no external certification required") aligns with the minimal-extension posture. A future cycle can add extensions when a real consumer surfaces; v2.0 establishes the baseline.

### §2.3 — Composition Rules

**Build-coherence by construction.** The release pipeline (Phase 5 implementation) emits all six files from a single coordinated invocation. Cross-file content consistency is guaranteed at the source (the build), not verified at the destination (the audit).

**Phase 5 implementation requirement:** The MC-12 release pipeline runs the following steps atomically within a single CI job:

1. Capture the commit SHA and timestamp
2. Run `cyclonedx-npm` to generate the SBOM from the lockfile
3. Capture the raw `yarn.lock` as-is
4. Run the MC-04 conformance suite to produce conformance output
5. (For v2.0 only) Include the migration doc from the repo
6. Compute SHA-256 hashes for all files
7. Build the manifest with the hashes, commit, timestamp, and external references
8. Upload all files to the GitHub Release atomically

If any step fails, the release pipeline fails the whole job; no partial bundle is published.

**Auditor's three mechanical integrity checks (per §2.4):**

1. **Each file's SHA-256** matches the hash in the manifest's `files.<name>.sha256`
2. **The manifest's `release.commit`** matches the GitHub release's commit (visible on the release page)
3. **The npm provenance** (in `files.provenance.path`) attests the same commit

If all three pass, the bundle's internal consistency is verified. Content review (Spoke C in §2.4) is a separate concern.

**Lockfile content scope:** **Raw `yarn.lock` only**. The SBOM provides JSON-formatted dependency listing for inspection; the lockfile provides reproduction (`yarn install --frozen-lockfile` against the raw file). Auditors who want to verify SBOM consistency against the lockfile run `yarn install --frozen-lockfile` and compare against the SBOM's dependency list (Spoke D — Reproduction).

### §2.4 — Consumer Use-Flow

**Hub-and-spoke auditor flow.** The manifest is the hub; four verification spokes branch from it.

```
Hub: Auditor fetches the manifest file (entry point)
       │
       ├──► Spoke A — Integrity
       │      Verify each file's SHA-256 matches manifest
       │
       ├──► Spoke B — CommitIdentity
       │      Verify manifest.release.commit = GitHub commit = npm provenance commit
       │
       ├──► Spoke C — Content
       │      Read SBOM + conformance output + migration doc; structural review
       │
       └──► Spoke D — Reproduction (optional)
              Run yarn install --frozen-lockfile against lockfile;
              verify SBOM consistency
```

**Auditor flow specification (for Verification brief's later refinement into auditor-persona prompt):**

1. **Entry:** Auditor receives the npm URL and GitHub release URL
2. **Discovery:** Auditor fetches the GitHub release page; downloads the manifest file (`diamonds-v<VERSION>-release-evidence.json`)
3. **Spoke selection:** Auditor reviews the manifest's `verificationChecks` field and chooses which spokes to exercise based on their concern (security audit may prioritize Integrity + CommitIdentity; content review may prioritize Content; reproducibility audit may prioritize Reproduction)
4. **Spoke execution:** For each chosen spoke, auditor performs the documented check
5. **Findings:** Auditor produces structured findings — "verified" / "discrepancies found" / "incomplete" per spoke; overall judgment on the bundle

**Why hub-and-spoke (not linear or decision-tree):** The verification method specifies "fresh AI session" — an AI auditor doing best work needs clear entry + well-defined checks + judgment freedom about prioritization. Linear flow constrains judgment; decision tree is for automated verifiers. Hub-and-spoke matches AI persona's working pattern.

### §2.5 — Sensitive Data Handling

**The release-evidence bundle does not carry sensitive data by construction.**

| Evidence file      | Sensitive data exposure                                                 | Handling                                                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manifest           | None — file paths, hashes, public URLs, public commit SHA               | No special handling                                                                                                                                                                                               |
| SBOM               | None — dependency names + versions + hashes are public package metadata | No special handling                                                                                                                                                                                               |
| yarn.lock          | None — same as SBOM; resolved versions and integrity hashes are public  | No special handling                                                                                                                                                                                               |
| npm provenance     | None — provenance attestation is signed by npm for public verification  | No special handling                                                                                                                                                                                               |
| Conformance output | Theoretical risk — could contain deployment-record fragments            | **Phase 5 implementation note:** Conformance test fixtures use deterministic test addresses (Hardhat default accounts); production deployment data does not enter conformance output                              |
| Migration doc      | None — markdown documentation with placeholder values                   | **Phase 5 authoring note:** Migration doc's AWS KMS example uses obvious placeholder values (e.g., `arn:aws:kms:us-east-1:123456789012:key/REPLACE-WITH-YOUR-KEY-ID`) to make the placeholder nature unmistakable |

**No active redaction discipline required** — the bundle's schema does not admit secrets by design. The auditor-persona check does not need to scan for secrets; it verifies content correctness.

### §2.6 — Rejected Schema Alternatives

#### Mechanism-level rejected alternatives (from Phase 2 Step 03 §2.4)

| Alternative                                     | Why rejected                                                                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **npm `--provenance` only**                     | Provides build attestation but not full reproducibility; insufficient for F-41 auditor-reproducibility constraint                                                                                       |
| **npm provenance + SLSA Level 2 certification** | SLSA Level 2 requires hosted-build-platform attestation infrastructure beyond what Diamonds operates; HC-06 explicitly excludes external certification this cycle                                       |
| **npm provenance + Sigstore signed releases**   | Adds key-management surface for release signing — practitioner key management is itself a security concern; provenance + SBOM + lockfile achieves the verifiability goal without the additional surface |
| **Release evidence in repo only (no SBOM)**     | Reproducibility check possible but no dependency-listing surface for vulnerability scanning; weaker auditor-reproducibility story                                                                       |

#### Specification-level rejected alternatives (during this Step 03 design walkthrough)

| Decision                          | Alternatives Considered                                                                               | Selected Option | Why Other Options Rejected                                                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artifact bundling                 | (i) Single archive; (ii) Individual files; (iii) Files + manifest                                     | **(iii)**       | (i) opaque to AI auditor; (ii) leaves "complete set" ambiguous; (iii) manifest provides discovery + integrity                                                     |
| Naming convention                 | (i) Versioned filename pattern; (ii) Short stable names; (iii) Versioned prefix structure             | **(i)**         | (ii) collision risk across releases; (iii) GitHub Release attachments are flat (no folders); (i) unambiguous                                                      |
| Diamonds-specific SBOM extensions | (i) None (pure CycloneDX); (ii) `diamondslab:` namespace properties; (iii) Sibling metadata file      | **(i)**         | (ii) speculative — no consumer this cycle; (iii) adds file; (i) HC-06 alignment                                                                                   |
| Cross-file integrity              | (i) Hash integrity only; (ii) Hash + content consistency check; (iii) Build-coherence by construction | **(iii)**       | (i) leaves bundle-level inconsistency possible; (ii) auditor does work that should be release pipeline's; (iii) pipeline is the integrity guarantor               |
| Lockfile content scope            | (i) Raw yarn.lock only; (ii) Raw + processed JSON; (iii) Processed JSON only                          | **(i)**         | (ii) duplicates SBOM role with two-version sync burden; (iii) loses reproduction property; (i) SBOM provides inspection, lockfile provides reproduction           |
| Auditor flow                      | (i) Linear flow; (ii) Hub-and-spoke; (iii) Decision tree                                              | **(ii)**        | (i) constrains AI judgment unnecessarily; (iii) prescriptive for automation, not AI persona; (ii) clear entry + judgment-friendly spokes                          |
| Sensitive-data handling           | (a) Construction-based exclusion + placeholders; (b) Active redaction discipline; (c) No discipline   | **(a)**         | (b) overkill — bundle doesn't admit secrets by schema design; (c) leaves risk; (a) discipline + placeholders catches the only real-risk file (conformance output) |

---

## §3 — Phase 5 Estimate Refinement

**No refinement.** Per Step 02 §6, MC-12 refinement was not expected (schema-class brief; narrower uncertainty). Phase 2's 1.6 maint-hrs ESTIMATED holds.

| Quantity                              |         Phase 2 Estimate | Phase 3 Refined Estimate | Tag       |
| ------------------------------------- | -----------------------: | -----------------------: | --------- |
| Dev-hours                             |                       ~8 |       **~8** (unchanged) | ESTIMATED |
| AI-acceleration multiplier (category) | 5× config edit (blended) |       **5× config edit** | BELIEVED  |
| Derived maintainer-hours              |                      1.6 |      **1.6** (unchanged) | ESTIMATED |

Design walkthrough surfaced no scope-changing edge cases.

---

## §4 — Cross-Brief References

| Related Brief             | Relationship                                                                                                         | Reference                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MC-04 brief**           | Conformance output format is defined by MC-04 Phase 5 work; included in this evidence bundle                         | The manifest's `files.conformance.format = "diamonds-conformance-v1.0"` is a placeholder; MC-04's Phase 5 implementation defines the actual schema |
| **MC-21 brief**           | The v2.0 migration doc is included in v2.0's evidence bundle                                                         | Migration doc co-authored across MC-04 + MC-21 briefs; evidence bundle includes the result as `diamonds-v2.0.0-migration-v1-to-v2.md`              |
| **MC-07 brief (Layer 3)** | Layer 3 reference docs include "how to verify a Diamonds release" documentation that references this evidence bundle | MC-07 Layer 3 doc set will include a release-verification guide referencing this specification                                                     |
| **Observability brief**   | Will insert touchpoints at the release pipeline (publish flow)                                                       | The release pipeline (CI job emitting the bundle) is the operational surface; Observability brief decides what gets observed                       |
| **Verification brief**    | Refines §2.4's hub-and-spoke auditor flow into a concrete auditor-persona prompt                                     | Step 05's Verification Strategy refines the four-spoke flow into actual prompt text                                                                |

---

## §5 — Per-Artifact Principle Scorecard Contribution

| Principle                | Weight | Per-Artifact Rating | Rationale                                                                                                                                                                                                                                                          |
| ------------------------ | -----: | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Security                 |   1.5× | **PASS**            | npm `--provenance` provides build attestation; SBOM provides supply-chain visibility for vulnerability scanning; §2.5 sensitive-data exclusion is by-construction; bundle does not introduce new key-management surface                                            |
| Maintainability          |   1.5× | **PASS**            | §2.3 build-coherence by construction means release pipeline is the integrity guarantor; §2.6 rejected alternatives documented; manifest schema is versioned (`schemaVersion: "1.0"`) so future evolution is explicit                                               |
| Economics                |   1.0× | **PASS**            | Phase 2's 1.6 maint-hrs estimate holds; design walkthrough surfaced no scope expansion; §2.6 rejected alternatives removed expensive options                                                                                                                       |
| Operations               |   1.0× | **PASS (baseline)** | Baseline weight preserved; release pipeline is the operational surface; Observability brief will produce touchpoint design for the publish flow                                                                                                                    |
| Scoring & Metrics        |   1.0× | **PASS**            | Per-artifact scoring discipline applied; 7 sub-decisions captured with rejected alternatives; cross-file integrity check (3 mechanical checks per §2.3) is the measurable verification surface                                                                     |
| Correctness Verification |   1.5× | **PASS**            | Bundle is _designed_ for the auditor-persona verification method (Plan §6.4); §2.4 hub-and-spoke flow with explicit `verificationChecks` field in the manifest enables AI-auditor discovery; the Verification brief refines into a concrete auditor-persona prompt |

**Weight-sensitivity flags:**

- **Highest sensitivity:** Correctness Verification (1.5×) — §2.1.1 (manifest + files architecture) and §2.4 (hub-and-spoke flow with documented checks) are the key decisions; weaker choices would have moved CV to CONDITIONAL
- **Medium sensitivity:** Security (1.5×) — §2.5 sensitive-data handling and §2.3 build-coherence are central
- **Lower sensitivity:** Maintainability, Economics, Operations, Scoring & Metrics — design decisions had limited material effect

**Below-threshold flags:** None. All six principles at PASS.

---

## §6 — Phase 2 Invalidation Check

| Field                                                          | Result         |
| -------------------------------------------------------------- | -------------- |
| Does this specification reveal Phase 2 mechanism invalidation? | **No**         |
| If Yes, invalidation report attached                           | Not applicable |

Each Plan §6.4 design question received a concrete answer:

- Q1 (artifact layout) → §2.1: individual files + manifest with versioned naming pattern
- Q2 (SBOM contents) → §2.2: pure CycloneDX 1.5; no Diamonds-specific extensions
- Q3 (lockfile-snapshot format) → §2.3: raw `yarn.lock` only
- Q4 (auditor use-flow) → §2.4: hub-and-spoke flow with manifest as entry point and four documented spokes

---

## §7 — Phase 5 Implementability Check

| Field                                                            | Result                                   |
| ---------------------------------------------------------------- | ---------------------------------------- |
| Can Phase 5 implement from this specification without ambiguity? | **Yes, with 3 pre-implementation tasks** |

### §7.1 — Phase 5 Pre-Implementation Tasks

| Pre-Implementation Task                                                                                                                                                                                 | Type                             | Resolution                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Release pipeline implementation** — the CI job that runs `cyclonedx-npm`, captures the lockfile, runs the conformance suite, builds the manifest, attaches all files to the GitHub Release atomically | Implementation detail            | Phase 5 designs the GitHub Actions workflow (or equivalent); design specification provides the _requirement_ (build-coherent emission) |
| **Conformance output JSON schema definition**                                                                                                                                                           | Cross-brief Phase 5 coordination | MC-04's Phase 5 work defines the schema; MC-12's Phase 5 work uses it via `files.conformance.format`                                   |
| **Manifest schema implementation** — TypeScript types or JSON Schema definition for `release-evidence.json`; CI verification                                                                            | Implementation detail            | Phase 5 writes the schema definition from the §2.1.2 specification                                                                     |

---

## §8 — Forward Handoff Notes

| Recipient Phase                      | What This Specification Provides                                                                                                                            | What Recipient Phase Must Do With It                                                                                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 4 (Architecture)**           | The release pipeline is a build-coherent emitter; the evidence bundle has a specific six-file shape with naming convention; the manifest is the entry point | Phase 4 considers: where in the build pipeline architecture the SBOM generation, lockfile capture, conformance run, and manifest generation steps live                           |
| **Phase 5 (Implementation)**         | The complete schema spec: manifest fields, file formats, naming conventions, build-coherence requirement, auditor flow documentation                        | Phase 5 implements the release pipeline; defines the manifest schema as TypeScript types or JSON Schema; coordinates with MC-04's Phase 5 work for the conformance output format |
| **Phase 6 (Testing & Audit)**        | The four-spoke auditor flow (Integrity / CommitIdentity / Content / Reproduction) with documented checks; the auditor-persona prompt source material        | Phase 6 (refined via Step 05) runs the auditor-persona check against v2.0 release; verifies bundle structure and content correctness                                             |
| **Phase 7 (Deployment & Evolution)** | The release-evidence bundle as the public-facing v2.0 launch artifact; manifest's externalReferences as discovery surface                                   | Phase 7 operates the release process; bundle becomes part of every v2.x release                                                                                                  |

---

## §9 — Cross-Brief References (Detailed)

See §4 above. Step 04 (Inter-Artifact Coordination) consumes this section.

---

## §10 — Confidence and Code-Access Notes

| Field                            | Value                                          |
| -------------------------------- | ---------------------------------------------- |
| Code-access mode (from Step 00)  | Hybrid with explicit flags                     |
| Code-derived claims flagged with | [CONFIRM] / [AWARE] / [QUESTION] as applicable |
| Overall specification confidence | High                                           |
| Specific low-confidence sections | None                                           |

**Code references in this specification:**

- No direct code reads required (MC-12 is a release-pipeline schema; current Diamonds repo has no MC-12 implementation to fetch — the pipeline is Phase 5 work)
- CycloneDX 1.5 format reference [AWARE — ecosystem standard; not separately verified via Context7 this session]
- npm provenance attestation v0.1 format reference [AWARE — npm's tooling output; not separately verified via Context7 this session]

---

## Version History

| Version | Date       | Source                                                 | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 2026-05-26 | Initial Step 03 production via Sub-Template D (Schema) | 7 specification-level decisions captured across D.1 (2), D.2 (1; rest constrained-by-ecosystem), D.3 (2), D.4 (1), D.5 (bundled); 7 specification-level + 4 mechanism-level rejected alternatives in §2.6. Per-artifact principle scorecard: 6 PASS / 0 CONDITIONAL / 0 FAIL. Phase 2 invalidation: No. Phase 5 implementability: Yes with 3 pre-implementation tasks. Phase 5 estimate refinement: No change (Phase 2's 1.6 maint-hrs confirmed). Schema designed around AI-auditor verification method (Plan §6.4); manifest as entry point with hub-and-spoke flow; six-file bundle with versioned naming convention; build-coherent emission. |

---

_Part of the Phase 3 (Existing Projects) Design & Technical Analysis Tool Set — v1.0_
_AI-Centric Software Development Playbook_
_Companion file: `design-technical-analysis.existing-project.instructions.md`_
_Previous step: MC-21 brief Design Specification Artifact_
_Next brief in Step 03 iteration sequence: MC-07 brief (IA sub-template) — Session 2_
