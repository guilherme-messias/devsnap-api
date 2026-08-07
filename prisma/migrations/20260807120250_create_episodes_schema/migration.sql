-- CreateTable
CREATE TABLE "episodes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "stack" TEXT NOT NULL,
    "error" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);
