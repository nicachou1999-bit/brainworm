import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epbrxieplvmegicnkjfu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cr9gWDLGjWPj7fSx_6q-NA_volZtGQg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
