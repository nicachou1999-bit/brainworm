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

  const now = new Date()
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, content, summary, theme_id, created_at, next_review_at')
    .eq('user_id', user.id)

  if (error || !cards) {
    return NextResponse.json({ suggestions: [], total: 0 })
  }

  const seen = new Set()
  const suggestions = []

  for (const card of cards) {
    if (seen.has(card.id)) continue

    // Orphan: no theme, created > 7 days ago
    if (!card.theme_id && card.created_at < sevenDaysAgo) {
      seen.add(card.id)
      suggestions.push({ ...card, reason: '尚未歸入任何主題', reasonType: 'orphan' })
      continue
    }

    // Dusty: next_review_at older than 30 days
    if (card.next_review_at && card.next_review_at < thirtyDaysAgo) {
      seen.add(card.id)
      suggestions.push({ ...card, reason: '超過 30 天未複習', reasonType: 'dusty' })
      continue
    }

    // Stub: content < 20 chars, no summary, created > 3 days ago
    if (
      card.content &&
      card.content.length < 20 &&
      !card.summary &&
      card.created_at < threeDaysAgo
    ) {
      seen.add(card.id)
      suggestions.push({ ...card, reason: '內容過短，可能是筆記殘稿', reasonType: 'stub' })
    }
  }

  const top10 = suggestions.slice(0, 10).map(({ id, content, summary, created_at, reason, reasonType }) => ({
    id, content, summary, created_at, reason, reasonType,
  }))

  return NextResponse.json({ suggestions: top10, total: suggestions.length })
}
