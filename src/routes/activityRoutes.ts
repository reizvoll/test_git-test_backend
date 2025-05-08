import express from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middlewares/authMiddleware';
import { getActivityStats } from '../models/activity';
import { fetchUserActivities } from '../services/githubService';

const router = express.Router();

router.use(authenticateToken);

// Get user's GitHub activities
router.get('/', async (req, res) => {
  try {
    const activities = await prisma.gitHubActivity.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get activity statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await getActivityStats(req.user!.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activity stats' });
  }
});

// Sync GitHub activities
router.post('/sync', async (req, res) => {
  try {
    // DB에서 로그인된 사용자의 accessToken 조회
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !user.accessToken) {
      return res.status(401).json({ message: 'GitHub access token not found' });
    }

    await fetchUserActivities(user.accessToken, req.user!.id, user.username);
    res.json({ message: 'Activities synced successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing activities' });
  }
});

export default router; 