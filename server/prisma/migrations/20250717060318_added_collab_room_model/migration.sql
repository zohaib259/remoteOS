/*
  Warnings:

  - Added the required column `updatedAt` to the `CollabRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `CollabRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CollabRoom" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "inviteLink" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CollabRoom" ADD CONSTRAINT "CollabRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
