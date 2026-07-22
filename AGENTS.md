# Project Context: Interslavic Lexicon & Learning Platform (interlex)

## Project Overview
This project is an advanced digital ecosystem, dictionary, and linguistic corpus for the **Interslavic language** (Medžuslovjanski / Межславянский) hosted at `interslavic-lexicon.com`. It provides tools for searching, learning, translating, and dynamically managing a complex network of vocabulary, text collections, and linguistic relations.

### Core Features
- **Lexicon (Лексикон):** A searchable dictionary database for Interslavic words with full grammatical paradigms, morpheme analysis, script-aware display (Latin/Cyrillic/IPA), comprehension scoring across Slavic languages, synonyms, antonyms, etymology links, and cognate word family visualization.
- **Translator (Перевод):** Real-time translation tools between Interslavic and 16+ natural Slavic languages. Translations include active external links to authoritative explanatory dictionaries (толковые словари) of the respective target languages.
- **Library (Библиотека):** A curated collection of texts, parallel reading materials, and literature written in or translated into Interslavic.
- **Textbook (Учебник):** Structured educational modules and grammar lessons (e.g., `/textbook/ru`).
- **Proto-Slavic Dictionary (ESSJa):** Searchable etymological dictionary of Slavic languages (Этимологический словарь славянских языков) at `/proto` with word detail pages.
- **Corpus (Корпус):** KWIC (KeyWord In Context) search engine at `/corpus` with tokenized documents, POS tagging, and word-level annotations.
- **Transliteration (Транслитерация):** Tool for converting between Interslavic orthographic systems at `/transliteration`.
- **User Settings:** Script preference (Cyrillic/Latin), theme (Light/Dark/System), and language (isv/ru/en) at `/settings`.

### Admin Dashboard & Role-Based Access Control (`/admin`)
The platform includes a secure Admin Panel for lexical database management with a granular permission system:
- **Role-Based Access (RBAC):** Three roles — `USER` (read-only), `MODERATOR` (limited permissions), `ADMIN` (full access). Super-admins can define feature-specific permissions and capability flags for Moderators via `FeaturePermission` model.
- **Moderator Controls:** Moderators perform CRUD operations on lexemes, translations, and texts strictly based on their assigned permissions.
- **Admin Sections:** Translation table, Synonym management, Antonym management, Root management, Word candidate approval, Duplicate word merging (`/admin/deduplication`), User management & permissions (`/admin/users`), Word CRUD (`/admin/words`, `/admin/words/create`, `/admin/words/[id]/edit`).
- **Linguistic Relations:** Advanced interface to link lexemes together, building semantic and structural networks:
  - **Synonyms (Синонимы):** Grouping words with similar meanings.
  - **Antonyms (Антонимы):** Mapping polar opposite meanings.
  - **Cognates / Word Families (Однокоренные слова):** Clusterizing words sharing the same historical or morphological root, visualized via radar chart.

### Word Detail Pages (`/words/[id]`)
Each word detail page displays:
- Latin/Cyrillic display + IPA transcription
- Part of speech, gender, declension, conjugation, stem class metadata
- **Morpheme analysis** (root, prefix, suffix breakdown)
- **Comprehension widget** showing which Slavic languages understand the word
- **Full grammatical paradigm**: Verb conjugation (3 numbers, 6 tenses), noun/adjective/pronoun/numeral declension, adverb comparison
- **Meanings** with usage examples rendered via Markdown
- **Translations** into 16 languages with external dictionary links
- **Synonyms** and **Antonyms** rendered as interactive links
- **Cognate/word family** radar chart visualization
- **Etymology links** to Wiktionary and Proto-Slavic ESSJa pages

### Already Shipped (previously listed as roadmap — do not re-propose as new work)
- **Word Frequency (Частотность):** `Lexeme.corpusFrequency`, `corpusFrequencyPerMln`, `corpusRank`, `corpusHapax`, plus `distributionD` (Juilland's D) and `cefrLevel` (A1–C2) already exist on the `Lexeme` model (`prisma/data.schema.prisma`) and are computed by `scripts/compute-lexicon-frequency.ts` / `lib/corpus/frequencies/`. Recomputation is exposed via `POST /api/admin/recompute-frequencies`.

### Future Roadmap & Upcoming Features (Keep in Mind During Dev)
- **Data Visualization Graphs:** Engineering interactive UI elements such as **synonym clouds** and relational connection graphs to visually map semantic and structural word proximity.
- **Semantic & Structural Similarity:** Introduction of vector embeddings or algorithmic scoring to determine similarity weights between words.

---

## Tech Stack & Code Quality
- **Framework:** Next.js 16 (App Router architecture).
- **Language:** TypeScript 5 (strict mode). **Strict Rule:** Avoid `any` type completely. Use explicit interfaces or models (e.g., `Session | null` from `next-auth`).
- **Authentication & Security:** NextAuth.js v5 (beta). Telegram (Credentials provider with HMAC-SHA256, `crypto.timingSafeEqual` for constant-time comparison) + Yandex OAuth2 + Google OAuth2 providers (`auth.config.ts`). Protect all `/admin` routes, API endpoints, and Server Actions with session verification checking **the specific `Feature` permission flag for the action being performed** — checking session/role alone is not sufficient (`lib/permissions.ts`: `requireRole`/`requirePermission` for Server Components, `checkPermission` for API routes/Server Actions). There is no central `middleware.ts` — every route checks this by hand, so new routes must not skip it.
- **Database:** Four SQLite databases, each with its own Prisma client and schema file — `auth.db` (`prisma/auth.schema.prisma`: User, Session, FeaturePermission, UserSettings), `interlex.db` (`prisma/data.schema.prisma`: Lexeme, Meaning, Morpheme, relations, 18 language tables, ProtoSlavicWord), `library.db` (`prisma/library.schema.prisma`: LibraryEntry), and `corpus.db` (`prisma/corpus.schema.prisma`: CorpusDocument/Segment/Sentence/Token). Prisma 7 ORM; clients exported as `prismaAuth`/`prismaData`/`prismaLibrary`/`prismaCorpus` from `lib/prisma.ts`. Never cross database boundaries in a single query/transaction.
  - **⚠️ The actual `.db` files live at the project root** (`interlex.db`, `auth.db`, `library.db`, `corpus.db`), *not* inside `prisma/` — only the `*.schema.prisma` source files are under `prisma/`. Confirmed by `.env` (`DATA_DATABASE_URL="file:./interlex.db"`, etc.) and `.env.development`'s `SQLITE_DB`. Double-check `.env`/`.env.development` before writing any DB path in a script — don't assume `prisma/interlex.db` or similar.
- **Styling:** Tailwind CSS 4 with CSS custom properties for theming (`@theme inline`), dark/light/system theme support via `next-themes`.
- **Localization:** `next-intl` with cookie-based locale detection (isv/ru/en). Integrated `LanguageSwitcher` component.
- **Data Fetching:** `@tanstack/react-query` for client-side data fetching.
- **UI Components:** `@tanstack/react-table` (infinite editable tables), `@tanstack/react-virtual` (virtual scrolling), `recharts` (radar charts), `react-markdown` (meaning rendering).

---

## Layout & Architecture Rules

### 1. Unified Navigation (`HeaderNav`)
- **Desktop Layout:** Items must align in a single horizontal row (`flex-direction: row`, `white-space: nowrap`) to maintain a clean layout without vertical warping.
- **Mobile Layout (<768px):** Must collapse into a semantic hamburger menu controlled via React state (`isOpen`).
- **Overlay Behavior:** The mobile menu dropdown **must use absolute positioning** (`position: absolute; top: 100%`). It must float *over* the main layout and **never** push, shift, or distort the page content underneath.
- **Interaction:** All mobile menu links must automatically close the drawer overlay on click (`setIsOpen(false)`).

### 2. Lexical Database Updates & Integrity
- **Bidirectional Relations:** Relations (Synonyms, Antonyms, Cognates, and the 9 other relation tables) must maintain relational integrity — linking Word A as a synonym to Word B must reflect bidirectionally. **Fixed 2026-07-22** via `lib/relations.ts` (`fetchSymmetricRelations`/`saveSymmetricRelation`), which treats each table's `sourceId`/`targetId` as an unordered edge: reads match either column and writes diff-and-update the edge set instead of only ever touching `sourceId`. **Always use these two helpers for any new code that reads or writes the 11 relation tables** (synonyms, antonyms, hypernyms, hyponyms, meronyms, holonyms, related_words, causes, effects, premises, conclusions) — do not write a new one-off `WHERE sourceId = ?` query, that is exactly the pattern that caused the original bug.
- **Extensible Schema:** Keep data structures flexible to easily accommodate future frequency indexes, data arrays for etymology, dictionary URLs, and node/edge weights for visualization graphs.
- **Script-Aware Rendering:** All word displays must support Cyrillic/Latin toggling via ISV conversion functions.

### 3. Server/Client Component Architecture
- **Pages** are server components that fetch session data; interactive features use `"use client"` components.
- **Multi-Database Access:** Auth queries use the `prismaAuth` client; lexical queries use `prismaData`; library texts use `prismaLibrary`; corpus data uses `prismaCorpus`. Never cross database boundaries in a single query/transaction.

---

## AI Agent Development Principles
- **Prevent UI Regressions:** Always double-check that mobile dropdown/hamburger updates do not break desktop alignments, and vice-versa.
- **Maintain High Density:** Keep code scannable, structural styles semantic, and avoid redundant CSS overrides.
- **Grammar Engine Awareness:** The project includes a sophisticated grammar engine (`lib/grammar/`) handling verb conjugation, noun/adjective/pronoun/numeral declension, adverb comparison, stem classification, morphonology, accent/tone generation, and enclitic processing. Changes to word display or admin editing must respect these grammatical structures.

---

## Corpus Tokenizer: DbAnalyzer Architecture

### Overview
`DbAnalyzer` (`lib/corpus/tokenizer/dbAnalyzer.ts`) is the primary POS tagger for corpus tokens. It takes a surface form and returns a `MorphoAnalysis` with three possible outcomes depending on recognition confidence.

### Constructor
```typescript
new DbAnalyzer(queryWordsByBase: WordQueryFn, validEndings: Set<string>)
```
- `queryWordsByBase`: callback that fetches `WordBaseRecord[]` from DB by hypothetical stem bases
- `validEndings`: set of known ending strings from the `ending_allophones` database table (seeded by `scripts/db/seed-endings.ts`)

### Three Outcomes (Traffic Light)

| Color | Condition | `isPartialMatch` | `matchCount` | `feats` |
|-------|-----------|-------------------|--------------|---------|
| **Green** | `exactMatches.length > 0` (grammar engine generated a matching form) | `false` | `N` | Filled by grammar engine |
| **Yellow** | No exact match, but stem prefix matches | `true` | `1` | `{}` (empty) |
| **Red** | No match at all | `null` (analyzeWord returns `null`) | 0 | `{}` |

### Core Algorithm

1. **`generateHypotheticalBases(clean)`**: Iterates ending lengths `0..MAX_END_LEN` (4), filtering candidates where the ending is in `validEndings` (or endLen=0). Stem must be ≥1 char (with exception for 0-ending: prepositions like "k", "v", "s" pass through).

2. **`matchForms(clean, words)`**: Calls `generateWordForms()` from the grammar engine for each candidate word, passing `flavor: word.flavor || 'CORE'` into `EngineWordInput`. Compares normalized surface forms. Returns all exact matches.

3. **`matchByStemPrefix(clean, words)`**: Fallback when grammar engine generates wrong endings (see Known Issue). Checks if surface form starts with `word.stem` (or `word.base`). Among candidates, prefers stems shorter than surface form (real word + ending) over stems equal to surface form. Selects longest matching stem.

### Flavor System (Regional Variants)
Words linked to multiple lexemes via `base_homonyms` table (JSON `wordIds` field) can specify regional flavor:
- `wordIds` stored as JSON array: `[123, 456]` (all CORE) or `[{id: 123, flavor: "CORE"}, {id: 456, flavor: "EAST"}]`
- `WordBaseRecord.flavor` passed through to `MorphoAnalysis.flavor` and to `EngineWordInput.flavor` in `matchForms`
- Currently verb/adj processors skip flavor (only CORE)

### validEndings Set
Populated from `ending_allophones` table (seeded by `scripts/db/seed-endings.ts`):
- Entries stored with `stemType`, `grammeme`, `value`, `flavorId`
- Current seed: 450 CORE endings covering noun stem types (o_hard, o_soft, a_hard, a_soft, u_basis, i_basis, consonant_n, consonant_s), adjective (adj_hard, adj_soft), and verb forms (present, aorist, imperfect, imperative, l-participle, active/passive participles), plus numeral/collective/adverb endings

### RESOLVED (2026-07-24): Grammar Engine Was Producing Wrong Endings

**Original problem**: The grammar engine (`lib/grammar/morphology/`) generated etymological Proto-Slavic endings (jers `ъ`/`ь`, nasal `ǫ`) that didn't match modern Interslavic forms. For example, `voda` (ā-stem, FEM, paradigm A) generated Acc sg `vodaǫ` instead of `vodu`.

**What we found**: The live `ending_allophones` DB table was NOT the "decoy" it first appeared to be — moderators had been manually correcting individual (stemType, grammeme) entries via `/admin/endings` for a while, and `getEnding()`/`getEndingByGrammeme()` in `endingLoader.ts` DO consult the DB before falling back to the hardcoded registries. So the *live* site was already serving mostly-correct noun endings; it was the **hardcoded registries** (used as the DB-unavailable fallback, and by `scripts/db/seed-endings.ts` to seed fresh databases) that still held the original Proto-Slavic values — a fresh install or a test run with no DB would still get the bug.

**Fix applied**:
- Extracted the corrected values straight from the live `ending_allophones` table and rewrote `SLAVIC_ENDINGS_REGISTRY` in `lib/grammar/endingsRegistry.ts` (all 8 noun stem types — fully corrected in DB, 100% coverage) and one entry in `ADJECTIVE_ENDINGS_REGISTRY` in `lib/grammar/adjective/index.ts` (FEM accusative singular).
- Applied the same jer-stripping pattern by analogy to `numeral_three`/`numeral_four` (confirmed with the project maintainer) and to the present-active-participle `-ǫšti/-ǫťa/-ǫťe/-ǫťi` endings (same nasal-vowel fix as below).
- **Separately discovered and fixed**: the nasal vowel has two orthographic representations in this codebase — `ǫ` (o+ogonek, Proto-Slavic-style) and `ų` (u+ogonek). Confirmed with the maintainer that **`ų` is the correct modern form**. Migrated `ǫ→ų` across every place that generates or displays modern ISV text: `lib/isv.ts` (`standardToSimple`, `isvToTranscription`, `isvToGlagolitic`, `standardToSimpleCyr`), `lib/flavors.ts` (`generateWestFlavor`), `lib/transliteration.ts` (`detectScript`, `etymCyrToEtymLat`, `etymLatToStdLat`). Left `lib/proto.ts` alone — it already correctly outputs `ų` on its Proto-Slavic→Interslavic conversion path, and its *input* side legitimately deals in real Proto-Slavic `ǫ`/`ǭ`. `lib/nsl.ts` and the various vowel-detection regexes in `stress.ts`/`accentUtils.ts`/`encliticEngine.ts`/`fourTonesGenerator.ts`/`numerals/*`/`pronoun/index.ts` already handled both characters — no change needed there.
- **Found and removed dead duplicate code** while investigating: `lib/grammar/noun/index.ts` had its own unused `SLAVIC_ENDINGS_REGISTRY` export (same name as the real one, zero importers — deleted); `lib/grammar/adjective/adjective.ts` was an entire orphaned duplicate of `adjective/index.ts` (zero importers — deleted). **Not dead**, and fixed separately: `lib/grammar/verb/conjugator2.ts` is a second, independently-live verb conjugator used directly by `app/words/[id]/Word.tsx`, parallel to `lib/grammar/verb/index.ts` used by the corpus/tokenizer engine — both needed the same `ǫšti→ųšti` etc. fix.
- Updated `scripts/db/seed-endings.ts` to seed the corrected values directly (including `FEMININE_OVERRIDES` for `a_hard`/`a_soft`), so re-running it is now safe/idempotent instead of reverting DB corrections back to Proto-Slavic.
- Deleted 168 orphaned legacy rows in `ending_allophones` that used an old short-format grammeme key (`SgNom`, `PlAcc`) nothing reads anymore (confirmed dead — `buildGrammeme()` only ever produces the long `Case=Nom|Number=Sing` format).
- Fixed the one directly-relevant assertion in `lib/grammar/morphology/morphology.test.ts` (bob nominative singular, was asserting the old `ъ`-suffixed form).

**Still open / explicitly out of scope for this pass**:
- `lib/grammar/morphology/morphology.test.ts` and `lib/grammar/__tests__/declineNoun.test.ts` are not wired to any test runner (no vitest/jest) — see "No working automated tests" below. `morphology.test.ts`'s other 9 failing assertions (verb/adjective/numeral/pronoun accent placement, adverb comparative, noun stem-extension) are a **separate, pre-existing bug in the four-tones accent engine**, confirmed unrelated to this endings fix (same failures reproduce against the pre-fix DB backup). `declineNoun.test.ts`'s fixtures still assert old Proto-Slavic forms and haven't been updated — low priority since nothing executes them yet.
- Verb present/aorist/imperfect/imperative endings and `numeral_two`/`collective_oje`/`collective_ero` were checked against the DB and found to already match the hardcoded registry (i.e., apparently never needed correction — no jers found in their values) — not independently verified by a linguist, just "nothing to fix by this method."

### Key Files
- `lib/corpus/tokenizer/dbAnalyzer.ts` — Core DbAnalyzer class
- `lib/corpus/tokenizer/types.ts` — `MorphoAnalysis` with `flavor` field
- `lib/corpus/tokenizer/morphology.ts` — Static fallback analyzer (used when DbAnalyzer returns null)
- `lib/corpus/tokenizer/index.ts` — Exports (does NOT export `createBaseQuery`)
- `app/api/corpus/analyze/route.ts` — API endpoint with lazy `getAnalyzer()` singleton; now requires `Feature.CorpusBuilder` (fixed 2026-07-22, was unauthenticated)
- `app/api/corpus/save/route.ts` — Save endpoint with lazy `analyzerPromise`; requires `Feature.CorpusBuilder`
- `scripts/db/seed-endings.ts` — Seed script for `ending_allophones` table. Now seeds the corrected modern-ISV values (fixed 2026-07-24) — safe to re-run
- `lib/grammar/morphology/engine.ts` — `generateWordForms()`, `stripCombiningAccents()`
- `lib/grammar/endingsRegistry.ts` — Modern ISV noun endings registry (fixed 2026-07-24, was Proto-Slavic)
- `lib/grammar/adjective/index.ts` — Adjective endings registry
- `lib/grammar/verb/index.ts` and `lib/grammar/verb/conjugator2.ts` — two independently-live verb conjugators (engine path vs. word-detail-page path) — keep both in sync when touching verb endings

---

## Security & Data-Integrity Audit (2026-07-22)

A full audit found and fixed the following (Phase 1 — see [ARCHITECTURE.md](ARCHITECTURE.md) "Known Issues & Technical Debt" for the complete list including still-open items like the grammar engine ending bug, non-bidirectional relations, missing DB indexes, and lack of test coverage):
- SQL injection in `app/api/lexicon/services.ts` search (was string-interpolated, now parameterized).
- Missing permission check on `POST /api/word-relations/save` (was session-only; now checks the relation-specific `Feature`).
- Unauthenticated `POST /api/synonyms/second-level` and `POST /api/corpus/analyze` (now require a session / `Feature.CorpusBuilder`).
- Non-constant-time HMAC comparison in Telegram auth (`auth.config.ts`, now uses `crypto.timingSafeEqual`).

When adding new API routes that mutate lexical or relation data, follow the pattern in `app/api/roots/[id]/route.ts` or `app/api/endings/route.ts`: `auth()` + `checkPermission(session, Feature.X)` returning `403`, not just a session-presence check.