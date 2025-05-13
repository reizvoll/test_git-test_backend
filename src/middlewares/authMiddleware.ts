import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        githubId: string;
        username: string;
        image?: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 토큰을 쿠키 또는 Authorization 헤더에서 가져옴 (둘 다 지원)
  let token = req.cookies?.auth_token;
  
  // 쿠키에 토큰이 없으면 Authorization 헤더에서 확인 (기존 방식 지원)
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as {
      id: string;
      githubId: string;
      username: string;
      image?: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 