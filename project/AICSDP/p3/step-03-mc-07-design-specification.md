# Step 03 Design Specification — MC-07 Information Architecture

> **Artifact type:** IA (sub-template C) · **Subject:** `@diamondslab/diamonds` v2.0 documentation
> **Status:** ✅ **FINALIZED v1.0 — OP-4 ratified (draft-and-react, Owner 2026-07-07)** · **Date:** 2026-07-07 · **Interview mode:** draft-and-react
> **Owner reactions applied:** L2 = 6 docs (added `upgrades-and-callbacks`); cut-safety rule accepted as drafted; api/\* scope = min signatures+one-liners / stretch prose.
> **Inputs:** Plan §6.3 (4 design questions), §5.3 (per-doc cut staging), §8 (Branch-2); Session 1 briefs (MC-04 §2.5, MC-21 §2.4, MC-12 §2.4); repo docs reality (`README.md`, `docs/`, `examples/`); toolkit step-03 sub-template C.

---

## §1 — Brief Intake Confirmation

MC-07 (Plan §6.3): design the v2.0 documentation **Information Architecture** — a three-layer structure (Quickstart / Core Concepts / Reference) plus colocated working examples. Resolves **F-25/F-40** (docs-vs-code gap) and **F-41** (auditor reproducibility surface) at the IA level. Four Plan §6.3 design questions: (1) Layer 2 concept-doc list + ordering; (2) cross-layer link structure; (3) doc-authoring style guide; (4) Layer 3 per-doc scope. Dominant principle lens: **Maintainability 1.5×**. Branch-2 obligation: the IA must survive **per-doc cuts**.

**Current-state grounding [CONFIRM]:** docs today are unlayered and scattered — `README.md` (feature list + partial usage), `docs/` holds 5 ABI-generator files, `defender-integration.md`, `testing-guide.md`, `monitoring-troubleshooting.md`, `ROADMAP.md`, and `.uxf` design diagrams; `examples/` holds defender/local/config/test example dirs. No quickstart, no conceptual layer, reference is fragmentary. This _is_ the F-25/F-40 gap.

## §2 — Design Specification

### C.1 — Layer Structure

**Three layers**, each with a distinct job:

| Layer                | Job                                                           | Entry                                     |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------- |
| **L1 Quickstart**    | First-use: from zero to a locally-deployed diamond in <15 min | On-ramp from `README.md`                  |
| **L2 Core Concepts** | Understanding: the mental model behind the API (5–6 docs)     | Independently enterable; L1 links forward |
| **L3 Reference**     | Depth: per-module / per-strategy / per-flow detail            | Independently enterable; L2 links forward |

- **Reader path:** `README` → L1 Quickstart → (as needed) L2 Core Concepts → (as needed) L3 Reference. Off-ramps: each L2 doc links forward to the relevant L3 doc; each L3 doc links back to its L2 concept.
- **Layer interdependency:** layers are **independently enterable** — an experienced Diamond dev can jump straight to L3; a new user follows L1→L2. Deep understanding does _not_ require reading lower layers linearly. This independence is the backbone of per-doc-cut safety.

### C.2 — Doc Set Composition (Design Q1 + Q4)

**L1 Quickstart (1 doc):**

| Doc             | Purpose                                                                             | ~Length | Variance |
| --------------- | ----------------------------------------------------------------------------------- | ------: | -------- |
| `quickstart.md` | Install → configure a minimal diamond → deploy locally → read the deployment record |  2–3 pp | Low      |

**L2 Core Concepts (6 docs — ordered; doc 6 added per OP-4 reaction):**

| #   | Doc                                               | Purpose                                                                                                           | ~Length | Variance |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------: | -------- |
| 1   | `concepts/deployment-model.md`                    | The config → strategy → deployment-record pipeline (the _first-deploy_ path)                                      |  2–3 pp | Low      |
| 2   | `concepts/strategy-pattern.md`                    | Base/Local/RPC strategies; the 15 lifecycle methods; extension via hooks (**anchors MC-04**)                      |  3–4 pp | Med      |
| 3   | `concepts/configuration-and-versioning.md`        | JSON config, Zod validation, facet/selector versioning, collision resolution                                      |  2–3 pp | Med      |
| 4   | `concepts/deployment-records-and-repositories.md` | The Repository pattern; record schema; persistence                                                                |    2 pp | Low      |
| 5   | `concepts/diamond-abi-and-types.md`               | Combined Diamond ABI generation + TypeChain types                                                                 |    2 pp | Low      |
| 6   | `concepts/upgrades-and-callbacks.md`              | Deploy-vs-upgrade detection (`DiamondDeployer` finds an existing deployment → upgrade); post-deployment callbacks |  2–3 pp | Med      |

**L3 Reference (per-doc, cut-stageable):**

| Doc                                                        | Purpose                                                                                       | ~Length | Variance                                                   |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------: | ---------------------------------------------------------- |
| `reference/api/` (core, strategies, repositories, schemas) | Per-module API reference                                                                      |   large | **High** (min: signatures+one-liners; stretch: full prose) |
| `reference/how-to-write-a-strategy.md`                     | Extend `BaseDeploymentStrategy` — worked via **`LoggingDeploymentStrategy`** (**MC-04 §2.5**) |  2–3 pp | Med                                                        |
| `reference/migration-v1-to-v2.md`                          | The `examples/migration-v1-to-v2.md` migration doc (**MC-21 §2.4**, co-authored w/ MC-04)     |  2–3 pp | Med                                                        |
| `reference/verify-a-release.md`                            | The four-spoke auditor flow (**MC-12 §2.4**) — F-41 surface                                   |  2–3 pp | Med                                                        |
| `reference/config-schema.md`                               | The Diamond config JSON schema, field by field                                                |    2 pp | Med                                                        |

_Per-doc variance is highest in `reference/api/` — Plan §5.3 cut-staging applies: min = signatures + one-line descriptions; stretch = full prose per symbol._

### C.3 — Cross-Link Graph (Design Q2) — **per-doc-cut safe**

**Governing rule:** _links are navigational, never load-bearing._ No doc's **content** depends on another doc existing; a cut doc leaves at worst a dangling forward-link (gracefully degradable), never a broken concept.

```
README ──► L1 quickstart
              │ (forward, optional)
              ▼
        ┌─────────────── L2 Core Concepts ───────────────┐
        │ deployment-model ─► strategy-pattern           │   (intra-L2 links are
        │ configuration ─► deployment-records            │    forward-only, acyclic)
        │ deployment-model ─► upgrades-and-callbacks     │
        │ diamond-abi-and-types                          │
        └───────┬───────────────┬───────────────┬────────┘
                │ (each L2 ─► its L3)            │
                ▼               ▼                ▼
        L3: how-to-write-a-strategy   api/*   migration-v1-to-v2
            verify-a-release          config-schema
   (L3 ◄─ back-links to L2 concept; L3 docs do NOT hard-link each other)
```

- **Within-layer:** only L2 has intra-layer links, all **forward/acyclic** (deployment-model → strategy-pattern; configuration → deployment-records). No L2 doc's meaning requires another.
- **Cross-layer:** L1→L2 (forward, optional), L2→L3 (concept→reference), L3→L2 (back-link to parent concept). **L3 docs never hard-link each other** — this is what keeps a single L3 cut from cascading.
- **External:** ERC-2535 EIP, Hardhat docs, ethers `Signer` docs, CycloneDX spec (from `verify-a-release.md`).
- **Cut-safety demonstrated:** cutting any single L3 doc (e.g. `config-schema.md`) breaks only its inbound L2 forward-link, which degrades to prose ("see the config schema") — no other doc loses meaning. Cutting an L2 doc drops its forward-links to L3 but L3 docs remain independently valid.

### C.4 — Style Guide (Design Q3)

- **Voice:** second-person ("you") for L1/L2/how-to; impersonal for L3 api/schema reference.
- **Code blocks:** language-tagged (` ```typescript `, ` ```bash `, ` ```json `); **no line numbers**; output in a separate fenced block labeled `# output`. Imports shown explicitly (no elision) in L1/how-to.
- **Cross-links:** relative paths (`../concepts/strategy-pattern.md`); descriptive link text (never "here"); anchors lowercase-kebab.
- **Headings:** H1 = doc title only; H2 = major sections; H3 = subsections; deeper requires rationale.
- **Code-vs-prose ratio:** L1/how-to code-heavy (≥50% code); L2 balanced; L3 api = signature + concise prose.
- **Package-manager convention:** Yarn 4 in repo-facing snippets (matches README); note npm/pnpm work for consumers.

### C.5 — Per-Doc Scope (Design Q4 — abbreviated; full table in the finalized brief)

Each doc specifies: section list · included · excluded (with pointer to where it lives) · examples. Illustrative:

- **`quickstart.md`** — §Install, §Minimal config, §Deploy local, §Read the record. _Excludes_ upgrades, RPC, custom strategies (→ L2/L3). _Example:_ a 3-facet local diamond.
- **`concepts/strategy-pattern.md`** — §Why strategies, §Base/Local/RPC, §The 15 lifecycle methods, §Extending via hooks. _Excludes_ the full worked subclass (→ `how-to-write-a-strategy.md`). _Example:_ the hook signatures from `BaseDeploymentStrategy`.
- **`concepts/upgrades-and-callbacks.md`** _(added per OP-4)_ — §Deploy-vs-upgrade detection, §How `DiamondDeployer` decides, §Post-deployment callbacks and when they run. _Excludes_ first-deploy pipeline (→ `deployment-model.md`) and per-facet versioning mechanics (→ `configuration-and-versioning.md`). _Example:_ an upgrade that adds one facet + a callback that initializes it.
- **`reference/verify-a-release.md`** — §What's in a release-evidence bundle, §The four spokes (Integrity/CommitIdentity/Content/Reproduction), §Running it as a fresh AI session. _Excludes_ the manifest schema internals (→ MC-12 brief). _Example:_ the auditor prompt skeleton.
- **`reference/api/*`** — **min:** exported symbol signatures + one-line description; **stretch:** params/returns/throws prose + example per symbol. Plan §5.3 cut point.

### C.6 — Verification Approach

- **AI proxy-reader test:** 5 questions against the deployed docs at **≥80%** correct (Plan §6.3 method). Question _text_ is refined in the **Verification brief (M1-E3)** and made Phase-6-executable in **Step 05**.
- **Auditor-persona check:** `reference/verify-a-release.md` specifically gets an auditor-reader pass (F-41): can a fresh AI session verify a release from the doc alone?
- **Link integrity:** link-checker clean (and — because links are navigational-only — a broken link never means a broken concept).

### C.7 — Rejected Alternatives at IA Level

| Alternative                                   | Why rejected                                                                                                                                                               |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flat single-README** (status quo, expanded) | Doesn't close F-25/F-40; no auditor surface; unmaintainable at scale                                                                                                       |
| **Two-layer (Tutorial + Reference)**          | Leaves the conceptual gap — readers can _do_ but not _understand_; weak mental model                                                                                       |
| **Tool-generated API docs only (TypeDoc)**    | No conceptual layer, no auditor flow; F-41 unmet; generated prose reads poorly                                                                                             |
| **Four-layer (add a "Guides/How-To" layer)**  | Over-couples: how-to docs cross-reference each other and cascade on cuts — weakens the Branch-2 mitigation. How-tos instead live _inside_ L3 reference as independent docs |

## §3 — Phase 5 Estimate Refinement

Per Plan §5.3, refinement is available at the **per-doc** level for L3 (high variance). Draft position: total IA authoring holds at the Plan estimate; the `reference/api/*` min/stretch band (C.5) is the primary variance carrier. _To confirm at reaction._

## §4 — Rejected Alternatives at Specification Level

See C.7 (IA-level). No lower-level spec alternatives beyond those.

## §5 — Per-Artifact Principle Scorecard Contribution (draft)

| Principle                | Wt   | Draft verdict | Rationale                                                                             |
| ------------------------ | ---- | ------------: | ------------------------------------------------------------------------------------- |
| Security                 | 1.5× |          PASS | Docs specify no secret handling; migration doc uses placeholder ARN only              |
| Maintainability          | 1.5× |          PASS | Layered IA + per-doc-cut safety + style guide = maintainable, extensible docs         |
| Economics                | 1.0× |          PASS | Cut-staging (C.5) bounds authoring cost; style guide accelerates Phase-5 AI authoring |
| Operations               | 1.0× |          PASS | `verify-a-release.md` + monitoring content surfaces ops without elevation             |
| Scoring & Metrics        | 1.0× |          PASS | Proxy-reader ≥80% is a measurable gate                                                |
| Correctness Verification | 1.5× |          PASS | C.6 proxy-reader + auditor-persona verification designed in                           |

**Draft: 6 PASS.** _Pending OP-4 ratification._

## §6 — Phase 2 Invalidation Check

**No.** MC-07 designs deferred v2.0 docs; nothing in the shipped 1.5.0 invalidates it. (Consistent with M0 no-amendment verdict.)

## §7 — Phase 5 Implementability Check

Implementable: each doc is independently authorable; the style guide is a reusable context package; L3 api can be cut to min. No blocking gaps.

## §8 — Forward Handoff Notes

- **Verification brief (M1-E3):** refine C.6 proxy-reader into an actual 5-question set (F.2.B).
- **Step 04:** the three cross-brief L3 docs (how-to-write-a-strategy, migration, verify-a-release) are shared artifacts — reconcile authorship/attribution.
- **Phase 5:** author in layer order L1→L2→L3; `reference/api/*` last (cut candidate).

## §9 — Cross-Brief References

- **MC-04 §2.5** → `reference/how-to-write-a-strategy.md` (LoggingDeploymentStrategy worked example).
- **MC-21 §2.4** → `reference/migration-v1-to-v2.md` (migration doc, co-authored; effort attributed to MC-04).
- **MC-12 §2.4** → `reference/verify-a-release.md` (four-spoke auditor flow).
- **[P3-Obs-09 note]:** the MC-21 cohort citation drift is a Step-04 fix, not an MC-07 concern.

## §10 — Confidence and Code-Access Notes

Docs reality grounded by direct repo read `[CONFIRM]`. Cross-brief anchors grounded on Session 1 artifacts `[CONFIRM]`. Layer/doc-set decisions are design proposals `[QUESTION]` pending OP-4 reaction.

## Version History

| Version    | Date       | Change                                                                                                                                                       |
| ---------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v0.1-draft | 2026-07-07 | Initial draft for OP-4 draft-and-react                                                                                                                       |
| v1.0       | 2026-07-07 | OP-4 ratified. Applied Owner reactions: L2 → 6 docs (added `upgrades-and-callbacks`); cut-safety rule accepted; api/\* min=signatures+one-liners. Finalized. |
