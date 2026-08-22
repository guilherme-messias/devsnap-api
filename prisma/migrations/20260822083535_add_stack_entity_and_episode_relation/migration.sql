/*
  Warnings:

  - You are about to drop the column `stack` on the `episodes` table. All the data in the column will be lost.
  - You are about to drop the column `episode_count` on the `stacks` table. All the data in the column will be lost.
  - You are about to drop the column `pending_episode_count` on the `stacks` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_episode_count` on the `stacks` table. All the data in the column will be lost.
  - Added the required column `stack_id` to the `episodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "episodes" DROP COLUMN "stack",
ADD COLUMN     "stack_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "stacks" DROP COLUMN "episode_count",
DROP COLUMN "pending_episode_count",
DROP COLUMN "reviewed_episode_count";

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "stacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
