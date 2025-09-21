import cron from 'node-cron';
import { FINRADataSync } from './sync';

export class FINRAScheduler {
  private syncService: FINRADataSync;
  private jobs: cron.ScheduledTask[] = [];

  constructor() {
    this.syncService = new FINRADataSync();
  }

  start() {
    console.log('Starting FINRA data scheduler...');

    const dailySync = cron.schedule('0 6 * * *', async () => {
      console.log('Running daily FINRA sync at 6:00 AM');
      await this.syncService.performDailySync();
    });

    const intradaySync = cron.schedule('0 */4 * * 1-5', async () => {
      console.log('Running intraday market data sync');
      await this.syncMarketDataOnly();
    });

    this.jobs.push(dailySync, intradaySync);

    dailySync.start();
    intradaySync.start();

    console.log('FINRA scheduler started successfully');
  }

  stop() {
    console.log('Stopping FINRA scheduler...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
  }

  async syncMarketDataOnly() {
    try {
      const { prisma } = await import('@/lib/prisma');

      const recentBonds = await prisma.bond.findMany({
        select: { cusip: true },
        where: {
          marketData: {
            some: {
              asOf: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          }
        },
        take: 500
      });

      const cusips = recentBonds.map(b => b.cusip);
      await this.syncService.syncMarketData(cusips);

    } catch (error) {
      console.error('Error in market data sync:', error);
    }
  }

  async runImmediateSync() {
    console.log('Running immediate FINRA sync...');
    await this.syncService.performDailySync();
  }

  async seedDatabase() {
    console.log('Seeding database with initial FINRA data...');
    await this.syncService.seedInitialData();
  }
}

let scheduler: FINRAScheduler | null = null;

export function getScheduler(): FINRAScheduler {
  if (!scheduler) {
    scheduler = new FINRAScheduler();
  }
  return scheduler;
}

export function startScheduler() {
  const instance = getScheduler();
  instance.start();
  return instance;
}

export function stopScheduler() {
  if (scheduler) {
    scheduler.stop();
    scheduler = null;
  }
}