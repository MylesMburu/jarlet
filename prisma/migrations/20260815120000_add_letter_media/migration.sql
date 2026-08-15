-- CreateTable
CREATE TABLE "LetterMedia" (
    "id" TEXT NOT NULL,
    "letterId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LetterMedia_pkey" PRIMARY KEY ("id")
);

-- Backfill existing single-media letters into LetterMedia rows before dropping the column
INSERT INTO "LetterMedia" ("id", "letterId", "url", "order")
SELECT gen_random_uuid()::text, "id", "mediaUrl", 0
FROM "Letter"
WHERE "mediaUrl" IS NOT NULL AND "mediaUrl" <> '';

-- CreateIndex
CREATE INDEX "LetterMedia_letterId_idx" ON "LetterMedia"("letterId");

-- AddForeignKey
ALTER TABLE "LetterMedia" ADD CONSTRAINT "LetterMedia_letterId_fkey" FOREIGN KEY ("letterId") REFERENCES "Letter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Letter" DROP COLUMN "mediaUrl";