import { NextFunction, Request, Response } from 'express';
import { getToken } from 'next-auth/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        githubId: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    req.user = {
      id: token.id as string,
      githubId: token.sub!,
      email: token.email as string,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}; 