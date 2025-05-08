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
        accessToken: string;
        image?: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret) as {
      id: string;
      githubId: string;
      username: string;
      accessToken: string;
      image?: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 