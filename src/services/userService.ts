import * as userModel from '../models/user';
import { User } from '../models/user';

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
  return await userModel.createUser(userData);
};

export const getUserById = async (id: string): Promise<User | null> => {
  return await userModel.getUserById(id);
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  return await userModel.updateUser(id, userData);
};

export const deleteUser = async (id: string): Promise<void> => {
  await userModel.deleteUser(id);
}; 