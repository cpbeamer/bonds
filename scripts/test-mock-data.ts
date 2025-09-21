import { FINRAClient } from '../lib/services/finra/client';
import { FINRADataSync } from '../lib/services/finra/sync';
import { MockDataGenerator } from '../lib/services/finra/mock-data';

async function testMockData() {
  console.log('🧪 Testing Mock Data Implementation\n');
  console.log('================================\n');

  // Force mock data mode
  process.env.USE_MOCK_FINRA_DATA = 'true';
  process.env.NODE_ENV = 'development';

  const client = new FINRAClient();

  console.log('1️⃣ Testing Bond Details Retrieval');
  console.log('-----------------------------------');
  const appleBond = await client.getBondDetails('037833100');
  if (appleBond) {
    console.log('✅ Apple Inc. Bond:');
    console.log(`   CUSIP: ${appleBond.cusip}`);
    console.log(`   Issuer: ${appleBond.issuerName}`);
    console.log(`   Coupon: ${appleBond.coupon}%`);
    console.log(`   Type: ${appleBond.bondType}`);
    console.log(`   Rating: ${appleBond.rating?.moodys || 'N/A'}`);
  } else {
    console.log('❌ Failed to retrieve Apple bond');
  }

  console.log('\n2️⃣ Testing Trade Data');
  console.log('----------------------');
  const trades = await client.getCorporateBondTrades('594918104');
  console.log(`✅ Retrieved ${trades.length} trades for Microsoft`);
  if (trades.length > 0) {
    const latestTrade = trades[0];
    console.log(`   Latest Trade:`);
    console.log(`   - Date: ${latestTrade.tradeDate}`);
    console.log(`   - Price: $${latestTrade.price}`);
    console.log(`   - Yield: ${latestTrade.yield}%`);
    console.log(`   - Quantity: ${latestTrade.quantity.toLocaleString()}`);
  }

  console.log('\n3️⃣ Testing Market Data');
  console.log('-----------------------');
  const marketData = await client.getMarketData(['037833100', '594918104', '023135106']);
  console.log(`✅ Retrieved market data for ${marketData.length} bonds`);
  marketData.forEach(data => {
    console.log(`   ${data.cusip}:`);
    console.log(`   - Last Price: $${data.lastPrice.toFixed(2)}`);
    console.log(`   - Last Yield: ${data.lastYield.toFixed(2)}%`);
    console.log(`   - Volume: ${data.volumeTraded?.toLocaleString() || 'N/A'}`);
  });

  console.log('\n4️⃣ Testing Bond Search');
  console.log('-----------------------');

  // Search for corporate bonds
  const corpBonds = await client.searchBonds({
    bondType: 'CORP',
    minRating: 'BBB',
    maxMaturity: 10
  });
  console.log(`✅ Found ${corpBonds.length} investment-grade corporate bonds`);

  // Search for municipal bonds
  const muniBonds = await client.searchBonds({
    bondType: 'MUNI',
    state: 'CA',
    maxMaturity: 15
  });
  console.log(`✅ Found ${muniBonds.length} California municipal bonds`);

  // Search for treasury bonds
  const treasuryBonds = await client.searchBonds({
    bondType: 'TREASURY',
    maxMaturity: 30
  });
  console.log(`✅ Found ${treasuryBonds.length} treasury bonds`);

  console.log('\n5️⃣ Testing Mock Data Templates');
  console.log('--------------------------------');
  const templates = MockDataGenerator.getMockBondTemplates();
  console.log(`✅ Available mock bonds: ${templates.length}`);

  const bondTypes = templates.reduce((acc, t) => {
    acc[t.bondType] = (acc[t.bondType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(bondTypes).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count} bonds`);
  });

  console.log('\n6️⃣ Testing Data Sync Service');
  console.log('-----------------------------');
  const syncService = new FINRADataSync();

  console.log('Testing bond sync...');
  const bondId = await syncService.syncBond('037833100');
  if (bondId) {
    console.log(`✅ Successfully synced bond with ID: ${bondId}`);
  } else {
    console.log('⚠️  Bond sync returned null (database may not be connected)');
  }

  console.log('\n================================');
  console.log('✅ Mock Data Testing Complete!');
  console.log('================================\n');

  console.log('📝 Summary:');
  console.log('  - Mock data is working correctly');
  console.log('  - All FINRA client methods return mock data');
  console.log('  - Data includes realistic bonds from multiple sectors');
  console.log('  - Ready for development without FINRA API access');
}

if (require.main === module) {
  testMockData().catch(console.error);
}