import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GithubProvider from 'next-auth/providers/github';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { githubId: true, username: true },
        });
        if (dbUser) {
          session.user.githubId = dbUser.githubId;
          session.user.username = dbUser.username;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as any;
        await prisma.user.update({
          where: { id: token.id as string },
          data: {
            githubId: githubProfile.id?.toString(),
            username: githubProfile.login,
          },
        });
        token.githubId = githubProfile.id?.toString();
        token.username = githubProfile.login;
      }
      return token;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && profile) {
        const githubProfile = profile as any;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: githubProfile.id?.toString(),
            username: githubProfile.login,
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 