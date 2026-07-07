-- CreateTable
CREATE TABLE "lexemes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "external_id" INTEGER,
    "value" TEXT,
    "nsl" TEXT,
    "isv" TEXT,
    "transcription" TEXT,
    "field" TEXT,
    "type" TEXT,
    "pos" TEXT,
    "aspect" TEXT,
    "transitivity" TEXT,
    "animacy" TEXT,
    "degree" TEXT,
    "pronType" TEXT,
    "numType" TEXT,
    "frequency" TEXT,
    "intelligibility" TEXT,
    "addition" TEXT,
    "sameInLanguages" TEXT,
    "etymology" TEXT,
    "proto" TEXT,
    "paradigm" TEXT,
    "protoStemClass" TEXT,
    "stemExtension" TEXT,
    "genesis" TEXT,
    "stem" TEXT,
    "secondaryStem" TEXT,
    "tertiaryStem" TEXT,
    "governsCase" INTEGER,
    "gender" TEXT,
    "declension" INTEGER,
    "conjugation" INTEGER,
    "accentSyllable" INTEGER,
    "alternationType" TEXT,
    "fleetingVowelAt" INTEGER,
    "hasAnomalies" BOOLEAN NOT NULL DEFAULT false,
    "actionHistory" TEXT
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "isv" TEXT,
    "nsl" TEXT,
    "transcription" TEXT,
    "field" TEXT,
    "type" TEXT,
    "pos" TEXT,
    "aspect" TEXT,
    "transitivity" TEXT,
    "animacy" TEXT,
    "degree" TEXT,
    "pronType" TEXT,
    "numType" TEXT,
    "frequency" TEXT,
    "intelligibility" TEXT,
    "addition" TEXT,
    "sameInLanguages" TEXT,
    "etymology" TEXT,
    "proto" TEXT,
    "paradigm" TEXT,
    "protoStemClass" TEXT,
    "stemExtension" TEXT,
    "genesis" TEXT,
    "stem" TEXT,
    "secondaryStem" TEXT,
    "tertiaryStem" TEXT,
    "governsCase" INTEGER,
    "gender" TEXT,
    "declension" INTEGER,
    "conjugation" INTEGER,
    "accentSyllable" INTEGER,
    "alternationType" TEXT,
    "fleetingVowelAt" INTEGER,
    "hasAnomalies" BOOLEAN NOT NULL DEFAULT false,
    "actionHistory" TEXT,
    "promotedAt" DATETIME,
    "promotedToLexemeId" INTEGER
);

-- CreateTable
CREATE TABLE "Lexeme_text" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "lexemeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "meanings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lexemeId" INTEGER NOT NULL,
    "meaning" TEXT,
    "examples" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meanings_lexemeId_fkey" FOREIGN KEY ("lexemeId") REFERENCES "lexemes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "morphemes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "type" INTEGER DEFAULT 0,
    "actionHistory" TEXT
);

-- CreateTable
CREATE TABLE "Morpheme_text" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "morphemeId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "lexemes_morphemes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lexemeId" INTEGER,
    "morphemeId" INTEGER,
    CONSTRAINT "lexemes_morphemes_lexemeId_fkey" FOREIGN KEY ("lexemeId") REFERENCES "lexemes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "lexemes_morphemes_morphemeId_fkey" FOREIGN KEY ("morphemeId") REFERENCES "morphemes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "synonyms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER,
    "targetId" INTEGER,
    "proximity" REAL,
    CONSTRAINT "synonyms_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "synonyms_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "antonyms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER,
    "targetId" INTEGER,
    "proximity" REAL,
    CONSTRAINT "antonyms_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "antonyms_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "en" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "en_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "en_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ru" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "ru_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ru_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "mk_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mk_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sr" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "sr_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sr_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "uk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "uk_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "uk_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bg" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "bg_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bg_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "pl_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pl_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "be" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "be_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "be_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "cs_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cs_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "sk_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sk_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "sl_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sl_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "hr" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "hr_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "hr_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "cu_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cu_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "de" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "de_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "de_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "nl_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "nl_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "eo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "value" TEXT,
    "veryfied" INTEGER,
    "wordId" INTEGER,
    "meaningId" INTEGER,
    "actionHistory" TEXT,
    CONSTRAINT "eo_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "eo_meaningId_fkey" FOREIGN KEY ("meaningId") REFERENCES "meanings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "base_homonyms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "base" TEXT NOT NULL,
    "wordIds" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "inflection_anomalies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lexemeId" INTEGER NOT NULL,
    "inflection" TEXT NOT NULL,
    "grammeme" TEXT NOT NULL,
    CONSTRAINT "inflection_anomalies_lexemeId_fkey" FOREIGN KEY ("lexemeId") REFERENCES "lexemes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "lexemes_slug_key" ON "lexemes"("slug");

-- CreateIndex
CREATE INDEX "lexemes_slug_idx" ON "lexemes"("slug");

-- CreateIndex
CREATE INDEX "candidates_value_idx" ON "candidates"("value");

-- CreateIndex
CREATE INDEX "candidates_isv_idx" ON "candidates"("isv");

-- CreateIndex
CREATE INDEX "candidates_pos_idx" ON "candidates"("pos");

-- CreateIndex
CREATE UNIQUE INDEX "base_homonyms_base_key" ON "base_homonyms"("base");

-- CreateIndex
CREATE INDEX "base_homonyms_base_idx" ON "base_homonyms"("base");

-- CreateIndex
CREATE INDEX "inflection_anomalies_lexemeId_idx" ON "inflection_anomalies"("lexemeId");

-- CreateIndex
CREATE INDEX "inflection_anomalies_grammeme_idx" ON "inflection_anomalies"("grammeme");
