import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prisma from '@/lib/prisma'
import { FidelityClient } from '@/lib/services/brokers/fidelity/client'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect('/brokers?error=auth_failed')
    }

    if (!code || !state) {
      return NextResponse.redirect('/brokers?error=missing_params')
    }

    // Verify state parameter
    // TODO: Implement state verification

    // Exchange code for access token
    const fidelityClient = new FidelityClient()
    await fidelityClient.exchangeCodeForToken(code)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.redirect('/brokers?error=user_not_found')
    }

    // Store broker connection
    // TODO: Store encrypted tokens in database

    // Fetch and store accounts
    const accounts = await fidelityClient.getAccounts()
    
    // Store accounts in database
    // TODO: Implement account storage

    return NextResponse.redirect('/brokers?success=connected')
  } catch (error) {
    console.error('Error in Fidelity callback:', error)
    return NextResponse.redirect('/brokers?error=callback_failed')
  }
}
