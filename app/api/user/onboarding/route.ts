import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taxProfile, preferences, subscription } = body

    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        taxProfile: {
          state: taxProfile.state,
          filingStatus: taxProfile.filingStatus,
          federalRate: parseFloat(taxProfile.federalRate) / 100,
          stateRate: parseFloat(taxProfile.stateRate) / 100,
          localRate: taxProfile.localRate ? parseFloat(taxProfile.localRate) / 100 : 0,
          amtApplies: taxProfile.amtApplies,
        },
        cadence: subscription.cadence,
        deliveryTime: subscription.deliveryTime,
        onboardingCompleted: true,
      },
      create: {
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
        taxProfile: {
          state: taxProfile.state,
          filingStatus: taxProfile.filingStatus,
          federalRate: parseFloat(taxProfile.federalRate) / 100,
          stateRate: parseFloat(taxProfile.stateRate) / 100,
          localRate: taxProfile.localRate ? parseFloat(taxProfile.localRate) / 100 : 0,
          amtApplies: taxProfile.amtApplies,
        },
        cadence: subscription.cadence,
        deliveryTime: subscription.deliveryTime,
        onboardingCompleted: true,
      },
    })

    await prisma.userSettings.upsert({
      where: { userId: dbUser.id },
      update: {
        riskMode: preferences.riskMode,
        ratingFloor: preferences.ratingFloor,
        priceFloor: parseFloat(preferences.priceFloor),
        ytwFloor: parseFloat(preferences.ytwFloor) / 100,
        maxMaturity: parseInt(preferences.maxMaturity),
        allowCallable: preferences.allowCallable,
        minLotSize: parseFloat(preferences.minLotSize),
      },
      create: {
        userId: dbUser.id,
        riskMode: preferences.riskMode,
        ratingFloor: preferences.ratingFloor,
        priceFloor: parseFloat(preferences.priceFloor),
        ytwFloor: parseFloat(preferences.ytwFloor) / 100,
        maxMaturity: parseInt(preferences.maxMaturity),
        allowCallable: preferences.allowCallable,
        minLotSize: parseFloat(preferences.minLotSize),
      },
    })

    return NextResponse.json({ success: true, userId: dbUser.id })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}