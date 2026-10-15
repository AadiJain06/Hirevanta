-- Replace résumé file-storage columns with a single résumé link.
-- AlterTable
ALTER TABLE "Application" DROP COLUMN IF EXISTS "resumeFilename",
DROP COLUMN IF EXISTS "resumeKey",
DROP COLUMN IF EXISTS "resumeMime",
DROP COLUMN IF EXISTS "resumeSize";

-- Add the new column. Use a temporary default so the migration succeeds even
-- if historical rows exist, then drop the default (new rows must supply a value).
ALTER TABLE "Application" ADD COLUMN "resumeUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Application" ALTER COLUMN "resumeUrl" DROP DEFAULT;
