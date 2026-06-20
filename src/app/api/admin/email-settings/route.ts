import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'data', 'email-settings.json')

export const dynamic = 'force-dynamic'

// Get email settings
export async function GET() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const settings = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
      // Don't expose password
      settings.password = settings.password ? '***' : ''
      return NextResponse.json(settings)
    }

    return NextResponse.json({
      emailEnabled: false,
      host: 'smtp.gmail.com',
      port: '587',
      secure: false,
      user: '',
      password: '',
      fromName: 'GELVANO',
      fromEmail: 'noreply@gelvano.com'
    })
  } catch (error) {
    console.error('Error reading email settings:', error)
    return NextResponse.json({ error: 'Error reading settings' }, { status: 500 })
  }
}

// Update email settings
export async function PUT(req: NextRequest) {
  try {
    const settings = await req.json()
    
    // Ensure data directory exists
    const dataDir = path.dirname(CONFIG_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // If password is masked, keep the old one
    if (settings.password === '***') {
      if (fs.existsSync(CONFIG_FILE)) {
        const oldSettings = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
        settings.password = oldSettings.password
      }
    }

    // Save settings
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(settings, null, 2))

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    })
  } catch (error) {
    console.error('Error saving email settings:', error)
    return NextResponse.json({ error: 'Error saving settings' }, { status: 500 })
  }
}
