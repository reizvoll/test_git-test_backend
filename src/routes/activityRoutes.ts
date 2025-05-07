import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { getActivityStats, getUserActivities } from '../models/activity';
import { fetchUserActivities } from '../services/githubService';

const router = express.Router();

router.use(authenticateToken);

// Get user's GitHub activities
router.get('/', async (req, res) => {
  try {
    const activities = await getUserActivities(req.user!.id);
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
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    await fetchUserActivities(accessToken, req.user!.id);
    res.json({ message: 'Activities synced successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error syncing activities' });
  }
});

export default router; 