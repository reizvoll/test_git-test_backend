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
  // Authorization 헤더에서 토큰 확인
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  
  // 쿠키에서 토큰 확인
  const cookieToken = req.cookies?.auth_token;
  
  // 헤더 또는 쿠키에서 토큰 가져오기
  const token = headerToken || cookieToken;

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