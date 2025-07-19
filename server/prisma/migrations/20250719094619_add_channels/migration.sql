/*
  Warnings:

  - You are about to drop the `_TeamMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TeamMembers" DROP CONSTRAINT "_TeamMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeamMembers" DROP CONSTRAINT "_TeamMembers_B_fkey";

-- DropTable
DROP TABLE "_TeamMembers";

-- CreateTable
CREATE TABLE "CollabRoomTeamMember" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "role" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollabRoomTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "collabRoomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelAdmin" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ChannelAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelTeamMember" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ChannelTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CollabRoomTeamMember_userId_roomId_key" ON "CollabRoomTeamMember"("userId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelAdmin_channelId_userId_key" ON "ChannelAdmin"("channelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelTeamMember_channelId_userId_key" ON "ChannelTeamMember"("channelId", "userId");

-- AddForeignKey
ALTER TABLE "CollabRoomTeamMember" ADD CONSTRAINT "CollabRoomTeamMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CollabRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollabRoomTeamMember" ADD CONSTRAINT "CollabRoomTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_collabRoomId_fkey" FOREIGN KEY ("collabRoomId") REFERENCES "CollabRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelAdmin" ADD CONSTRAINT "ChannelAdmin_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelAdmin" ADD CONSTRAINT "ChannelAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelTeamMember" ADD CONSTRAINT "ChannelTeamMember_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelTeamMember" ADD CONSTRAINT "ChannelTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
