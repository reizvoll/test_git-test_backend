import prisma from '../config/db';

export const createUser = async (data: {
  githubId: string;
  username: string;
  accessToken: string;
}) => {
  return prisma.user.create({
    data,
  });
};

export const getUser = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const getUserByGithubId = async (githubId: string) => {
  return prisma.user.findUnique({
    where: { githubId },
  });
};

export const updateUser = async (
  id: string,
  data: {
    username?: string;
    accessToken?: string;
  }
) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};
