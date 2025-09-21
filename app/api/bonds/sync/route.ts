import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { FINRADataSync } from '@/lib/services/finra'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, cusips, criteria } = body

    const syncService = new FINRADataSync()
    let result

    switch (type) {
      case 'single':
        if (!cusips || cusips.length === 0) {
          return NextResponse.json({ error: 'CUSIPs required' }, { status: 400 })
        }
        const bondId = await syncService.syncBond(cusips[0])
        result = { success: !!bondId, bondId }
        break

      case 'multiple':
        if (!cusips || cusips.length === 0) {
          return NextResponse.json({ error: 'CUSIPs required' }, { status: 400 })
        }
        await syncService.syncMarketData(cusips)
        result = { success: true, count: cusips.length }
        break

      case 'search':
        const count = await syncService.syncBondSearch(criteria || {})
        result = { success: true, count }
        break

      case 'user':
        const { prisma } = await import('@/lib/prisma')
        const user = await prisma.user.findUnique({
          where: { clerkId: userId }
        })
        if (user) {
          await syncService.syncUserRelevantBonds(user.id)
          result = { success: true }
        } else {
          result = { success: false, error: 'User not found' }
        }
        break

      case 'daily':
        await syncService.performDailySync()
        result = { success: true }
        break

      default:
        return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}