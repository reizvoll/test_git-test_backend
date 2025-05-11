export interface GitHubActivity {
  userId: string;
  type: 'commit' | 'pull_request' | 'contribution';
  repository: string;
  title: string;
  url: string;
  eventId: string;
  createdAt: Date;
  contributionCount?: number;
}

// GitHubEvent represents the structure of a GitHub API event (REST API)
export interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    commits?: Array<{
      sha: string;
      message: string;
      url: string;
    }>;
    pull_request?: {
      number: number;
      title: string;
      html_url: string;
    };
    issue?: {
      number: number;
      title: string;
      html_url: string;
    };
  };
  created_at: string;
}

// ActivityFilter defines the filter criteria for querying GitHub activities
export interface ActivityFilter {
  userId: string;
  type?: 'commit' | 'pull_request' | 'issue' | 'Contribution';
  repository?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

// GitHubGraphQLResponse represents the structure of the GraphQL API response
export interface GitHubGraphQLResponse {
  data: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
            }>;
          }>;
        };
      };
      repositories: {
        nodes: Array<{
          name: string;
          defaultBranchRef?: {
            target?: {
              history?: {
                nodes: Array<{
                  committedDate: string;
                  message: string;
                  url: string;
                  author: {
                    name: string;
                    email: string;
                  };
                }>;
              };
            };
          };
          pullRequests?: {
            nodes: Array<{
              title: string;
              url: string;
              createdAt: string;
              mergedAt?: string;
              state: 'MERGED' | 'CLOSED';
              repository: {
                name: string;
              };
            }>;
          };
        }>;
      };
    } | null;
  };
  errors?: Array<{
    message: string;
  }>;
}