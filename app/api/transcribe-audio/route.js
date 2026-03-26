import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  // JWT 驗證
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 取得音訊檔案
  const formData = await request.formData()
  const audio = formData.get('audio')
  if (!audio) {
    return Response.json({ error: 'No audio provided' }, { status: 400 })
  }

  // 檢查檔案大小 (10MB)
  if (audio.size > 10 * 1024 * 1024) {
    return Response.json({ error: 'File too large' }, { status: 413 })
  }

  // 檢查檔案格式
  const mimeType = audio.type || 'audio/webm'
  const supported = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
  if (!supported.includes(mimeType) && !mimeType.startsWith('audio/')) {
    return Response.json({ error: 'Unsupported format' }, { status: 400 })
  }

  const arrayBuffer = await audio.arrayBuffer()
  const base64Audio = Buffer.from(arrayBuffer).toString('base64')

  // 呼叫 Gemini 1.5 Flash API
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: { mime_type: mimeType, data: base64Audio }
            },
            {
              text: '請將這段錄音完整轉錄成繁體中文文字。如果包含多個主題，請用換行分段。只輸出轉錄內容，不要加說明。'
            }
          ]
        }]
      })
    }
  )

  if (!geminiRes.ok) {
    const errText = await geminiRes.text()
    console.error('Gemini transcribe error:', errText)
    return Response.json({ error: 'Transcription failed' }, { status: 500 })
  }

  const geminiData = await geminiRes.json()
  const transcript = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

  return Response.json({ transcript: transcript.trim() })
}
