import express from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middlewares/authMiddleware';
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
    const stats = await prisma.gitHubActivity.groupBy({
      by: ['type'],
      where: { userId: req.user!.id },
      _count: true
    });
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

    // 최신 활동 가져오기
    await fetchUserActivities(user.accessToken, req.user!.id, user.username);

    // DB에서 최신 활동 조회 (새로 가져온 활동 포함)
    const activities = await prisma.gitHubActivity.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Activities synced successfully',
      activities
    });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing activities' });
  }
});

// Delete all GitHub activities for the user
router.delete('/', async (req, res) => {
  try {
    await prisma.gitHubActivity.deleteMany({
      where: { userId: req.user!.id }
    });
    res.json({ message: 'All activities deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting activities' });
  }
});

export default router; 