-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CREATE_COMPANY', 'JOIN_COMPANY');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "Transaction_packageId_idx";

-- CreateTable
CREATE TABLE "EnterpriseRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "companyName" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "companyAddress" TEXT,
    "targetCompanyId" TEXT,
    "message" TEXT,
    "adminResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "EnterpriseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnterpriseRequest_userId_idx" ON "EnterpriseRequest"("userId");

-- CreateIndex
CREATE INDEX "EnterpriseRequest_status_idx" ON "EnterpriseRequest"("status");

-- CreateIndex
CREATE INDEX "EnterpriseRequest_type_idx" ON "EnterpriseRequest"("type");

-- AddForeignKey
ALTER TABLE "EnterpriseRequest" ADD CONSTRAINT "EnterpriseRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseRequest" ADD CONSTRAINT "EnterpriseRequest_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
