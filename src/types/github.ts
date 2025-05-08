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