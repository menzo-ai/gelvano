import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    let data: Record<string, unknown> = {}

    switch (type) {
      case 'users':
        // Get all users except admin
        const users = await prisma.user.findMany({
          where: {
            role: {
              notIn: ['SUPER_ADMIN', 'ADMIN']
            }
          },
          include: {
            subscription: true,
            enrollments: true,
            progress: true,
          }
        })
        data = { users }
        break

      case 'courses':
        const courses = await prisma.course.findMany({
          include: {
            chapters: {
              include: {
                lectures: true
              }
            },
            enrollments: true,
            exams: true,
          }
        })
        data = { courses }
        break

      case 'enrollments':
        const enrollments = await prisma.enrollment.findMany({
          include: {
            user: true,
            course: true,
          }
        })
        data = { enrollments }
        break

      case 'subscriptions':
        const subscriptions = await prisma.subscription.findMany({
          include: {
            user: true,
          }
        })
        data = { subscriptions }
        break

      case 'notifications':
        const notifications = await prisma.notification.findMany({
          include: {
            user: true,
          }
        })
        data = { notifications }
        break

      case 'messages':
        const messages = await prisma.message.findMany({
          include: {
            sender: true,
            receiver: true,
          }
        })
        data = { messages }
        break

      case 'exams':
        const exams = await prisma.exam.findMany({
          include: {
            course: true,
            results: true,
          }
        })
        data = { exams }
        break

      case 'tickets':
        const tickets = await prisma.ticket.findMany({
          include: {
            user: true,
            messages: true,
          }
        })
        data = { tickets }
        break

      case 'all':
      default:
        // Get all data (admin users excluded from users)
        const allUsers = await prisma.user.findMany({
          where: {
            role: {
              notIn: ['SUPER_ADMIN', 'ADMIN']
            }
          },
          include: {
            subscription: true,
            enrollments: true,
            progress: true,
          }
        })

        const allCourses = await prisma.course.findMany({
          include: {
            chapters: {
              include: {
                lectures: true
              }
            },
            enrollments: true,
            exams: true,
          }
        })

        const allSubscriptions = await prisma.subscription.findMany({
          include: {
            user: true,
          }
        })

        const allEnrollments = await prisma.enrollment.findMany({
          include: {
            user: true,
            course: true,
          }
        })

        const allNotifications = await prisma.notification.findMany({
          include: {
            user: true,
          }
        })

        const allMessages = await prisma.message.findMany({
          include: {
            sender: true,
            receiver: true,
          }
        })

        const allExams = await prisma.exam.findMany({
          include: {
            course: true,
            results: true,
          }
        })

        const allTickets = await prisma.ticket.findMany({
          include: {
            user: true,
            messages: true,
          }
        })

        data = {
          exportDate: new Date().toISOString(),
          version: '1.0',
          users: allUsers,
          courses: allCourses,
          subscriptions: allSubscriptions,
          enrollments: allEnrollments,
          notifications: allNotifications,
          messages: allMessages,
          exams: allExams,
          tickets: allTickets,
        }
        break
    }

    return NextResponse.json({
      success: true,
      type,
      data,
      exportedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
