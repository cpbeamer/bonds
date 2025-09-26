import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user's alerts with related bond information
    const alerts = await prisma.alert.findMany({
      where: { userId: user.id },
      include: {
        bond: {
          select: {
            id: true,
            cusip: true,
            issuerName: true,
            coupon: true,
            maturity: true,
            type: true,
            state: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { type, bondId, condition, threshold, frequency } = body

    // Validate input
    if (!type || !condition || threshold === undefined || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the alert
    const alert = await prisma.alert.create({
      data: {
        userId: user.id,
        type,
        bondId: bondId || null,
        condition,
        threshold,
        frequency,
        isActive: true,
      },
      include: {
        bond: {
          select: {
            id: true,
            cusip: true,
            issuerName: true,
            coupon: true,
            maturity: true,
            type: true,
            state: true,
          }
        }
      }
    })

    return NextResponse.json({ alert })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
