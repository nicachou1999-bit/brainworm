'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: 13,
      fontWeight: '400',
      color: colors.textTertiary,
      margin: '24px 0 6px',
      paddingLeft: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>{title}</div>
  )
}

function GroupedList({ children }) {
  return (
    <div style={{
      background: colors.card,
      borderRadius: radius.lg,
      overflow: 'hidden',
      boxShadow: shadow.sm,
    }}>
      {children}
    </div>
  )
}

function ListRow({ label, value, chevron = true, onClick, danger = false, last = false, right }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: last ? 'none' : `1px solid ${colors.separator}`,
        background: 'transparent',
      }}
    >
      <span style={{ fontSize: 17, color: danger ? colors.danger : colors.text }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {right}
        {value && <span style={{ fontSize: 15, color: colors.textTertiary }}>{value}</span>}
        {chevron && !right && <span style={{ fontSize: 15, color: colors.textTertiary }}>›</span>}
      </span>
    </div>
  )
}

function Toggle({ value, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '51px',
        height: '31px',
        borderRadius: '16px',
        cursor: 'pointer',
        background: value ? colors.success : 'rgba(120,120,128,0.16)',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        justifyContent: value ? 'flex-end' : 'flex-start',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '27px',
        height: '27px',
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}></div>
    </div>
  )
}

export default function Settings({ user }) {
  const [lang, setLang] = useState('繁體中文')
  const [aiLayer, setAiLayer] = useState('cloud')
  const [surfaceNotif, setSurfaceNotif] = useState(true)
  const [cardNotif, setCardNotif] = useState(false)

  const langs = ['繁體中文', 'English', 'Español']
  const [showLangs, setShowLangs] = useState(false)

  // Referral state
  const [quota, setQuota] = useState(null)
  const [referralInput, setReferralInput] = useState('')
  const [referralLoading, setReferralLoading] = useState(false)
  const [referralMessage, setReferralMessage] = useState('')
  const [referralError, setReferralError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_quotas')
      .select('referral_code, referred_by, bonus_ai_credits, total_referrals')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => { if (data) setQuota(data) })
  }, [user])

  async function handleRedeemReferral() {
    if (!referralInput || referralLoading) return
    setReferralLoading(true)
    setReferralError('')
    setReferralMessage('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: referralInput.toUpperCase() }),
      })
      const json = await res.json()
      if (json.success) {
        setReferralMessage('🎉 已兌換！獲得 +5 次 AI 額度')
        setQuota(q => ({ ...q, referred_by: 'done', bonus_ai_credits: (q?.bonus_ai_credits || 0) + 5 }))
      } else {
        setReferralError(json.error || '兌換失敗')
      }
    } catch {
      setReferralError('網路錯誤，請稍後再試')
    }
    setReferralLoading(false)
  }

  function copyReferralCode() {
    if (!quota?.referral_code) return
    navigator.clipboard.writeText(quota.referral_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function copyReferralLink() {
    if (!quota?.referral_code) return
    navigator.clipboard.writeText(`https://brainworm.app?ref=${quota.referral_code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ paddingBottom: '90px', fontFamily: typography.fontFamily }}>
      {/* Large title header */}
      <div style={{ padding: '56px 16px 0' }}>
        <div style={{ fontSize: 34, fontWeight: '700', color: colors.text, letterSpacing: 0.37 }}>設定</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Language section */}
        <SectionHeader title="語言" />
        <div style={{ position: 'relative' }}>
          <GroupedList>
            <ListRow
              label="🌐 顯示語言"
              value={lang}
              onClick={() => setShowLangs(!showLangs)}
              last
            />
          </GroupedList>
          {showLangs && (
            <div style={{
              position: 'absolute',
              top: '52px',
              left: 0,
              right: 0,
              background: colors.card,
              borderRadius: radius.lg,
              zIndex: 50,
              overflow: 'hidden',
              boxShadow: shadow.lg,
            }}>
              {langs.map((l, i) => (
                <div
                  key={l}
                  onClick={() => { setLang(l); setShowLangs(false) }}
                  style={{
                    padding: '12px 16px',
                    fontSize: 17,
                    cursor: 'pointer',
                    color: lang === l ? colors.primary : colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: i < langs.length - 1 ? `1px solid ${colors.separator}` : 'none',
                    background: 'transparent',
                  }}
                >
                  {l}
                  {lang === l && <span style={{ color: colors.primary, fontSize: 17 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI layer section */}
        <SectionHeader title="AI 層" />
        <GroupedList>
          {[
            { id: 'cloud', icon: '☁️', name: 'Brainworm 雲端 AI', desc: '最佳品質，語音轉文字、多模態、問答全功能（Pro 方案）' },
            { id: 'byok', icon: '🔑', name: '自帶 API Key（BYOK）', desc: '使用自己的 OpenAI / Anthropic Key，可接本地 Ollama' },
            { id: 'local', icon: '💻', name: '本地模型（離線）', desc: '完全離線，資料不離開裝置，功能較有限', soon: true },
          ].map((layer, i, arr) => (
            <div
              key={layer.id}
              onClick={() => !layer.soon && setAiLayer(layer.id)}
              style={{
                padding: '12px 16px',
                cursor: layer.soon ? 'default' : 'pointer',
                borderBottom: i < arr.length - 1 ? `1px solid ${colors.separator}` : 'none',
                background: aiLayer === layer.id ? 'rgba(0,122,255,0.04)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: 17, color: colors.text }}>{layer.icon} {layer.name}</span>
                {aiLayer === layer.id && <span style={{ color: colors.primary, fontSize: 17 }}>✓</span>}
                {layer.soon && <span style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '500' }}>即將推出</span>}
              </div>
              <div style={{ fontSize: 13, color: colors.textTertiary, lineHeight: '1.4' }}>{layer.desc}</div>
            </div>
          ))}
        </GroupedList>

        {/* Notifications section */}
        <SectionHeader title="通知" />
        <GroupedList>
          {[
            { label: '🧠 Surface 浮現通知', value: surfaceNotif, toggle: () => setSurfaceNotif(!surfaceNotif) },
            { label: '📥 新卡片整理完成', value: cardNotif, toggle: () => setCardNotif(!cardNotif) },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${colors.separator}` : 'none',
            }}>
              <span style={{ fontSize: 17, color: colors.text }}>{item.label}</span>
              <Toggle value={item.value} onToggle={item.toggle} />
            </div>
          ))}
        </GroupedList>

        {/* Referral - invite friends */}
        <SectionHeader title="邀請好友" />
        <GroupedList>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: '10px' }}>你的推薦碼</div>
            <div
              onClick={copyReferralCode}
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: colors.primary,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '8px 0',
                userSelect: 'none',
              }}
            >
              {quota?.referral_code || '------'}
            </div>
            <div style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center', marginBottom: '12px' }}>
              {copied ? '已複製！' : '點擊推薦碼即可複製'}
            </div>
            <div style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: '16px' }}>
              已成功推薦 <strong>{quota?.total_referrals || 0}</strong> 人，額外獲得 <strong>{(quota?.total_referrals || 0) * 10}</strong> 次 AI 額度
            </div>
            <div
              onClick={copyReferralLink}
              style={{
                background: colors.primary,
                borderRadius: radius.md,
                padding: '12px',
                textAlign: 'center',
                color: 'white',
                fontSize: 15,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              🔗 複製邀請連結
            </div>
          </div>
        </GroupedList>

        {/* Referral - redeem code (only if not yet used) */}
        {quota && !quota.referred_by && (
          <>
            <SectionHeader title="輸入邀請碼" />
            <GroupedList>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: '10px' }}>
                  輸入好友的推薦碼，雙方各獲得額外 AI 額度
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={referralInput}
                    onChange={e => setReferralInput(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="例：BW3X9K"
                    maxLength={6}
                    style={{
                      flex: 1,
                      background: 'rgba(118,118,128,0.08)',
                      border: 'none',
                      borderRadius: radius.md,
                      padding: '12px 14px',
                      fontSize: 17,
                      fontWeight: '600',
                      letterSpacing: '0.1em',
                      color: colors.text,
                      outline: 'none',
                      fontFamily: typography.fontFamily,
                    }}
                  />
                  <div
                    onClick={handleRedeemReferral}
                    style={{
                      background: referralLoading ? 'rgba(0,122,255,0.5)' : colors.primary,
                      borderRadius: radius.md,
                      padding: '12px 18px',
                      color: 'white',
                      fontSize: 15,
                      fontWeight: '600',
                      cursor: referralLoading ? 'default' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {referralLoading ? '...' : '兌換'}
                  </div>
                </div>
                {referralMessage && (
                  <div style={{ marginTop: '10px', fontSize: 13, color: colors.success, padding: '10px 12px', background: 'rgba(52,199,89,0.08)', borderRadius: radius.sm }}>
                    {referralMessage}
                  </div>
                )}
                {referralError && (
                  <div style={{ marginTop: '10px', fontSize: 13, color: colors.danger, padding: '10px 12px', background: 'rgba(255,59,48,0.08)', borderRadius: radius.sm }}>
                    {referralError}
                  </div>
                )}
              </div>
            </GroupedList>
          </>
        )}

        {/* Account section */}
        <SectionHeader title="帳號" />
        {user && (
          <div style={{ fontSize: 13, color: colors.textTertiary, padding: '0 4px 6px', paddingLeft: '4px' }}>
            {user.email}
          </div>
        )}
        <GroupedList>
          <ListRow label="👤 帳號" value="Pro 方案" onClick={() => {}} />
          <ListRow label="📤 匯出所有資料" onClick={() => {}} last={false} />
          <ListRow
            label="登出"
            danger
            chevron={false}
            onClick={() => supabase.auth.signOut()}
            last
          />
        </GroupedList>
      </div>
    </div>
  )
}
