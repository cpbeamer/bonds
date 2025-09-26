import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { notificationId: string } }
) {
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

    // Mark notification as read
    const notification = await prisma.notification.update({
      where: {
        id: params.notificationId,
        userId: user.id, // Ensure user owns this notification
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}
