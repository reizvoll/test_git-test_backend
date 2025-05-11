-- AlterTable
ALTER TABLE "GitHubActivity" ALTER COLUMN "contributionCount" DROP NOT NULL,
ALTER COLUMN "contributionCount" DROP DEFAULT;
