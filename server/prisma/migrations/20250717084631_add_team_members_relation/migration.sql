/*
  Warnings:

  - You are about to drop the column `inviteLinkExpiresAt` on the `CollabRoom` table. All the data in the column will be lost.
  - You are about to drop the column `inviteToken` on the `CollabRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CollabRoom" DROP COLUMN "inviteLinkExpiresAt",
DROP COLUMN "inviteToken";
