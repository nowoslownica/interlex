-- AlterTable: lexemes
ALTER TABLE lexemes DROP COLUMN accentSyllable;
ALTER TABLE lexemes DROP COLUMN alternationType;
ALTER TABLE lexemes DROP COLUMN fleetingVowelAt;
ALTER TABLE lexemes ADD COLUMN properNoun INTEGER NOT NULL DEFAULT 0;

-- AlterTable: candidates
ALTER TABLE candidates DROP COLUMN accentSyllable;
ALTER TABLE candidates DROP COLUMN alternationType;
ALTER TABLE candidates DROP COLUMN fleetingVowelAt;
ALTER TABLE candidates ADD COLUMN properNoun INTEGER NOT NULL DEFAULT 0;
