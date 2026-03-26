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

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')
  if (format !== 'json' && format !== 'csv') {
    return NextResponse.json({ error: 'format must be json or csv' }, { status: 400 })
  }

  const [{ data: cards }, { data: themes }] = await Promise.all([
    supabase
      .from('cards')
      .select('id, content, summary, primary_tags, secondary_tags, category, theme_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('themes')
      .select('id, name, color, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `brainworm-export-${dateStr}`

  if (format === 'json') {
    const body = JSON.stringify({
      exportedAt: new Date().toISOString(),
      user_id: user.id,
      themes: themes || [],
      cards: cards || [],
    }, null, 2)

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    })
  }

  // CSV format
  const themeMap = {}
  if (themes) themes.forEach(t => { themeMap[t.id] = t.name })

  const csvRows = [
    ['id', 'content', 'summary', 'tags', 'category', 'theme_name', 'created_at'],
  ]
  if (cards) {
    for (const card of cards) {
      const tags = Array.isArray(card.primary_tags) ? card.primary_tags.join(';') : (card.primary_tags || '')
      const themeName = card.theme_id ? (themeMap[card.theme_id] || '') : ''
      csvRows.push([
        card.id,
        card.content || '',
        card.summary || '',
        tags,
        card.category || '',
        themeName,
        card.created_at || '',
      ])
    }
  }

  const csvContent = csvRows
    .map(row => row.map(cell => {
      const str = String(cell)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(','))
    .join('\n')

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
    },
  })
}
