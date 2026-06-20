import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const data = JSON.parse(text)

    let count = 0

    // Import based on data type
    if (data.type === 'users' && Array.isArray(data.data)) {
      for (const user of data.data) {
        try {
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              name: user.name,
              phone: user.phone,
              parentName: user.parentName,
              parentPhone: user.parentPhone,
              schoolYear: user.schoolYear,
              isAzhar: user.isAzhar,
              isVerified: user.isVerified,
              isActive: user.isActive
            },
            create: {
              id: user.id,
              name: user.name,
              email: user.email,
              password: '', // Password will need to be reset
              phone: user.phone,
              parentName: user.parentName,
              parentPhone: user.parentPhone,
              schoolYear: user.schoolYear,
              isAzhar: user.isAzhar,
              isVerified: user.isVerified,
              isActive: user.isActive,
              role: 'STUDENT'
            }
          })
          count++
        } catch (e) {
          console.error('Error importing user:', e)
        }
      }
    } else if (data.type === 'full' && data.data) {
      const { users, courses, lectures, enrollments } = data.data

      // Import users
      if (Array.isArray(users)) {
        for (const user of users) {
          try {
            await prisma.user.upsert({
              where: { id: user.id },
              update: user,
              create: {
                ...user,
                password: ''
              }
            })
            count++
          } catch (e) {
            console.error('Error importing user:', e)
          }
        }
      }

      // Import courses
      if (Array.isArray(courses)) {
        for (const course of courses) {
          try {
            const { chapters, ...courseData } = course
            await prisma.course.upsert({
              where: { id: course.id },
              update: courseData,
              create: courseData
            })

            // Import chapters
            if (chapters) {
              for (const chapter of chapters) {
                const { lectures: chapterLectures, ...chapterData } = chapter
                await prisma.chapter.upsert({
                  where: { id: chapter.id },
                  update: chapterData,
                  create: chapterData
                })

                // Import lectures
                if (chapterLectures) {
                  for (const lecture of chapterLectures) {
                    await prisma.lecture.upsert({
                      where: { id: lecture.id },
                      update: lecture,
                      create: lecture
                    })
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error importing course:', e)
          }
        }
      }

      // Import enrollments
      if (Array.isArray(enrollments)) {
        for (const enrollment of enrollments) {
          try {
            await prisma.enrollment.upsert({
              where: { id: enrollment.id },
              update: enrollment,
              create: enrollment
            })
          } catch (e) {
            console.error('Error importing enrollment:', e)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      count,
      message: `تم استيراد ${count} سجل بنجاح`
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error.message || 'Error importing data' }, { status: 500 })
  }
}
