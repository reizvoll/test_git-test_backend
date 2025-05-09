import express from 'express';
import prisma from '../config/db';
import { authenticateToken } from '../middlewares/authMiddleware';
import { autoSyncLimiter, syncLimiter } from '../middlewares/rateLimiter';
import { fetchUserActivities, setupAutoSync, stopAutoSync } from '../services/githubService';

const router = express.Router();

router.use(authenticateToken);

// Get user's GitHub activities
router.get('/', async (req, res) => {
  try {
    const { period, type, repository } = req.query;
    const where: any = { userId: req.user!.id };

    if (period) {
      const now = new Date();
      const periods: { [key: string]: number } = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      };
      if (periods[period as string]) {
        where.createdAt = {
          gte: new Date(now.getTime() - periods[period as string])
        };
      }
    }

    if (type) {
      where.type = type;
    }

    if (repository) {
      where.repository = repository;
    }

    const activities = await prisma.gitHubActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get contribution details by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await prisma.gitHubActivity.findUnique({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });
    if (!activity) {
      return res.status(404).json({ message: 'Contribution not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contribution details' });
  }
});

// Get activity statistics
router.get('/stats', async (req, res) => {
  try {
    const { period } = req.query;
    const where: any = { userId: req.user!.id };

    // 기간별 필터링
    if (period) {
      const now = new Date();
      const periods: { [key: string]: number } = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      };
      if (periods[period as string]) {
        where.createdAt = {
          gte: new Date(now.getTime() - periods[period as string])
        };
      }
    }

    const stats = await prisma.gitHubActivity.groupBy({
      by: ['type'],
      where,
      _count: true
    });

    const totalCount = stats.reduce((acc, curr) => acc + curr._count, 0);

    res.json({
      total: totalCount,
      byType: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contribution stats' });
  }
});

// Get contribution analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period } = req.query;
    const where: any = { userId: req.user!.id };

    if (period) {
      const now = new Date();
      const periods: { [key: string]: number } = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      };
      if (periods[period as string]) {
        where.createdAt = {
          gte: new Date(now.getTime() - periods[period as string])
        };
      }
    }

    const timeline = await prisma.gitHubActivity.groupBy({
      by: ['createdAt'],
      where,
      _count: true,
      orderBy: { createdAt: 'asc' }
    });

    const repositoryDistribution = await prisma.gitHubActivity.groupBy({
      by: ['repository'],
      where,
      _count: true
    });

    const timePattern = await prisma.gitHubActivity.groupBy({
      by: ['createdAt'],
      where,
      _count: true
    });

    res.json({
      timeline,
      repositoryDistribution,
      timePattern
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contribution analytics' });
  }
});

// Sync GitHub activities automatically
router.post('/sync/auto', autoSyncLimiter, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (enabled) {
      const success = await setupAutoSync(req.user!.id);
      if (!success) {
        return res.status(400).json({ message: 'Failed to setup auto sync' });
      }
      res.json({ message: 'Auto sync enabled successfully' });
    } else {
      const success = stopAutoSync(req.user!.id);
      if (!success) {
        return res.status(400).json({ message: 'Auto sync was not enabled' });
      }
      res.json({ message: 'Auto sync disabled successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating auto sync settings' });
  }
});

// Sync GitHub activities
router.post('/sync', syncLimiter, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !user.accessToken) {
      return res.status(401).json({ message: 'GitHub access token not found' });
    }

    await fetchUserActivities(user.accessToken, req.user!.id, user.username);

    const activities = await prisma.gitHubActivity.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Contributions synced successfully',
      activities
    });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing contributions' });
  }
});


export default router; 