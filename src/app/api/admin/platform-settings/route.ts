import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let settings = await prisma.platformSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          name: 'GELVANO',
          instructorName: 'Khaled Osama'
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching platform settings:', error)
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      logo,
      instructorName,
      instructorImage,
      email,
      phone,
      whatsapp,
      facebook,
      youtube,
      description,
      footerText,
      isSubscriptionsEnabled,
      isWalletEnabled,
      isCodesEnabled
    } = body

    let settings = await prisma.platformSettings.findFirst()
    
    if (settings) {
      settings = await prisma.platformSettings.update({
        where: { id: settings.id },
        data: {
          name,
          logo,
          instructorName,
          instructorImage,
          email,
          phone,
          whatsapp,
          facebook,
          youtube,
          description,
          footerText,
          isSubscriptionsEnabled,
          isWalletEnabled,
          isCodesEnabled
        }
      })
    } else {
      settings = await prisma.platformSettings.create({
        data: {
          name: name || 'GELVANO',
          logo,
          instructorName: instructorName || 'Khaled Osama',
          instructorImage,
          email,
          phone,
          whatsapp,
          facebook,
          youtube,
          description,
          footerText,
          isSubscriptionsEnabled,
          isWalletEnabled,
          isCodesEnabled
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating platform settings:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
}
