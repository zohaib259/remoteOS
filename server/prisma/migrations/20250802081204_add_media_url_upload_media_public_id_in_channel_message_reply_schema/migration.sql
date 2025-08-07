-- AlterTable
ALTER TABLE "ChannelMessage" ADD COLUMN     "mediaPublicId" TEXT;

-- AlterTable
ALTER TABLE "ChannelMessageReply" ADD COLUMN     "mediaPublicId" TEXT,
ADD COLUMN     "mediaUrl" TEXT;
