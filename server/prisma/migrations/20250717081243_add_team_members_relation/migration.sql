/*
  Warnings:

  - You are about to drop the column `inviteLink` on the `CollabRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CollabRoom" DROP COLUMN "inviteLink",
ADD COLUMN     "inviteToken" TEXT;
