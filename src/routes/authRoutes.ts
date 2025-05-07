import express from 'express';
import { getServerSession } from 'next-auth';
import { authOptions } from '../config/auth';

const router = express.Router();

// Get current session
router.get('/session', async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session' });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    // Clear the session cookie
    res.setHeader('Set-Cookie', 'next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error signing out' });
  }
});

export default router; 