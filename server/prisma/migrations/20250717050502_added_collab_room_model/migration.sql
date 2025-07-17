-- DropIndex
DROP INDEX "RefreshToken_id_key";

-- CreateTable
CREATE TABLE "CollabRoom" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "teamMembers" TEXT[],
    "inviteLink" TEXT NOT NULL,
    "inviteLinkExpiresAt" TIMESTAMP(3),

    CONSTRAINT "CollabRoom_pkey" PRIMARY KEY ("id")
);
