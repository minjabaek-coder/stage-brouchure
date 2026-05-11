-- CreateTable
CREATE TABLE "attendees" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone_last4" CHAR(4) NOT NULL,
    "seat" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "csv_backups" (
    "id" SERIAL NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storage_path" TEXT NOT NULL,
    "row_count" INTEGER,

    CONSTRAINT "csv_backups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendees_name_phone_last4_idx" ON "attendees"("name", "phone_last4");

-- CreateIndex
CREATE INDEX "attendees_name_idx" ON "attendees"("name");
