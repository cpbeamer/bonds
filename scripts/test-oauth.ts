import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

async function testOAuth() {
  const clientId = process.env.FINRA_API_CLIENT_ID || ''
  const clientSecret = process.env.FINRA_API_CLIENT_SECRET || ''

  console.log('Testing FINRA OAuth Authentication')
  console.log('===================================')
  console.log(`Client ID: ${clientId}`)
  console.log(`Client Secret (length): ${clientSecret.length} chars`)
  console.log(`First 5 chars: ${clientSecret.substring(0, 5)}...`)
  console.log()

  // Test different ways of encoding
  const tests = [
    {
      name: 'Basic Auth (standard)',
      auth: Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    },
    {
      name: 'URL Encoded Secret',
      auth: Buffer.from(`${clientId}:${encodeURIComponent(clientSecret)}`).toString('base64')
    }
  ]

  for (const test of tests) {
    console.log(`\nTrying: ${test.name}`)
    console.log(`Auth header: Basic ${test.auth.substring(0, 20)}...`)

    try {
      const response = await axios.post(
        'https://ews.fip.finra.org/fip/rest/ews/oauth2/access_token?grant_type=client_credentials',
        {},
        {
          headers: {
            'Authorization': `Basic ${test.auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      console.log('✅ SUCCESS!')
      console.log('Access Token:', response.data.access_token?.substring(0, 20) + '...')
      console.log('Expires In:', response.data.expires_in, 'seconds')
      return

    } catch (error: any) {
      console.log('❌ Failed:', error.response?.data || error.message)
    }
  }

  console.log('\n\n⚠️  All authentication attempts failed')
  console.log('Please verify your credentials are correct')
}

testOAuth()