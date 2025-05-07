import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Prisma connected to database');
  } catch (error) {
    console.error('Prisma connection error:', error);
    process.exit(1);
  }
};

export default prisma; 