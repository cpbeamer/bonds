import type { NextApiRequest, NextApiResponse } from 'next';
import { ScreeningScheduler } from '@/services/scheduler';
import { auth } from '@clerk/nextjs';

const scheduler = new ScreeningScheduler();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = auth();
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      try {
        const { preferences, hour = 9 } = req.body;

        if (!preferences) {
          return res.status(400).json({ error: 'Preferences required' });
        }

        scheduler.scheduleDailyScreening(userId, preferences, hour);

        return res.status(200).json({
          success: true,
          message: `Daily screening scheduled for ${hour}:00`
        });
      } catch (error) {
        console.error('Schedule error:', error);
        return res.status(500).json({ error: 'Failed to schedule screening' });
      }

    case 'DELETE':
      try {
        scheduler.stopScreening(userId);
        return res.status(200).json({
          success: true,
          message: 'Screening schedule cancelled'
        });
      } catch (error) {
        console.error('Delete schedule error:', error);
        return res.status(500).json({ error: 'Failed to cancel schedule' });
      }

    case 'GET':
      try {
        const isActive = scheduler.isJobActive(userId);
        return res.status(200).json({
          success: true,
          active: isActive
        });
      } catch (error) {
        console.error('Get schedule error:', error);
        return res.status(500).json({ error: 'Failed to get schedule status' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}