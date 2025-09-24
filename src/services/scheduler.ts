import { BondScreeningService } from './bondScreening';
import cron from 'node-cron';

interface UserScreeningJob {
  userId: string;
  preferences: any;
  schedule: string;
  enabled: boolean;
}

export class ScreeningScheduler {
  private screeningService: BondScreeningService;
  private jobs: Map<string, cron.ScheduledTask>;

  constructor() {
    this.screeningService = new BondScreeningService();
    this.jobs = new Map();
  }

  scheduleDailyScreening(userId: string, preferences: any, hour: number = 9): void {
    const scheduleExpression = `0 ${hour} * * *`;

    if (this.jobs.has(userId)) {
      this.jobs.get(userId)?.stop();
      this.jobs.delete(userId);
    }

    const task = cron.schedule(scheduleExpression, async () => {
      try {
        console.log(`Running daily screening for user ${userId}`);
        const result = await this.screeningService.performDailyScreening(userId, preferences);

        await this.notifyUser(userId, result);
      } catch (error) {
        console.error(`Failed screening for user ${userId}:`, error);
      }
    });

    this.jobs.set(userId, task);
    task.start();

    console.log(`Scheduled daily screening for user ${userId} at ${hour}:00`);
  }

  async runImmediateScreening(userId: string, preferences: any): Promise<any> {
    try {
      const result = await this.screeningService.performDailyScreening(userId, preferences);
      return result;
    } catch (error) {
      console.error('Immediate screening failed:', error);
      throw error;
    }
  }

  stopScreening(userId: string): void {
    const job = this.jobs.get(userId);
    if (job) {
      job.stop();
      this.jobs.delete(userId);
      console.log(`Stopped screening for user ${userId}`);
    }
  }

  private async notifyUser(userId: string, result: any): Promise<void> {
    console.log(`Notifying user ${userId} of screening results`);
  }

  getAllActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  isJobActive(userId: string): boolean {
    return this.jobs.has(userId);
  }
}