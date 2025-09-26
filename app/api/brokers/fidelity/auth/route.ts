import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { FidelityClient } from '@/lib/services/brokers/fidelity/client'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId,
      timestamp: Date.now(),
    })).toString('base64')

    // Store state in session/database for verification later
    // TODO: Implement state storage

    // Initialize Fidelity client
    const fidelityClient = new FidelityClient()
    const authUrl = fidelityClient.getAuthorizationUrl(state)

    // Redirect to Fidelity OAuth
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error initiating Fidelity auth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate authentication' },
      { status: 500 }
    )
  }
}
