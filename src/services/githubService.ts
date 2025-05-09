import axios from 'axios';
import prisma from '../config/db';
import { GitHubEvent } from '../types/github';

export const fetchUserActivities = async (accessToken: string, userId: string, username: string) => {
  try {
    // GitHub API에서 사용자 활동 가져오기
    const response = await axios.get<GitHubEvent[]>(`https://api.github.com/users/${username}/events`, {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });

    // 현재 DB에 저장된 가장 최근 활동의 시간 조회
    const latestActivity = await prisma.gitHubActivity.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // 활동 데이터 변환 함수
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
      };
    };

    // 활동 데이터 변환 및 중복 체크
    const activities = response.data
      .map(mapEventToActivity)
      .filter(activity => {
        // 최근 활동이 없는 경우 이전 활동들을 가져옴
        if (!latestActivity) return false;
        
        // 새로운 활동만 필터링 (createdAt이 최근 활동보다 이후인 경우)
        return activity.createdAt > latestActivity.createdAt;
      });

    if (activities.length > 0) {
      // 새로운 활동만 데이터베이스에 저장
      await prisma.gitHubActivity.createMany({
        data: activities,
        skipDuplicates: true,
      });
      return activities;
    } else {
      // 새로운 활동이 없는 경우, 이전 활동들을 가져옴
      const previousActivities = response.data.map(mapEventToActivity);

      // 이전 활동들을 데이터베이스에 저장
      await prisma.gitHubActivity.createMany({
        data: previousActivities,
        skipDuplicates: true,
      });

      return previousActivities;
    }
  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    throw error;
  }
}; 