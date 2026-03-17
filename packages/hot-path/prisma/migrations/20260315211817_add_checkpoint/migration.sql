/*
  Warnings:

  - The primary key for the `Checkpoint` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Checkpoint" DROP CONSTRAINT "Checkpoint_pkey",
ADD CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("roomId", "questionId");
