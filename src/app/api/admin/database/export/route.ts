import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'

    // Fetch all data based on type
    if (type === 'users') {
      // Export users only (excluding admins)
      const users = await prisma.user.findMany({
        where: {
          role: 'STUDENT'
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          parentName: true,
          parentPhone: true,
          schoolYear: true,
          isAzhar: true,
          isVerified: true,
          isActive: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })

      const exportData = {
        type: 'users',
        exportedAt: new Date().toISOString(),
        count: users.length,
        data: users
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="users_backup.json"`
        }
      })
    }

    // Export all data (excluding admin accounts)
    const [users, courses, lectures, enrollments, purchases, coupons, wallets, walletTransactions] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: {
          id: true, name: true, email: true, phone: true, parentName: true,
          parentPhone: true, schoolYear: true, isAzhar: true, isVerified: true,
          isActive: true, role: true, createdAt: true, updatedAt: true
        }
      }),
      prisma.course.findMany({
        include: {
          chapters: {
            include: {
              lectures: true
            }
          }
        }
      }),
      prisma.lecture.findMany(),
      prisma.enrollment.findMany(),
      prisma.purchase.findMany(),
      prisma.coupon.findMany(),
      prisma.wallet.findMany({
        where: { user: { role: 'STUDENT' } }
      }),
      prisma.walletTransaction.findMany({
        where: { wallet: { user: { role: 'STUDENT' } } }
      })
    ])

    const exportData = {
      type: 'full',
      exportedAt: new Date().toISOString(),
      count: {
        users: users.length,
        courses: courses.length,
        lectures: lectures.length,
        enrollments: enrollments.length
      },
      data: {
        users,
        courses,
        lectures,
        enrollments,
        purchases,
        coupons,
        wallets,
        walletTransactions
      }
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="full_backup.json"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Error exporting data' }, { status: 500 })
  }
}
