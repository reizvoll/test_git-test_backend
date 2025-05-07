import prisma from '../config/db';

export interface GitHubActivity {
  id: string;
  userId: string;
  type: 'commit' | 'pull_request' | 'issue';
  repository: string;
  title: string;
  url: string;
  createdAt: Date;
}

export const createActivity = async (activity: Omit<GitHubActivity, 'id'>): Promise<GitHubActivity> => {
  const { userId, type, repository, title, url } = activity;
  const result = await prisma.gitHubActivity.create({
    data: {
      userId,
      type,
      repository,
      title,
      url
    }
  });
  return result as GitHubActivity;
};

export const getUserActivities = async (userId: string) => {
  return prisma.gitHubActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
};

export const getActivityStats = async (userId: string) => {
  const activities = await prisma.gitHubActivity.findMany({
    where: { userId }
  });
  // 통계 계산 로직...
  return activities;
}; 