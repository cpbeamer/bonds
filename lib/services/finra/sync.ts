import { prisma } from '@/lib/prisma';
import { FINRAClient } from './client';
import { FINRADataMapper } from './mapper';
import { FINRABondData, FINRAMarketData } from './types';
import { Prisma } from '@prisma/client';

export class FINRADataSync {
  private client: FINRAClient;
  private syncStats = {
    bondsProcessed: 0,
    bondsCreated: 0,
    bondsUpdated: 0,
    errors: 0,
    startTime: new Date()
  };

  constructor() {
    this.client = new FINRAClient();
  }

  private log(message: string, level: 'info' | 'error' | 'warn' = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📊',
      error: '❌',
      warn: '⚠️'
    }[level];

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async syncBond(cusip: string): Promise<string | null> {
    try {
      this.log(`Syncing bond: ${cusip}`);
      const bondData = await this.client.getBondDetails(cusip);

      if (!bondData) {
        this.log(`No bond data found for CUSIP: ${cusip}`, 'warn');
        return null;
      }

      const existingBond = await prisma.bond.findUnique({
        where: { cusip }
      });

      if (existingBond) {
        await this.updateBond(existingBond.id, bondData);
        this.syncStats.bondsUpdated++;
        this.log(`Updated bond: ${cusip} - ${bondData.issuerName}`);
        return existingBond.id;
      } else {
        const newBond = await this.createBond(bondData);
        this.syncStats.bondsCreated++;
        this.log(`Created new bond: ${cusip} - ${bondData.issuerName}`);
        return newBond.id;
      }
    } catch (error) {
      this.syncStats.errors++;
      this.log(`Error syncing bond ${cusip}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return null;
    } finally {
      this.syncStats.bondsProcessed++;
    }
  }

  private async createBond(bondData: FINRABondData) {
    const createData = FINRADataMapper.toBondCreateInput(bondData);

    const sector = FINRADataMapper.extractSectorFromIssuer(bondData.issuerName);
    const state = FINRADataMapper.extractStateFromMuni(bondData.issuerName, bondData.bondType);

    if (sector) createData.sector = sector;
    if (state) createData.state = state;

    return await prisma.bond.create({
      data: createData
    });
  }

  private async updateBond(bondId: string, bondData: FINRABondData) {
    const updateData: Prisma.BondUpdateInput = {
      issuerName: bondData.issuerName,
      coupon: bondData.coupon,
      maturity: new Date(bondData.maturityDate),
      callable: bondData.callable,
      moodysRating: bondData.rating?.moodys,
      spRating: bondData.rating?.sp,
      fitchRating: bondData.rating?.fitch,
      ratingBucket: FINRADataMapper.mapRatingBucket(
        bondData.rating?.moodys,
        bondData.rating?.sp,
        bondData.rating?.fitch
      ),
    };

    if (bondData.callDate) {
      updateData.callSchedule = {
        callDate: bondData.callDate,
        callPrice: bondData.callPrice || 100
      };
    }

    return await prisma.bond.update({
      where: { id: bondId },
      data: updateData
    });
  }

  async syncMarketData(cusips: string[]): Promise<void> {
    try {
      this.log(`Syncing market data for ${cusips.length} bonds...`);

      const batchSize = 50;
      for (let i = 0; i < cusips.length; i += batchSize) {
        const batch = cusips.slice(i, i + batchSize);
        const marketDataList = await this.client.getMarketData(batch);

        for (const marketData of marketDataList) {
          await this.upsertMarketData(marketData);
        }

        this.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cusips.length / batchSize)} (${marketDataList.length} bonds with data)`);
      }

      this.log(`Successfully synced market data for all bonds`);
    } catch (error) {
      this.log(`Error syncing market data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private async upsertMarketData(marketData: FINRAMarketData): Promise<void> {
    try {
      const bond = await prisma.bond.findUnique({
        where: { cusip: marketData.cusip }
      });

      if (!bond) {
        const bondId = await this.syncBond(marketData.cusip);
        if (!bondId) {
          console.log(`Could not sync bond for market data: ${marketData.cusip}`);
          return;
        }
      }

      const bondRecord = bond || await prisma.bond.findUnique({
        where: { cusip: marketData.cusip }
      });

      if (!bondRecord) return;

      const createData = FINRADataMapper.toMarketDataCreateInput(marketData, bondRecord.id);

      await prisma.marketData.upsert({
        where: {
          bondId_asOf: {
            bondId: bondRecord.id,
            asOf: marketData.asOf
          }
        },
        update: {
          price: createData.price,
          ['yield']: createData['yield'],
          yieldToWorst: createData.yieldToWorst,
          lastTradeDate: createData.lastTradeDate,
          lastTradePrice: createData.lastTradePrice,
          lastTradeYield: createData.lastTradeYield,
          bidPrice: createData.bidPrice,
          askPrice: createData.askPrice,
          volume30d: createData.volume30d,
          tradeCount30d: createData.tradeCount30d,
        },
        create: createData as any
      });
    } catch (error) {
      console.error(`Error upserting market data for ${marketData.cusip}:`, error);
    }
  }

  async syncBondSearch(criteria: {
    bondType?: string;
    minRating?: string;
    maxMaturity?: number;
    state?: string;
  }): Promise<number> {
    try {
      const bonds = await this.client.searchBonds(criteria);
      console.log(`Found ${bonds.length} bonds matching criteria`);

      let syncedCount = 0;

      for (const bond of bonds) {
        const bondId = await this.syncBond(bond.cusip);
        if (bondId) syncedCount++;
      }

      const cusips = bonds.map(b => b.cusip);
      await this.syncMarketData(cusips);

      return syncedCount;
    } catch (error) {
      console.error('Error syncing bond search results:', error);
      return 0;
    }
  }

  async syncUserRelevantBonds(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { settings: true }
      });

      if (!user || !user.settings) {
        console.log(`User ${userId} not found or has no settings`);
        return;
      }

      const taxProfile = user.taxProfile as any;
      const state = taxProfile?.state;

      const criteria = {
        minRating: user.settings.ratingFloor,
        maxMaturity: user.settings.maxMaturity,
        state: state,
      };

      await this.syncBondSearch(criteria);

      if (state) {
        await this.syncBondSearch({ ...criteria, bondType: 'MUNI' });
      }

      await this.syncBondSearch({ ...criteria, bondType: 'CORP' });

    } catch (error) {
      console.error(`Error syncing bonds for user ${userId}:`, error);
    }
  }

  async performDailySync(): Promise<void> {
    try {
      this.syncStats = {
        bondsProcessed: 0,
        bondsCreated: 0,
        bondsUpdated: 0,
        errors: 0,
        startTime: new Date()
      };

      this.log('=================================================');
      this.log('Starting daily FINRA data sync...');
      this.log(`Time: ${new Date().toLocaleString()}`);
      this.log('=================================================');

      const activeUsers = await prisma.user.findMany({
        where: {
          onboardingCompleted: true,
          subscription: {
            status: {
              in: ['ACTIVE', 'TRIALING']
            }
          }
        },
        select: { id: true }
      });

      this.log(`Found ${activeUsers.length} active users to sync`);

      for (const user of activeUsers) {
        await this.syncUserRelevantBonds(user.id);
      }

      const existingBonds = await prisma.bond.findMany({
        select: { cusip: true },
        take: 1000
      });

      const cusips = existingBonds.map(b => b.cusip);
      await this.syncMarketData(cusips);

      const duration = (new Date().getTime() - this.syncStats.startTime.getTime()) / 1000;

      this.log('=================================================');
      this.log('Daily sync completed successfully');
      this.log(`Duration: ${Math.round(duration)} seconds`);
      this.log(`Bonds processed: ${this.syncStats.bondsProcessed}`);
      this.log(`Bonds created: ${this.syncStats.bondsCreated}`);
      this.log(`Bonds updated: ${this.syncStats.bondsUpdated}`);
      this.log(`Errors: ${this.syncStats.errors}`);
      this.log('=================================================');
    } catch (error) {
      this.log(`Critical error in daily sync: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  }

  async seedInitialData(): Promise<void> {
    try {
      console.log('Seeding initial bond data...');

      const popularCorporateBonds = [
        '037833100', // Apple
        '594918104', // Microsoft
        '023135106', // Amazon
        '30231G102', // Exxon
        '459200101', // IBM
        '437076102', // Home Depot
        '742718109', // Procter & Gamble
        '92826C839', // Visa
        '191216100', // Coca-Cola
        '478160104', // Johnson & Johnson
      ];

      for (const cusip of popularCorporateBonds) {
        await this.syncBond(cusip);
      }

      await this.syncMarketData(popularCorporateBonds);

      await this.syncBondSearch({
        bondType: 'CORP',
        minRating: 'BBB',
        maxMaturity: 10
      });

      await this.syncBondSearch({
        bondType: 'MUNI',
        minRating: 'A',
        maxMaturity: 15,
        state: 'CA'
      });

      await this.syncBondSearch({
        bondType: 'TREASURY',
        maxMaturity: 30
      });

      console.log('Initial data seeding completed');
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }
}