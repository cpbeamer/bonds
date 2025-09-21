import { FINRADataSync } from '../lib/services/finra/sync'
import { prisma } from '../lib/prisma'

async function seedDatabase() {
  console.log('🚀 Starting FINRA data seed...')

  try {
    const syncService = new FINRADataSync()

    console.log('📊 Checking database connection...')
    await prisma.$connect()

    console.log('🧹 Clearing existing market data...')
    await prisma.marketData.deleteMany({})

    console.log('🏢 Syncing popular corporate bonds...')
    const corporateBonds = [
      '037833100', // Apple Inc.
      '594918104', // Microsoft Corp.
      '023135106', // Amazon.com Inc.
      '30231G102', // Exxon Mobil Corp.
      '459200101', // IBM Corp.
      '437076102', // Home Depot Inc.
      '742718109', // Procter & Gamble Co.
      '92826C839', // Visa Inc.
      '191216100', // Coca-Cola Co.
      '478160104', // Johnson & Johnson
      '88579Y101', // 3M Company
      '00287Y109', // AbbVie Inc.
      '717081103', // Pfizer Inc.
      '931142103', // Walmart Inc.
      '46625H100', // JPMorgan Chase & Co.
    ]

    for (const cusip of corporateBonds) {
      console.log(`  Syncing ${cusip}...`)
      await syncService.syncBond(cusip)
    }

    console.log('📈 Syncing market data for corporate bonds...')
    await syncService.syncMarketData(corporateBonds)

    console.log('🏛️ Searching for investment grade corporate bonds...')
    const igCount = await syncService.syncBondSearch({
      bondType: 'CORP',
      minRating: 'BBB',
      maxMaturity: 10
    })
    console.log(`  Found ${igCount} investment grade bonds`)

    console.log('🌆 Searching for municipal bonds...')
    const muniStates = ['CA', 'NY', 'TX', 'FL', 'IL']
    for (const state of muniStates) {
      console.log(`  Searching ${state} municipal bonds...`)
      const count = await syncService.syncBondSearch({
        bondType: 'MUNI',
        minRating: 'A',
        maxMaturity: 15,
        state
      })
      console.log(`    Found ${count} ${state} muni bonds`)
    }

    console.log('🏦 Searching for treasury bonds...')
    const treasuryCount = await syncService.syncBondSearch({
      bondType: 'TREASURY',
      maxMaturity: 30
    })
    console.log(`  Found ${treasuryCount} treasury bonds`)

    console.log('📊 Database statistics:')
    const bondCount = await prisma.bond.count()
    const marketDataCount = await prisma.marketData.count()
    const issuerCount = await prisma.issuer.count()

    console.log(`  Total bonds: ${bondCount}`)
    console.log(`  Market data points: ${marketDataCount}`)
    console.log(`  Issuers: ${issuerCount}`)

    console.log('✅ FINRA data seed completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedDatabase()
}