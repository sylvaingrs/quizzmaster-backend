/*
  Warnings:

  - The primary key for the `Checkpoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `roomId` to the `Checkpoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checkpoint" DROP CONSTRAINT "Checkpoint_pkey",
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("roomId", "questionId");
