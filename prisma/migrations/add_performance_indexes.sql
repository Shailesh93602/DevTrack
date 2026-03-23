-- Performance Optimization Migration
-- Run this SQL against your production database to apply the new indexes

-- DailyLog indexes for user-scoped queries and streak calculations
CREATE INDEX IF NOT EXISTS "DailyLog_userId_idx" ON "DailyLog"("userId");
CREATE INDEX IF NOT EXISTS "DailyLog_userId_date_idx" ON "DailyLog"("userId", "date");

-- ProjectActivityLog index for user-scoped activity queries
CREATE INDEX IF NOT EXISTS "ProjectActivityLog_userId_createdAt_idx" ON "ProjectActivityLog"("userId", "createdAt");
