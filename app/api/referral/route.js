import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epbrxieplvmegicnkjfu.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Cr9gWDLGjWPj7fSx_6q-NA_volZtGQg'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: '未授權' }, { status: 401 })
    }
    const token = authHeader.slice(7)

    // 用 anon client 驗證 JWT
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: '無效的 token' }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code || typeof code !== 'string' || !/^[A-Z0-9]{6}$/.test(code.toUpperCase())) {
      return Response.json({ error: '推薦碼格式不正確' }, { status: 400 })
    }
    const normalizedCode = code.toUpperCase()

    // 使用 service role client（有完整存取權限）
    const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: { persistSession: false },
    })

    // 確認被推薦人尚未使用過推薦碼
    const { data: myQuota, error: myQuotaError } = await adminClient
      .from('user_quotas')
      .select('referred_by, referral_code')
      .eq('user_id', user.id)
      .single()

    if (myQuotaError) {
      return Response.json({ error: '找不到用戶配額記錄' }, { status: 404 })
    }
    if (myQuota.referred_by) {
      return Response.json({ error: '你已經使用過推薦碼了' }, { status: 400 })
    }
    if (myQuota.referral_code === normalizedCode) {
      return Response.json({ error: '不能使用自己的推薦碼' }, { status: 400 })
    }

    // 找推薦人
    const { data: referrer, error: referrerError } = await adminClient
      .from('user_quotas')
      .select('user_id, bonus_ai_credits, total_referrals')
      .eq('referral_code', normalizedCode)
      .single()

    if (referrerError || !referrer) {
      return Response.json({ error: '找不到此推薦碼' }, { status: 404 })
    }

    // 更新被推薦人：記錄 referred_by，+5 額度
    const { error: updateMeError } = await adminClient
      .from('user_quotas')
      .update({
        referred_by: referrer.user_id,
        bonus_ai_credits: (myQuota.bonus_ai_credits || 0) + 5,
      })
      .eq('user_id', user.id)

    if (updateMeError) {
      return Response.json({ error: '更新失敗' }, { status: 500 })
    }

    // 更新推薦人：+10 額度，+1 推薦數
    const { error: updateReferrerError } = await adminClient
      .from('user_quotas')
      .update({
        bonus_ai_credits: (referrer.bonus_ai_credits || 0) + 10,
        total_referrals: (referrer.total_referrals || 0) + 1,
      })
      .eq('user_id', referrer.user_id)

    if (updateReferrerError) {
      return Response.json({ error: '更新推薦人失敗' }, { status: 500 })
    }

    return Response.json({ success: true, bonus: 5 })
  } catch (err) {
    return Response.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
