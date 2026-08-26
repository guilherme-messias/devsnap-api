-- CreateTable
CREATE TABLE "episode_reviews" (
    "id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "focus_session_id" TEXT,

    CONSTRAINT "episode_reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "episode_reviews" ADD CONSTRAINT "episode_reviews_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
