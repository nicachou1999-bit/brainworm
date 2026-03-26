import { createClient } from '@supabase/supabase-js'

const REVIEW_INTERVALS = [1, 3, 7, 14] // days after each review

function getNextInterval(reviewCount) {
  const idx = Math.min(reviewCount, REVIEW_INTERVALS.length - 1)
  return REVIEW_INTERVALS[idx]
}

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

async function getAuthUser(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return { user: null, error: 'Unauthorized' }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  return { user: user || null, error: error ? 'Unauthorized' : null, supabase }
}

export async function GET(request) {
  const { user, error, supabase } = await getAuthUser(request)
  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date().toISOString()
  const { data, error: dbError } = await supabase
    .from('cards')
    .select('id, title, summary, review_count, next_review_at, last_reviewed_at')
    .eq('user_id', user.id)
    .lte('next_review_at', now)
    .order('next_review_at', { ascending: true })
    .limit(5)

  if (dbError) {
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ cards: data || [] })
}

export async function POST(request) {
  const { user, error, supabase } = await getAuthUser(request)
  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { cardId, remembered } = await request.json()
  if (!cardId || remembered === undefined) {
    return Response.json({ error: 'Missing cardId or remembered' }, { status: 400 })
  }

  // Fetch current card
  const { data: card, error: fetchError } = await supabase
    .from('cards')
    .select('review_count')
    .eq('id', cardId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !card) {
    return Response.json({ error: 'Card not found' }, { status: 404 })
  }

  let updateData
  if (remembered) {
    const newCount = (card.review_count || 0) + 1
    const days = getNextInterval(newCount - 1)
    updateData = {
      review_count: newCount,
      next_review_at: addDays(days),
      last_reviewed_at: new Date().toISOString(),
    }
  } else {
    updateData = {
      next_review_at: addDays(1),
      last_reviewed_at: new Date().toISOString(),
    }
  }

  const { error: updateError } = await supabase
    .from('cards')
    .update(updateData)
    .eq('id', cardId)
    .eq('user_id', user.id)

  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
