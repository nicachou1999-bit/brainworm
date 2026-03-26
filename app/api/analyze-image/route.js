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

  // 取得圖片
  const formData = await request.formData()
  const image = formData.get('image')
  if (!image) {
    return Response.json({ error: 'No image provided' }, { status: 400 })
  }

  const arrayBuffer = await image.arrayBuffer()
  const base64String = Buffer.from(arrayBuffer).toString('base64')
  const mimeType = image.type || 'image/jpeg'

  // 呼叫 Gemini Vision API
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: '請分析這張圖片內容，以JSON格式回傳：title（繁體中文，15字以內）、summary（繁體中文，30字以內）、primary_tags（陣列，1-3個主要主題）、secondary_tags（陣列，3-6個細節關鍵詞）、category（idea/article/task/note之一）。只回傳純 JSON，不要包含 markdown 格式。'
            },
            {
              inline_data: { mime_type: mimeType, data: base64String }
            }
          ]
        }]
      })
    }
  )

  if (!geminiRes.ok) {
    const errText = await geminiRes.text()
    console.error('Gemini API error:', errText)
    return Response.json({ error: 'AI analysis failed' }, { status: 500 })
  }

  const geminiData = await geminiRes.json()
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

  // 解析 JSON（去除可能的 markdown code block）
  let parsed
  try {
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    parsed = {
      title: '圖片卡片',
      summary: rawText.slice(0, 30),
      primary_tags: [],
      secondary_tags: [],
      category: 'note'
    }
  }

  return Response.json(parsed)
}
