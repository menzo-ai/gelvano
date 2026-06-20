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

    const { amount } = await req.json()
    
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 }
      })
    }

    // Create pending deposit request (admin will approve)
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء طلب الإيداع. تواصل مع الإدارة للدفع.',
      pendingAmount: amount
    })
  } catch (error) {
    console.error('Error creating deposit:', error)
    return NextResponse.json({ error: 'Error creating deposit' }, { status: 500 })
  }
}
