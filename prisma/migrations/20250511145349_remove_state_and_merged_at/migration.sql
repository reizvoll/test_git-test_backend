/*
  Warnings:

  - You are about to drop the column `mergedAt` on the `GitHubActivity` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `GitHubActivity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GitHubActivity" DROP COLUMN "mergedAt",
DROP COLUMN "state";
