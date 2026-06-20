import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      totalUsers,
      totalCourses,
      totalLectures,
      totalEnrollments,
      totalRevenue,
      totalSubscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lecture.count(),
      prisma.enrollment.count(),
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.subscription.count()
    ])

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalLectures,
      totalEnrollments,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalSubscriptions
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 })
  }
}
