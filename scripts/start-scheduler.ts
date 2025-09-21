import { startScheduler } from '../lib/services/finra'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🚀 Starting FINRA data scheduler...')

  try {
    await prisma.$connect()
    console.log('✅ Database connected')

    const scheduler = startScheduler()

    const runImmediate = process.argv.includes('--immediate')
    if (runImmediate) {
      console.log('📊 Running immediate sync...')
      await scheduler.runImmediateSync()
    }

    const seed = process.argv.includes('--seed')
    if (seed) {
      console.log('🌱 Seeding initial data...')
      await scheduler.seedDatabase()
    }

    console.log('⏰ Scheduler is running. Press Ctrl+C to stop.')
    console.log('📅 Schedule:')
    console.log('  - Daily sync: 6:00 AM')
    console.log('  - Intraday sync: Every 4 hours on weekdays')

    process.on('SIGINT', async () => {
      console.log('\n⏹️ Stopping scheduler...')
      scheduler.stop()
      await prisma.$disconnect()
      process.exit(0)
    })

  } catch (error) {
    console.error('❌ Error starting scheduler:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}