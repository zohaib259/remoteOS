/*
  Warnings:

  - You are about to drop the column `userName` on the `CollabRoom` table. All the data in the column will be lost.
  - Added the required column `adminName` to the `CollabRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CollabRoom" DROP COLUMN "userName",
ADD COLUMN     "adminName" TEXT NOT NULL;
