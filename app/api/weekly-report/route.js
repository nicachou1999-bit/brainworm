import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epbrxieplvmegicnkjfu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cr9gWDLGjWPj7fSx_6q-NA_volZtGQg'

export async function GET(request) {
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

  // 查詢過去 7 天的卡片
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: cards } = await supabase
    .from('cards')
    .select('id, title, summary, theme_id, created_at')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo)

  if (!cards || cards.length === 0) {
    return NextResponse.json({
      empty: true,
      cardCount: 0,
      report: null,
    })
  }

  // 統計各主題卡片數量
  const themeCount = {}
  cards.forEach(c => {
    if (c.theme_id) {
      themeCount[c.theme_id] = (themeCount[c.theme_id] || 0) + 1
    }
  })

  // 取得主題名稱
  let topThemeName = '未分類'
  const themeIds = Object.keys(themeCount)
  if (themeIds.length > 0) {
    const topThemeId = themeIds.reduce((a, b) => themeCount[a] > themeCount[b] ? a : b)
    const { data: themes } = await supabase
      .from('themes')
      .select('id, name')
      .in('id', themeIds)
    const topTheme = themes?.find(t => t.id === topThemeId)
    if (topTheme) topThemeName = topTheme.name
  }

  // 呼叫 Gemini 產生週報
  const cardList = cards
    .filter(c => c.title && c.title !== '分析中...')
    .slice(0, 20) // 最多 20 張避免超出 token 限制
    .map(c => `- ${c.title}${c.summary ? ': ' + c.summary : ''}`)
    .join('\n')

  const prompt = `以下是用戶本週收集的知識卡片摘要列表：
${cardList}

請產生一份輕鬆有趣的週報（繁體中文），格式如下 JSON：
{
  "headline": "本週知識收穫標題（20字以內，有趣一點）",
  "highlights": ["亮點1（30字）", "亮點2（30字）", "亮點3（30字）"],
  "insight": "AI對本週知識的整體洞察（50字以內）",
  "encouragement": "一句激勵的話（20字以內）"
}`

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

  let report = null
  if (rawText) {
    try {
      const jsonText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      report = JSON.parse(jsonText)
    } catch {
      // Gemini 回傳格式異常時給預設值
      report = {
        headline: '本週知識大豐收！',
        highlights: cards.slice(0, 3).map(c => c.title || '精彩卡片'),
        insight: `本週共收集 ${cards.length} 張卡片，知識庫持續成長中。`,
        encouragement: '繼續保持好奇心！',
      }
    }
  }

  return NextResponse.json({
    empty: false,
    cardCount: cards.length,
    topTheme: topThemeName,
    themeStats: themeCount,
    report,
  })
}
