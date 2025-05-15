import { ContributionTimelineEntry } from '@/types/github';
import { Chart, registerables } from 'chart.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Request, Response } from 'express';
import { getContributionTimeline, getUserByUsername } from '../services/analyticsService';
import { fetchPublicContributionCalendarByUsername } from '../services/githubService';

Chart.register(...registerables);

const DEFAULT_OUTPUT_WIDTH = 800;
const DEFAULT_OUTPUT_HEIGHT = 400;
const MAX_OUTPUT_WIDTH = 2000;
const MAX_OUTPUT_HEIGHT = 2000;

const formatDateForChart = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const generateContributionsChart = async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;
    const period = req.query.period as string | undefined;
    const year = req.query.year as string | undefined;

    let outputWidth = parseInt(req.query.width as string, 10) || DEFAULT_OUTPUT_WIDTH;
    let outputHeight = parseInt(req.query.height as string, 10) || DEFAULT_OUTPUT_HEIGHT;

    outputWidth = Math.max(100, Math.min(outputWidth, MAX_OUTPUT_WIDTH));
    outputHeight = Math.max(100, Math.min(outputHeight, MAX_OUTPUT_HEIGHT));

    if (!username) {
      return res.status(400).json({ message: 'Username query parameter is required' });
    }
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      return res.status(400).json({ message: 'Invalid GitHub username format' });
    }

    let timelineData: ContributionTimelineEntry[] = [];
    let chartTitleUsername = username;

    const localUser = await getUserByUsername(username);

    if (localUser) {
      chartTitleUsername = localUser.username;
      timelineData = await getContributionTimeline(localUser.id, period, year);
    } else {
      const githubPat = process.env.GITHUB_PAT;
      if (!githubPat) {
        console.error('GITHUB_PAT environment variable is not set.');
        return res.status(503).send('Service temporarily unavailable due to configuration error.');
      }
      try {
        timelineData = await fetchPublicContributionCalendarByUsername(username, githubPat, period, year) as ContributionTimelineEntry[];
      } catch (githubError: unknown) {
        let errorMessage = 'Failed to fetch data from GitHub.';
        let statusCode = 502;
        if (githubError instanceof Error) {
          console.error(`Error fetching public GitHub data for ${username}:`, githubError.message);
          if (githubError.message.toLowerCase().includes('not found')) {
            statusCode = 404;
            errorMessage = `GitHub user '${username}' not found.`;
          } else if (githubError.message.toLowerCase().includes('authentication failed')) {
            statusCode = 503;
            errorMessage = 'GitHub API authentication issue.';
          }
        }
        return res.status(statusCode).send(errorMessage);
      }
    }

    if (timelineData.length === 0) {
      return res.status(404).send(); 
    }

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: outputWidth, height: outputHeight });

    const labels = timelineData.map(entry => formatDateForChart(entry.date));
    const dataCounts = timelineData.map(entry => entry.count);

    const configuration = {
      type: 'line' as const,
      data: {
        labels: labels,
        datasets: [
          {
            label: `Contributions (${period || 'default'})`,
            data: dataCounts,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: `Contribution Analytics for ${username}`,
            font: { size: 18 }, // Adjusted font size
          },
        },
        scales: {
          x: {
            ticks: {
              font: { size: 12 },
              autoSkip: true,
              maxTicksLimit: 15,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 12 },
            },
          },
        },
      },
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);

  } catch (error: unknown) {
    let message = 'Error generating chart image.';
    if (error instanceof Error) {
      console.error('Unhandled error in generateContributionsChart:', error.message);
      message = error.message;
    } else {
      console.error('Unhandled non-Error exception in generateContributionsChart:', error);
    }
    if (!res.headersSent) {
      res.status(500).send(message);
    }
  }
}; 