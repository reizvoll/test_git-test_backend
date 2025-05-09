import axios from 'axios';
import prisma from '../config/db';
import { GitHubEvent } from '../types/github';

// save auto sync users
const autoSyncUsers = new Map<string, NodeJS.Timeout>();

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

export const fetchUserActivities = async (accessToken: string, userId: string, username: string) => {
  try {
    // get user activities from GitHub API
    const response = await axios.get<GitHubEvent[]>(`https://api.github.com/users/${username}/events`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    // get the latest activity from the DB
    const latestActivity = await prisma.gitHubActivity.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // convert activity data function
    const mapEventToActivity = (event: GitHubEvent) => {
        let title = '';
        let url = '';

        if (event.payload.pull_request) {
          title = event.payload.pull_request.title;
          url = event.payload.pull_request.html_url;
        } else if (event.payload.issue) {
          title = event.payload.issue.title;
          url = event.payload.issue.html_url;
        } else if (event.payload.commits?.[0]) {
          title = event.payload.commits[0].message;
          url = event.payload.commits[0].url;
        }

        return {
          userId,
          type: event.type,
          repository: event.repo.name,
          title,
          url,
          createdAt: new Date(event.created_at),
          eventId: event.id,
        };
        };

    // convert activity data and check duplicates
    const activities = response.data
      .map(mapEventToActivity)
      .filter(activity => {
        // if there is no latest activity, get previous activities
        if (!latestActivity) return false;
        
        // filter new activities (createdAt is after the latest activity)
        return activity.createdAt > latestActivity.createdAt;
      });

    if (activities.length > 0) {
      // save new activities to the DB
      await prisma.gitHubActivity.createMany({
        data: activities,
        skipDuplicates: true,
      });
      return activities;
    } else {
      // no update activities, get previous activities
      const previousActivities = response.data.map(mapEventToActivity);

      // get the eventId list of the activities already saved in the DB
      const existingActivities = await prisma.gitHubActivity.findMany({
        where: { userId },
        select: { eventId: true }
      });

      // filter out the activities already saved in the DB
      const newPreviousActivities = previousActivities.filter(activity => 
        !existingActivities.some(existing => 
          existing.eventId === activity.eventId
        )
      );

      if (newPreviousActivities.length > 0) {
        // save the new previous activities to the DB
        await prisma.gitHubActivity.createMany({
          data: newPreviousActivities,
          skipDuplicates: true,
        });
      }

      return newPreviousActivities;
    }
  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    throw error;
  }
}; 