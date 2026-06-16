-- DropIndex
DROP INDEX "PingLog_projectId_idx";

-- CreateIndex
CREATE INDEX "PingLog_projectId_createdAt_idx" ON "PingLog"("projectId", "createdAt");
