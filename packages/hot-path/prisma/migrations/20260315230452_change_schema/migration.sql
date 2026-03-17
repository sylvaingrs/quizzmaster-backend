/*
  Warnings:

  - The primary key for the `Checkpoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roomId` on the `Checkpoint` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Checkpoint" DROP CONSTRAINT "Checkpoint_pkey",
DROP COLUMN "roomId",
ADD CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("quizId", "questionId");
