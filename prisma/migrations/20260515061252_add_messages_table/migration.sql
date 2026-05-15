-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "nickname" VARCHAR(10) NOT NULL,
    "body" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at" DESC);
