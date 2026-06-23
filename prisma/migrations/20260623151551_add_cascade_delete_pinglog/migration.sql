-- DropForeignKey
ALTER TABLE "PingLog" DROP CONSTRAINT "PingLog_projectId_fkey";

-- AddForeignKey
ALTER TABLE "PingLog" ADD CONSTRAINT "PingLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
