-- CreateTable
CREATE TABLE "RateLimit" (
    "userId" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("userId","bucket","windowStart")
);

-- No policies: only the server (table owner) reads or writes it; the anon key gets nothing.
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;
