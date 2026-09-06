-- CreateTable
CREATE TABLE "focus_sessions" (
    "id" TEXT NOT NULL,
    "stack_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "focus_session_items" (
    "id" TEXT NOT NULL,
    "focus_session_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "answered_at" TIMESTAMP(3),

    CONSTRAINT "focus_session_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "focus_session_items_focus_session_id_episode_id_key" ON "focus_session_items"("focus_session_id", "episode_id");

-- AddForeignKey
ALTER TABLE "episode_reviews" ADD CONSTRAINT "episode_reviews_focus_session_id_fkey" FOREIGN KEY ("focus_session_id") REFERENCES "focus_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_sessions" ADD CONSTRAINT "focus_sessions_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_session_items" ADD CONSTRAINT "focus_session_items_focus_session_id_fkey" FOREIGN KEY ("focus_session_id") REFERENCES "focus_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "focus_session_items" ADD CONSTRAINT "focus_session_items_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
