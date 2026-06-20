import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Read current provider from config file
    const configPath = path.join(process.cwd(), 'data', 'config.json')
    
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      return NextResponse.json({
        provider: configData.provider || 'sqlite'
      })
    }

    return NextResponse.json({
      provider: 'sqlite'
    })
  } catch (error) {
    console.error('Error fetching provider:', error)
    return NextResponse.json({
      provider: 'sqlite'
    })
  }
}
