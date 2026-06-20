import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json({ error: 'Error fetching coupons' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, discount, isPercentage, maxUses, validUntil, isGlobal, courseId, lectureId } = body

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount,
        isPercentage,
        maxUses,
        validUntil: validUntil ? new Date(validUntil) : null,
        isGlobal,
        courseId,
        lectureId
      }
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json({ error: 'Error creating coupon' }, { status: 500 })
  }
}
