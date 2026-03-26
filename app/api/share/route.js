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

  const body = await request.json()
  const { themeId, action } = body

  if (action === 'generate-edit-link') {
    if (!themeId) {
      return NextResponse.json({ error: 'themeId required' }, { status: 400 })
    }

    const editToken = crypto.randomUUID()

    const { error } = await supabase
      .from('themes')
      .update({ edit_token: editToken })
      .eq('id', themeId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const origin = request.headers.get('origin') || request.headers.get('host') || ''
    const base = origin.startsWith('http') ? origin : `https://${origin}`
    const editUrl = `${base}/shared/${editToken}?mode=edit`

    return NextResponse.json({ editUrl })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
