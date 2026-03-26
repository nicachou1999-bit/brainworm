import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epbrxieplvmegicnkjfu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cr9gWDLGjWPj7fSx_6q-NA_volZtGQg'

export async function POST(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { cardId, cardTitle, cardSummary, primaryTags } = await request.json()

  const { data: themes } = await supabase
    .from('themes')
    .select('id, name, description')
    .eq('user_id', user.id)

  if (!themes || themes.length < 2) {
    return NextResponse.json({ suggested: null })
  }

  const prompt = `以下是用戶的知識主題列表：
${themes.map(t => `- ${t.id}: ${t.name} (${t.description || ''})`).join('\n')}

新卡片資訊：
標題：${cardTitle}
摘要：${cardSummary || ''}
標籤：${(primaryTags || []).join(', ')}

請判斷這張卡片最適合歸入哪個主題？只回傳最匹配主題的 ID（UUID字串），如果沒有合適的就回傳 null。只回傳純文字，不要 JSON 包裝。`

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  )

  const geminiData = await geminiRes.json()
  const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

  if (!rawText || rawText === 'null') {
    return NextResponse.json({ suggested: null })
  }

  const matched = themes.find(t => t.id === rawText)
  if (!matched) {
    return NextResponse.json({ suggested: null })
  }

  return NextResponse.json({ suggested: { themeId: matched.id, themeName: matched.name } })
}
