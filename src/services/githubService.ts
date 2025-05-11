import axios, { AxiosError } from 'axios';
import prisma from '../config/db';

// save auto sync users
const autoSyncUsers = new Map<string, NodeJS.Timeout>();

// GraphQL 쿼리 정의
const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
      repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          name
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100) {
                  nodes {
                    committedDate
                    message
                    url
                    author {
                      name
                      email
                    }
                  }
                }
              }
            }
          }
          pullRequests(first: 100, states: [MERGED, CLOSED], orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title
              url
              createdAt
              mergedAt
              state
              repository {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const fetchUserActivities = async (accessToken: string, userId: string, username: string) => {
  try {
    console.log('Fetching activities for user:', username);
    
    // GraphQL API 호출
    const response = await axios.post(
      'https://api.github.com/graphql',
      {
        query: CONTRIBUTIONS_QUERY,
        variables: { username }
      },
      {
        headers: {
          Authorization: `token ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      console.error('GraphQL Errors:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    const userData = response.data.data.user;
    if (!userData) {
      throw new Error('User data not found');
    }

    const activities: any[] = [];

    // Contribution 데이터 변환
    userData.contributionsCollection.contributionCalendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        if (day.contributionCount > 0) {
          activities.push({
            userId,
            type: 'Contribution',
            repository: 'GitHub',
            title: `${day.contributionCount} contributions on ${day.date}`,
            url: `https://github.com/${username}`,
            createdAt: new Date(day.date),
            eventId: `contribution-${day.date}`,
            contributionCount: day.contributionCount
          });
        }
      });
    });

    // Commits 데이터 변환
    userData.repositories.nodes.forEach((repo: any) => {
      if (repo.defaultBranchRef?.target?.history?.nodes) {
        repo.defaultBranchRef.target.history.nodes.forEach((commit: any) => {
          // 커밋 작성자가 현재 사용자인 경우에만 추가
          if (commit.author && (commit.author.name === username || commit.author.email?.includes(username))) {
            activities.push({
              userId,
              type: 'Commit',
              repository: repo.name,
              title: commit.message,
              url: commit.url,
              createdAt: new Date(commit.committedDate),
              eventId: `commit-${commit.url}`
            });
          }
        });
      }
    });

    // Pull Requests 데이터 변환
    userData.repositories.nodes.forEach((repo: any) => {
      if (repo.pullRequests?.nodes) {
        repo.pullRequests.nodes.forEach((pr: any) => {
          activities.push({
            userId,
            type: 'PullRequest',
            repository: pr.repository.name,
            title: pr.title,
            url: pr.url,
            createdAt: new Date(pr.createdAt),
            eventId: `pr-${pr.url}`,
            state: pr.state,
            mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null
          });
        });
      }
    });

    // Get all existing activities for this user
    const existingActivities = await prisma.gitHubActivity.findMany({
      where: { userId },
      select: { eventId: true }
    });

    // Filter out activities that already exist in the DB
    const newActivities = activities.filter(activity => 
      !existingActivities.some((existing: { eventId: string }) => 
      existing.eventId === activity.eventId
    ));

    if (newActivities.length > 0) {
      // Save new activities to the DB
      await prisma.gitHubActivity.createMany({
        data: newActivities,
        skipDuplicates: true,
      });
    }

    return newActivities;
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof AxiosError) {
      console.error('Error response:', error.response?.data);
    }
    throw error;
  }
};

export const setupAutoSync = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.accessToken) {
      throw new Error('GitHub access token not found');
    }

    // if auto sync is already set, remove it
    if (autoSyncUsers.has(userId)) {
      clearInterval(autoSyncUsers.get(userId));
    }

    // sync every 12 hours (convert to milliseconds)
    const interval = 12 * 60 * 60 * 1000;
    const timer = setInterval(async () => {
      try {
        await fetchUserActivities(user.accessToken, userId, user.username);
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, interval);

    autoSyncUsers.set(userId, timer);
    return true;
  } catch (error) {
    console.error('Error setting up auto sync:', error);
    return false;
  }
};

export const stopAutoSync = (userId: string) => {
  if (autoSyncUsers.has(userId)) {
    clearInterval(autoSyncUsers.get(userId));
    autoSyncUsers.delete(userId);
    return true;
  }
  return false;
}; 