import { Request, Response } from 'express';
import * as userModel from '../models/user';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { githubId, username, accessToken } = req.body;
    const user = await userModel.createUser({ githubId, username, accessToken });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userModel.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userModel.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userModel.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
}; 