/*
  Warnings:

  - You are about to drop the column `role` on the `CollabRoomTeamMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CollabRoomTeamMember" DROP COLUMN "role",
ADD COLUMN     "profession" TEXT;
