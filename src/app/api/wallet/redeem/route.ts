import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code } = await req.json()
    
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'الكود غير صحيح' }, { status: 404 })
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'الكود غير نشط' }, { status: 400 })
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json({ error: 'الكود منتهي الصلاحية' }, { status: 400 })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'تم استخدام جميع مرات استخدام هذا الكود' }, { status: 400 })
    }

    // Check if user already used this coupon
    const existingUsage = await prisma.couponUsage.findUnique({
      where: {
        couponId_userId: {
          couponId: coupon.id,
          userId
        }
      }
    })

    if (existingUsage) {
      return NextResponse.json({ error: 'لقد استخدمت هذا الكود من قبل' }, { status: 400 })
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId }
      })
    }

    // Calculate amount
    let amount = coupon.discount
    if (coupon.isPercentage) {
      amount = coupon.discount // This would be percentage, adjust based on your logic
    }

    // Update wallet balance
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: wallet.balance + amount }
    })

    // Add transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'deposit',
        description: `استرداد كود: ${code}`
      }
    })

    // Update coupon usage
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: coupon.usedCount + 1 }
    })

    // Record usage
    await prisma.couponUsage.create({
      data: {
        couponId: coupon.id,
        userId
      }
    })

    return NextResponse.json({
      success: true,
      amount,
      message: `تم إضافة ${amount} جنيه لمحفظتك!`
    })
  } catch (error) {
    console.error('Error redeeming coupon:', error)
    return NextResponse.json({ error: 'Error redeeming coupon' }, { status: 500 })
  }
}
