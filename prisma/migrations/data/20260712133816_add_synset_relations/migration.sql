-- Create semantic relation tables from RuWordNet synset_data

-- Hypernyms (родовые понятия, IS-A parent)
CREATE TABLE "hypernyms" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Hyponyms (видовые понятия, IS-A child)
CREATE TABLE "hyponyms" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Meronyms (часть чего-то, part-of)
CREATE TABLE "meronyms" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Holonyms (содержит как часть, has-part)
CREATE TABLE "holonyms" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Related words (связанные понятия)
CREATE TABLE "related_words" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Causes (глагол: вызывает это)
CREATE TABLE "causes" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Effects (глагол: является следствием)
CREATE TABLE "effects" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Premises (глагол: предпосылка)
CREATE TABLE "premises" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);

-- Conclusions (глагол: заключение)
CREATE TABLE "conclusions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "sourceId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "targetId" INTEGER REFERENCES "meanings"("id") ON DELETE CASCADE,
    "proximity" REAL
);