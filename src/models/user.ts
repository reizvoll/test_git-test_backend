import prisma from '../config/db';

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  githubId?: string | null;
  username?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  return prisma.user.create({ data: userData });
};

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  return prisma.user.update({ where: { id }, data: userData });
};

export const deleteUser = async (id: string): Promise<void> => {
  await prisma.user.delete({ where: { id } });
}; 