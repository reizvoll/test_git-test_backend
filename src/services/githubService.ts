import { GitHubActivity, GitHubGraphQLResponse } from '@/types/github';
import axios, { AxiosError } from 'axios';
import prisma from '../config/db';

type GitHubActivityInput = Omit<GitHubActivity, 'id'>;
// Save auto sync users
const autoSyncUsers = new Map<string, NodeJS.Timeout>();

// GraphQL query definition
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
           pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              title
              url
              createdAt
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

export const fetchUserActivities = async (userId: string, username: string): Promise<GitHubActivity[]> => {
  try {
    console.log('Fetching activities for user:', username);

    // 사용자의 accessToken을 데이터베이스에서 가져옴
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true }
    });

    if (!user?.accessToken) {
      throw new Error('GitHub access token not found');
    }

    // Call GraphQL API
    const response = await axios.post<GitHubGraphQLResponse>(
      'https://api.github.com/graphql',
      {
        query: CONTRIBUTIONS_QUERY,
        variables: { username }
      },
      {
        headers: {
          Authorization: `token ${user.accessToken}`,
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

    const activities: GitHubActivityInput[] = [];

    // Transform Contribution data
    userData.contributionsCollection.contributionCalendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (day.contributionCount > 0) {
          activities.push({
            userId,
            type: 'contribution',
            repository: 'GitHub',
            title: `${day.contributionCount} contributions on ${day.date}`,
            description: `User made ${day.contributionCount} contributions`,
            url: `https://github.com/${username}`,
            createdAt: new Date(day.date),
            eventId: `contribution-${day.date}`,
            contributionCount: day.contributionCount,
          });
        }
      });
    });

    // Transform Commits data
    userData.repositories.nodes.forEach((repo) => {
      if (repo.defaultBranchRef?.target?.history?.nodes) {
        repo.defaultBranchRef.target.history.nodes.forEach((commit) => {
          // Only add commits authored by the current user
          if (commit.author && (commit.author.name === username || commit.author.email?.includes(username))) {
            activities.push({
              userId,
              type: 'commit',
              repository: repo.name,
              title: commit.message,
              description: `Commit to ${repo.name}`,
              url: commit.url,
              createdAt: new Date(commit.committedDate),
              eventId: `commit-${commit.url}`,
            });
          }
        });
      }
    });

    // Transform Pull Requests data
    userData.repositories.nodes.forEach((repo) => {
      if (repo.pullRequests?.nodes) {
        repo.pullRequests.nodes.forEach((pr) => {
          activities.push({
            userId,
            type: 'pull_request',
            repository: pr.repository.name,
            title: pr.title,
            description: `Pull Request to ${pr.repository.name}`,
            url: pr.url,
            createdAt: new Date(pr.createdAt),
            eventId: `pr-${pr.url}`,
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

    // Fetch the newly created activities to return with IDs
    const savedActivities = (await prisma.gitHubActivity.findMany({
      where: {
        eventId: { in: newActivities.map((activity) => activity.eventId) },
      },
    })) as GitHubActivity[];

    return savedActivities;
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof AxiosError) {
      console.error('Error response:', error.response?.data);
    }
    throw error;
  }
};

export const setupAutoSync = async (userId: string): Promise<boolean> => {
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
        await fetchUserActivities(userId, user.username);
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

export const stopAutoSync = (userId: string): boolean => {
  if (autoSyncUsers.has(userId)) {
    clearInterval(autoSyncUsers.get(userId));
    autoSyncUsers.delete(userId);
    return true;
  }
  return false;
};