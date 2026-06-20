import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Get platform settings
export async function GET() {
  try {
    let settings = await prisma.platformSettings.findFirst()
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {}
      })
    }
    
    // Parse instructors JSON
    const settingsWithInstructors = {
      ...settings,
      instructors: JSON.parse(settings.instructors || '[]')
    }
    
    return NextResponse.json(settingsWithInstructors)
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإعدادات' },
      { status: 500 }
    )
  }
}

// PUT - Update platform settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
    
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }
    
    const body = await request.json()
    
    // Prepare data for update
    const updateData: any = {}
    
    if (body.platformName !== undefined) updateData.platformName = body.platformName
    if (body.tagline !== undefined) updateData.tagline = body.tagline
    if (body.description !== undefined) updateData.description = body.description
    if (body.platformLogo !== undefined) updateData.platformLogo = body.platformLogo
    if (body.heroImage !== undefined) updateData.heroImage = body.heroImage
    if (body.heroTitle !== undefined) updateData.heroTitle = body.heroTitle
    if (body.heroSubtitle !== undefined) updateData.heroSubtitle = body.heroSubtitle
    if (body.heroCtaText !== undefined) updateData.heroCtaText = body.heroCtaText
    if (body.heroVideoUrl !== undefined) updateData.heroVideoUrl = body.heroVideoUrl
    if (body.youtubeUrl !== undefined) updateData.youtubeUrl = body.youtubeUrl
    if (body.facebookUrl !== undefined) updateData.facebookUrl = body.facebookUrl
    if (body.whatsappUrl !== undefined) updateData.whatsappUrl = body.whatsappUrl
    if (body.instagramUrl !== undefined) updateData.instagramUrl = body.instagramUrl
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail
    if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone
    if (body.footerText !== undefined) updateData.footerText = body.footerText
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    
    // Handle instructors array - store as JSON string
    if (body.instructors !== undefined) {
      updateData.instructors = JSON.stringify(body.instructors)
    }
    
    // Get existing settings or create new one
    let settings = await prisma.platformSettings.findFirst()
    
    if (settings) {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: updateData
      })
    } else {
      settings = await prisma.platformSettings.create({
        data: updateData
      })
    }
    
    // Parse instructors for response
    const settingsWithInstructors = {
      ...settings,
      instructors: JSON.parse(settings.instructors || '[]')
    }
    
    return NextResponse.json(settingsWithInstructors)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الإعدادات' },
      { status: 500 }
    )
  }
}
