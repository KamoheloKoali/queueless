-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'users');

-- CreateEnum
CREATE TYPE "TeamInviteStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'users';

-- CreateTable
CREATE TABLE "team_invite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'users',
    "status" "TeamInviteStatus" NOT NULL DEFAULT 'pending',
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_invite_status_idx" ON "team_invite"("status");

-- CreateIndex
CREATE UNIQUE INDEX "team_invite_email_key" ON "team_invite"("email");
