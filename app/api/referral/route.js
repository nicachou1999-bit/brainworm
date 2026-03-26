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
      .select('referred_by, referral_code, bonus_ai_credits')
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
      .select('user_id, bonus_ai_credits')
      .eq('referral_code', normalizedCode)
      .single()

    if (referrerError || !referrer) {
      return Response.json({ error: '找不到此推薦碼' }, { status: 404 })
    }

    const referrerId = referrer.user_id

    // 更新被推薦人：記錄 referred_by，+10 額度
    const { error: updateMeError } = await adminClient
      .from('user_quotas')
      .update({
        referred_by: referrerId,
        bonus_ai_credits: (myQuota.bonus_ai_credits || 0) + 10,
      })
      .eq('user_id', user.id)

    if (updateMeError) {
      return Response.json({ error: '更新失敗' }, { status: 500 })
    }

    // 新增 referral_uses 記錄
    // NOTE: 需要先執行 DEPLOY.md 中的 referral_uses 資料表 SQL migration
    const { error: insertUseError } = await adminClient
      .from('referral_uses')
      .insert({ referrer_id: referrerId, redeemer_id: user.id })

    if (insertUseError) {
      return Response.json({ error: '記錄推薦使用失敗' }, { status: 500 })
    }

    // 計算推薦人目前的推薦次數
    const { count: referralCount, error: countError } = await adminClient
      .from('referral_uses')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', referrerId)

    if (countError) {
      return Response.json({ error: '查詢推薦次數失敗' }, { status: 500 })
    }

    // 決定基本獎勵與里程碑獎勵
    let referrerBonus = 10
    let milestoneReached = null
    let message = '推薦成功！獎勵 +10 次 AI 額度'

    if (referralCount === 10) {
      referrerBonus += 200
      milestoneReached = '10'
      message = '達成傳奇推薦！+200 次額度獎勵'
    } else if (referralCount === 5) {
      referrerBonus += 50
      milestoneReached = '5'
      message = '解鎖里程碑！+50 次額度獎勵'
    }

    // 更新推薦人：+額度，+1 推薦數
    const { error: updateReferrerError } = await adminClient
      .from('user_quotas')
      .update({
        bonus_ai_credits: (referrer.bonus_ai_credits || 0) + referrerBonus,
        total_referrals: referralCount,
      })
      .eq('user_id', referrerId)

    if (updateReferrerError) {
      return Response.json({ error: '更新推薦人失敗' }, { status: 500 })
    }

    return Response.json({
      success: true,
      creditsAwarded: 10,
      referrerCount: referralCount,
      milestoneReached,
      message,
    })
  } catch (err) {
    return Response.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
