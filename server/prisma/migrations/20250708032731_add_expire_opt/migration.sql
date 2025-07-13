/*
  Warnings:

  - You are about to drop the column `emailCode` on the `User` table. All the data in the column will be lost.
  - Added the required column `opt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpExpires` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailCode",
ADD COLUMN     "opt" INTEGER NOT NULL,
ADD COLUMN     "otpExpires" TIMESTAMP(3) NOT NULL;
