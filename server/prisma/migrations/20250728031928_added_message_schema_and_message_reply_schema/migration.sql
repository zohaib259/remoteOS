-- AlterTable
ALTER TABLE "ChannelMessage" ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "messageStatus" TEXT NOT NULL DEFAULT 'send';
