/*
  Warnings:

  - You are about to drop the column `teamMembers` on the `CollabRoom` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CollabRoom` table. All the data in the column will be lost.
  - Added the required column `adminId` to the `CollabRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CollabRoom" DROP CONSTRAINT "CollabRoom_userId_fkey";

-- AlterTable
ALTER TABLE "CollabRoom" DROP COLUMN "teamMembers",
DROP COLUMN "userId",
ADD COLUMN     "adminId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_TeamMembers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TeamMembers_AB_unique" ON "_TeamMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamMembers_B_index" ON "_TeamMembers"("B");

-- AddForeignKey
ALTER TABLE "CollabRoom" ADD CONSTRAINT "CollabRoom_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "CollabRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
