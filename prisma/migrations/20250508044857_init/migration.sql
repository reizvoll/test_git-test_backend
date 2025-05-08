/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `accessToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `githubId` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX IF EXISTS "User_email_key";

-- AlterTable
ALTER TABLE "User" 
  DROP COLUMN IF EXISTS "email",
  DROP COLUMN IF EXISTS "emailVerified",
  DROP COLUMN IF EXISTS "image",
  DROP COLUMN IF EXISTS "name";

-- Add accessToken column with a default value
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "accessToken" TEXT;

-- Update existing records to have required fields
UPDATE "User" 
SET "accessToken" = 'placeholder_token'
WHERE "accessToken" IS NULL;

-- Make columns required after setting default values
ALTER TABLE "User" 
  ALTER COLUMN "accessToken" SET NOT NULL,
  ALTER COLUMN "githubId" SET NOT NULL,
  ALTER COLUMN "username" SET NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Activity_userId_idx" ON "Activity"("userId");
CREATE INDEX IF NOT EXISTS "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Activity" 
  ADD CONSTRAINT "Activity_userId_fkey" 
  FOREIGN KEY ("userId") 
  REFERENCES "User"("id") 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;
