-- AlterTable: Add independent verification columns for meaning text and examples
ALTER TABLE "meanings" ADD COLUMN "meaningVeryfied" INTEGER;
ALTER TABLE "meanings" ADD COLUMN "meaningMessage" TEXT;
ALTER TABLE "meanings" ADD COLUMN "examplesVeryfied" INTEGER;
ALTER TABLE "meanings" ADD COLUMN "examplesMessage" TEXT;

-- Copy existing veryfied/message into meaningVeryfied/meaningMessage (backward compat)
UPDATE "meanings" SET "meaningVeryfied" = "veryfied", "meaningMessage" = "message";