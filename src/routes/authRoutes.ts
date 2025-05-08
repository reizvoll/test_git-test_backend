import axios from 'axios';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';
import prisma from '../config/db';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

// GitHub OAuth 로그인 시작
router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${authConfig.github.clientId}&redirect_uri=${authConfig.github.callbackURL}&scope=${authConfig.github.scope}`;
  res.redirect(githubAuthUrl);
});

// GitHub OAuth 콜백 처리
router.get('/callback/github', async (req, res) => {
  const { code } = req.query;
  
  try {
    // GitHub 액세스 토큰 받기
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: authConfig.github.clientId,
      client_secret: authConfig.github.clientSecret,
      code,
    }, {
      headers: {
        Accept: 'application/json',
      },
    });

    const { access_token } = tokenResponse.data;

    // GitHub 사용자 정보 가져오기
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const githubUser = userResponse.data;

    // 사용자 정보 저장 또는 업데이트
    const userData = {
      githubId: githubUser.id.toString(),
      username: githubUser.login,
      accessToken: access_token,
      image: githubUser.avatar_url,
    };

    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id.toString() },
      update: userData,
      create: userData,
    });

    // JWT 토큰 생성
    const payload = { 
      id: user.id,
      githubId: user.githubId,
      username: user.username,
      accessToken: access_token,
      image: user.image
    };

    const token = jwt.sign(
      payload,
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );

    // 프론트엔드로 리다이렉트 (토큰 포함)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
  }
});

// 세션 확인
router.get('/session', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        githubId: true,
        username: true,
        image: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session' });
  }
});

// 로그아웃
router.post('/signout', (req, res) => {
  res.json({ message: 'Signed out successfully' });
});

export default router; 