-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'CLOSED');

-- AlterEnum
BEGIN;
CREATE TYPE "EmailKind_new" AS ENUM ('APPLICATION', 'CONTACT');
ALTER TABLE "EmailLog" ALTER COLUMN "kind" TYPE "EmailKind_new" USING ("kind"::text::"EmailKind_new");
ALTER TYPE "EmailKind" RENAME TO "EmailKind_old";
ALTER TYPE "EmailKind_new" RENAME TO "EmailKind";
DROP TYPE "EmailKind_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "EmailLog" DROP CONSTRAINT "EmailLog_inquiryId_fkey";

-- AlterTable
ALTER TABLE "EmailLog" DROP COLUMN "inquiryId",
ADD COLUMN     "contactId" TEXT;

-- DropTable
DROP TABLE "EmployerInquiry";

-- DropEnum
DROP TYPE "InquiryStatus";

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

