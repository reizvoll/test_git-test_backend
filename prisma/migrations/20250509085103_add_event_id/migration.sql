/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `GitHubActivity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `GitHubActivity` table without a default value. This is not possible if the table is not empty.

*/
-- Add eventId column with a temporary value
ALTER TABLE "GitHubActivity" ADD COLUMN "eventId" TEXT;

-- Update existing rows with a temporary value
UPDATE "GitHubActivity" SET "eventId" = id;

-- Make eventId required and unique
ALTER TABLE "GitHubActivity" ALTER COLUMN "eventId" SET NOT NULL;
ALTER TABLE "GitHubActivity" ADD CONSTRAINT "GitHubActivity_eventId_key" UNIQUE ("eventId");
