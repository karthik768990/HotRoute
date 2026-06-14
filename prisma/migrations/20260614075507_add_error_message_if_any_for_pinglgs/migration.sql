-- AlterTable
ALTER TABLE "PingLog" ADD COLUMN     "errorMessage" TEXT,
ALTER COLUMN "statusCode" DROP NOT NULL;
