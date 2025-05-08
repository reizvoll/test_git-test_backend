import { DefaultSession, DefaultUser } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      githubId?: string | null;
      username?: string | null;
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string;
    githubId?: string | null;
    username?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    githubId?: string;
    username?: string;
  }
} 