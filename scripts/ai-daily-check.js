/**
 * AI Daily Health Check Script
 * 
 * This script should be run daily via cron at 12:00 PM
 * 
 * Cron example:
 * 0 12 * * * cd /path/to/project && node scripts/ai-daily-check.js
 * 
 * Or use Vercel Cron Jobs:
 * vercel.json -> 
 * {
 *   "crons": [{
 *     "path": "/api/ai/daily-check",
 *     "schedule": "0 12 * * *"
 *   }]
 * }
 */

const API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://ws-xxx.maas.aliyuncs.com'
const API_KEY = process.env.AI_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'

async function checkAIHealth() {
  console.log('🔍 Starting AI Health Check...')
  console.log('⏰ Time:', new Date().toISOString())

  if (!API_KEY) {
    console.log('❌ AI_API_KEY not configured')
    return { success: false, message: 'API Key not configured' }
  }

  try {
    const startTime = Date.now()

    const response = await fetch(`${API_ENDPOINT}/compatible-mode/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'user', content: 'مرحباً، هذه رسالة اختبار. رد بـ "نجاح"' }
        ],
        max_tokens: 50,
        temperature: 0.1
      })
    })

    const latency = Date.now() - startTime

    if (response.ok) {
      console.log('✅ AI API is healthy!')
      console.log('⏱ Latency:', latency + 'ms')
      return { success: true, latency }
    } else {
      const errorText = await response.text()
      
      let errorMessage = 'فشل الاتصال بـ API'
      if (errorText.includes('invalid') || errorText.includes('401')) {
        errorMessage = 'API Key غير صحيح أو منتهي الصلاحية'
      } else if (errorText.includes('403')) {
        errorMessage = 'ليس لديك صلاحية للوصول لهذا API'
      } else if (errorText.includes('429')) {
        errorMessage = 'تم تجاوز حد الطلبات'
      }

      console.log('❌ AI API Health Check Failed!')
      console.log('Error:', errorMessage)
      console.log('Response:', errorText.substring(0, 200))

      // Send alert notification
      await sendAlert(errorMessage, latency)

      return { success: false, message: errorMessage }
    }
  } catch (error) {
    console.log('❌ AI API Health Check Error!')
    console.log('Error:', error.message)

    // Send alert notification
    await sendAlert(error.message)

    return { success: false, message: error.message }
  }
}

async function sendAlert(errorMessage, latency) {
  // This would integrate with your notification system
  // For example, send email or create admin notification
  console.log('📧 Alert would be sent to admin:', ADMIN_EMAIL)
  console.log('📧 Subject: تحذير - مشكلة في API الذكاء الاصطناعي')
  console.log('📧 Body: فشل التحقق من API: ' + errorMessage)
  
  // You can implement email sending here using nodemailer or similar
  // Or create a database notification record
}

// Run check
checkAIHealth()
  .then(result => {
    console.log('\n📊 Result:', JSON.stringify(result, null, 2))
    process.exit(result.success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Script Error:', error)
    process.exit(1)
  })
