-- DropForeignKey
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_stack_id_fkey";

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_stack_id_fkey" FOREIGN KEY ("stack_id") REFERENCES "stacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
