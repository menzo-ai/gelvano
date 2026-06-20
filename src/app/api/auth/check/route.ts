import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const canRegister = userCount === 0
    
    return NextResponse.json({
      canRegister,
      message: canRegister
        ? 'First account - will be admin'
        : 'Students can register'
    })
  } catch {
    // If database is not connected, assume first registration
    return NextResponse.json({
      canRegister: true,
      message: 'System ready for registration'
    })
  }
}
