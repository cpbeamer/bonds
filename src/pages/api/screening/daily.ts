import type { NextApiRequest, NextApiResponse } from 'next';
import { BondScreeningService } from '@/services/bondScreening';
import { auth } from '@clerk/nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = auth();
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({ error: 'Preferences required' });
    }

    const screeningService = new BondScreeningService();
    const result = await screeningService.performDailyScreening(userId, preferences);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Screening API error:', error);
    return res.status(500).json({
      error: 'Failed to perform screening',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}