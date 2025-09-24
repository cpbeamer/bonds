import { FINRAClient } from '../lib/services/finra/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

async function testFINRAConnection() {
  console.log('🔌 Testing FINRA API Connection...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const hasCredentials = process.env.FINRA_API_CLIENT_ID && process.env.FINRA_API_CLIENT_SECRET

  if (!hasCredentials) {
    console.error('❌ Missing FINRA credentials in environment variables')
    console.error('   Please ensure FINRA_API_CLIENT_ID and FINRA_API_CLIENT_SECRET are set in .env.local')
    process.exit(1)
  }

  console.log('✅ Credentials found:')
  console.log(`   Client ID: ${process.env.FINRA_API_CLIENT_ID?.substring(0, 8)}...`)
  console.log(`   Client Secret: ${process.env.FINRA_API_CLIENT_SECRET ? '***' : 'NOT SET'}`)
  console.log(`   Auth URL: ${process.env.FINRA_AUTH_URL}`)
  console.log(`   API URL: ${process.env.FINRA_API_URL}`)
  console.log()

  const client = new FINRAClient()

  try {
    console.log('📊 Testing API endpoints...')
    console.log()

    // Test 1: Search for corporate bonds
    console.log('1️⃣ Testing bond search...')
    const bonds = await client.searchBonds({
      bondType: 'CORP',
      maxMaturity: 5
    })
    console.log(`   ✅ Found ${bonds.length} bonds`)

    if (bonds.length > 0) {
      console.log(`   Sample: ${bonds[0].issuerName} (${bonds[0].cusip})`)
    }
    console.log()

    // Test 2: Get bond details for a known CUSIP (Apple bond)
    console.log('2️⃣ Testing bond details retrieval...')
    const testCusip = '037833100' // Apple Inc bond
    const bondDetails = await client.getBondDetails(testCusip)

    if (bondDetails) {
      console.log(`   ✅ Retrieved bond details:`)
      console.log(`   Issuer: ${bondDetails.issuerName}`)
      console.log(`   Coupon: ${bondDetails.coupon}%`)
      console.log(`   Maturity: ${bondDetails.maturityDate}`)
    } else {
      console.log(`   ⚠️  No details found for CUSIP ${testCusip}`)
    }
    console.log()

    // Test 3: Get recent trades
    console.log('3️⃣ Testing trade data retrieval...')
    const trades = await client.getCorporateBondTrades(testCusip)
    console.log(`   ✅ Found ${trades.length} recent trades`)

    if (trades.length > 0) {
      const latestTrade = trades[0]
      console.log(`   Latest trade: $${latestTrade.price} on ${latestTrade.tradeDate}`)
    }
    console.log()

    // Test 4: Get market data
    console.log('4️⃣ Testing market data retrieval...')
    const marketData = await client.getMarketData([testCusip])

    if (marketData.length > 0) {
      const data = marketData[0]
      console.log(`   ✅ Market data retrieved:`)
      console.log(`   Last Price: $${data.lastPrice}`)
      console.log(`   Last Trade: ${data.lastTradeDate}`)
      if (data.volumeTraded) {
        console.log(`   Volume: ${data.volumeTraded}`)
      }
    } else {
      console.log(`   ⚠️  No market data available`)
    }
    console.log()

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ All tests passed successfully!')
    console.log('Your FINRA API connection is working correctly.')

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ Connection test failed:')

    if (error instanceof Error) {
      console.error(`   ${error.message}`)

      if ((error as any).response) {
        const response = (error as any).response
        console.error(`   Status: ${response.status}`)
        console.error(`   Data: ${JSON.stringify(response.data, null, 2)}`)
      }
    } else {
      console.error(error)
    }

    console.error()
    console.error('🔧 Troubleshooting tips:')
    console.error('   1. Verify your FINRA credentials are correct')
    console.error('   2. Check if you have network connectivity')
    console.error('   3. Ensure the FINRA API URL is correct')
    console.error('   4. Check if your IP is whitelisted (if required)')

    process.exit(1)
  }
}

if (require.main === module) {
  testFINRAConnection()
}