-- CreateEnum
CREATE TYPE "Type" AS ENUM ('action', 'markdown', 'plain');

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "default_group" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "is_bot" BOOLEAN NOT NULL,
    "is_deleted" BOOLEAN NOT NULL,
    "is_online" BOOLEAN NOT NULL,
    "is_supporter" BOOLEAN NOT NULL,
    "last_visit" TIMESTAMP(3),
    "pm_friends_only" BOOLEAN NOT NULL,
    "profile_colour" TEXT,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "channel_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_action" BOOLEAN NOT NULL,
    "message_id" BIGINT NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "type" "Type" NOT NULL,
    "uuid" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "Tokens" (
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_in" INTEGER NOT NULL,
    "token_type" TEXT NOT NULL,

    CONSTRAINT "Tokens_pkey" PRIMARY KEY ("access_token")
);

-- CreateTable
CREATE TABLE "Updates" (
    "last_id" BIGINT NOT NULL,

    CONSTRAINT "Updates_pkey" PRIMARY KEY ("last_id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
