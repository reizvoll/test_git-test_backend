import axios from 'axios';
import prisma from '../config/db';
import { GitHubEvent } from '../types/github';

export const fetchUserActivities = async (accessToken: string, userId: string) => {
  try {
    // GitHub API에서 사용자 활동 가져오기
    const response = await axios.get<GitHubEvent[]>('https://api.github.com/user/events', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 활동 데이터 저장
    const activities = response.data.map((event) => {
      let title = '';
      let url = '';

      // 이벤트 타입에 따라 title과 url 설정
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
      };
    });

    // 데이터베이스에 활동 저장
    await prisma.gitHubActivity.createMany({
      data: activities,
      skipDuplicates: true,
    });

    return activities;
  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    throw error;
  }
}; 