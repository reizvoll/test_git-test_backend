import { ActivityFilter, ContributionTimelineEntry } from '@/types/github';
import prisma from '../config/db';

export const getUserByUsername = async (username: string): Promise<{ id: string; githubId: string; username: string } | null> => {
  return prisma.user.findFirst({
    where: { username },
    select: { id: true, githubId: true, username: true },
  });
};

export const getContributionTimeline = async (
  userId: string,
  period?: string,
  year?: string
): Promise<ContributionTimelineEntry[]> => {
  const where: ActivityFilter = {
    userId: userId,
    type: 'contribution',
  };

  if (period === 'all') {
  } else if (period === 'year' && year) {
    const numericYear = parseInt(year);
    const startDate = new Date(numericYear, 0, 1);
    const endDate = new Date(numericYear, 11, 31, 23, 59, 59);
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  } else if (period) {
    const now = new Date();
    const periodMap: Record<string, number> = {
        'day': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000
    };
    const duration = periodMap[period.toLowerCase()];

    if (duration) {
      where.createdAt = {
        gte: new Date(now.getTime() - duration),
      };
    } else if (period.toLowerCase() !== 'all') {
        where.createdAt = {
            gte: new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)),
          };
    }
  } else {
    const now = new Date();
    where.createdAt = {
      gte: new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000)),
    };
  }

  const timelineResult = await prisma.gitHubActivity.groupBy({
    by: ['createdAt'],
    where,
    _sum: { contributionCount: true },
    orderBy: { createdAt: 'asc' },
  });

  return timelineResult.map((day) => ({
    date: day.createdAt,
    count: day._sum.contributionCount || 0,
  }));
}; 