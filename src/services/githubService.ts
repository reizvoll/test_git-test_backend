import axios from 'axios';
import { createActivity } from '../models/activity';

interface GitHubEvent {
  type: string;
  repo: {
    name: string;
  };
  payload: {
    commits?: Array<{
      message: string;
      url: string;
    }>;
  };
  created_at: string;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  html_url: string;
  repository: {
    name: string;
  };
  created_at: string;
}

interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  repository: {
    name: string;
  };
  created_at: string;
}

export const fetchUserActivities = async (
  accessToken: string,
  userId: string
): Promise<void> => {
  try {
    // Fetch commits
    const commitsResponse = await axios.get<GitHubEvent[]>(
      'https://api.github.com/user/events',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const commits = commitsResponse.data
      .filter((event) => event.type === 'PushEvent')
      .flatMap((event) => 
        event.payload.commits?.map(commit => ({
          userId,
          type: 'commit' as const,
          repository: event.repo.name,
          title: commit.message,
          url: commit.url,
          createdAt: new Date(event.created_at)
        })) || []
      );

    // Fetch pull requests
    const prsResponse = await axios.get<GitHubPullRequest[]>(
      'https://api.github.com/user/issues?filter=created',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const prs = prsResponse.data.map((pr) => ({
      userId,
      type: 'pull_request' as const,
      repository: pr.repository.name,
      title: pr.title,
      url: pr.html_url,
      createdAt: new Date(pr.created_at)
    }));

    // Fetch issues
    const issuesResponse = await axios.get<GitHubIssue[]>(
      'https://api.github.com/user/issues?filter=created',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const issues = issuesResponse.data.map((issue) => ({
      userId,
      type: 'issue' as const,
      repository: issue.repository.name,
      title: issue.title,
      url: issue.html_url,
      createdAt: new Date(issue.created_at)
    }));

    // Save all activities
    const allActivities = [...commits, ...prs, ...issues];
    for (const activity of allActivities) {
      await createActivity(activity);
    }
  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    throw error;
  }
}; 