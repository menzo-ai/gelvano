import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Delete all non-admin data in order (respecting foreign keys)
    
    // Delete lecture interactions first
    await prisma.lectureLike.deleteMany({ where: {} })
    await prisma.lectureComment.deleteMany({ where: {} })
    
    // Delete forum interactions
    await prisma.commentLike.deleteMany({ where: {} })
    await prisma.forumComment.deleteMany({ where: {} })
    await prisma.postLike.deleteMany({ where: {} })
    await prisma.forumPost.deleteMany({ where: {} })
    
    // Delete AI data
    await prisma.aIMessage.deleteMany({ where: {} })
    await prisma.aIConversation.deleteMany({ where: {} })
    
    // Delete other user-related data
    await prisma.enrollment.deleteMany({ where: {} })
    await prisma.walletTransaction.deleteMany({ where: {} })
    await prisma.wallet.deleteMany({ where: {} })
    await prisma.couponUsage.deleteMany({ where: {} })
    await prisma.purchase.deleteMany({ where: {} })
    await prisma.subscription.deleteMany({ where: {} })
    await prisma.progress.deleteMany({ where: {} })
    await prisma.ticketMessage.deleteMany({ where: {} })
    await prisma.ticket.deleteMany({ where: {} })
    await prisma.notification.deleteMany({ where: {} })
    await prisma.activityLog.deleteMany({ where: {} })
    
    // Delete all students
    await prisma.user.deleteMany({
      where: { role: 'STUDENT' }
    })

    // Delete all courses, chapters, lectures
    await prisma.lecture.deleteMany()
    await prisma.chapter.deleteMany()
    await prisma.course.deleteMany()

    return NextResponse.json({
      success: true,
      message: 'تم حذف جميع البيانات (باستثناء حساب المدير) بنجاح'
    })
  } catch (error) {
    console.error('Clear database error:', error)
    return NextResponse.json({ error: 'Error clearing database' }, { status: 500 })
  }
}
