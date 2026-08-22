-- CreateTable
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
