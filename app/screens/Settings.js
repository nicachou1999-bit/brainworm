'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'
import { useTheme } from '../context/ThemeContext'

function SectionHeader({ title, isDark }) {
  return (
    <div style={{
      fontSize: 13,
      fontWeight: '400',
      color: isDark ? '#8E8E93' : colors.textTertiary,
      margin: '24px 0 6px',
      paddingLeft: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      transition: 'color 0.3s',
    }}>{title}</div>
  )
}

function GroupedList({ children, isDark }) {
  return (
    <div style={{
      background: isDark ? '#1C1C1E' : colors.card,
      borderRadius: radius.lg,
      overflow: 'hidden',
      boxShadow: shadow.sm,
      transition: 'background 0.3s',
    }}>
      {children}
    </div>
  )
}

function ListRow({ label, value, chevron = true, onClick, danger = false, last = false, right, isDark }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: last ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.separator}`,
        background: 'transparent',
      }}
    >
      <span style={{ fontSize: 17, color: danger ? colors.danger : (isDark ? '#FFFFFF' : colors.text), transition: 'color 0.3s' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {right}
        {value && <span style={{ fontSize: 15, color: isDark ? '#8E8E93' : colors.textTertiary, transition: 'color 0.3s' }}>{value}</span>}
        {chevron && !right && <span style={{ fontSize: 15, color: isDark ? '#8E8E93' : colors.textTertiary }}>›</span>}
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
  const { isDark, toggleDark } = useTheme()
  const text = isDark ? '#FFFFFF' : colors.text
  const subtext = isDark ? '#8E8E93' : colors.textTertiary
  const rowBg = isDark ? '#1C1C1E' : colors.card

  const [lang, setLang] = useState('繁體中文')
  const [aiLayer, setAiLayer] = useState('cloud')
  const [surfaceNotif, setSurfaceNotif] = useState(true)
  const [cardNotif, setCardNotif] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  const langs = ['繁體中文', 'English', 'Español']
  const [showLangs, setShowLangs] = useState(false)

  // Weekly report state
  const [reportExpanded, setReportExpanded] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [reportError, setReportError] = useState('')

  async function fetchWeeklyReport() {
    if (reportLoading) return
    setReportLoading(true)
    setReportError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/weekly-report', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '載入失敗')
      setReportData(json)
    } catch {
      setReportError('無法載入週報，請稍後再試')
    }
    setReportLoading(false)
  }

  function handleToggleReport() {
    if (!reportExpanded && !reportData) fetchWeeklyReport()
    setReportExpanded(v => !v)
  }

  // Export state
  const [exportLoadingJson, setExportLoadingJson] = useState(false)
  const [exportLoadingCsv, setExportLoadingCsv] = useState(false)
  const [exportToast, setExportToast] = useState('')

  async function handleExport(format) {
    const setLoading = format === 'json' ? setExportLoadingJson : setExportLoadingCsv
    if (format === 'json' ? exportLoadingJson : exportLoadingCsv) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/export-data?format=${format}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error('export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().slice(0, 10)
      a.download = `brainworm-export-${dateStr}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setExportToast('匯出失敗，請稍後再試')
      setTimeout(() => setExportToast(''), 3000)
    }
    setLoading(false)
  }

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
        setReferralMessage(`🎉 已兌換！${json.message || '獲得 +10 次 AI 額度'}`)
        setQuota(q => ({ ...q, referred_by: 'done', bonus_ai_credits: (q?.bonus_ai_credits || 0) + 10 }))
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
    <div style={{ paddingBottom: '90px', fontFamily: typography.fontFamily, transition: 'color 0.3s, background 0.3s' }}>
      {/* Large title header */}
      <div style={{ padding: '56px 16px 0' }}>
        <div style={{ fontSize: 34, fontWeight: '700', color: text, letterSpacing: 0.37, transition: 'color 0.3s' }}>設定</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Appearance section */}
        <SectionHeader title="外觀" isDark={isDark} />
        <GroupedList isDark={isDark}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px',
          }}>
            <span style={{ fontSize: 17, color: text, transition: 'color 0.3s' }}>🌙 深色模式</span>
            <Toggle value={isDark} onToggle={toggleDark} />
          </div>
        </GroupedList>

        {/* Language section */}
        <SectionHeader title="語言" isDark={isDark} />
        <div style={{ position: 'relative' }}>
          <GroupedList isDark={isDark}>
            <ListRow
              label="🌐 顯示語言"
              value={lang}
              onClick={() => setShowLangs(!showLangs)}
              last
              isDark={isDark}
            />
          </GroupedList>
          {showLangs && (
            <div style={{
              position: 'absolute',
              top: '52px',
              left: 0,
              right: 0,
              background: rowBg,
              borderRadius: radius.lg,
              zIndex: 50,
              overflow: 'hidden',
              boxShadow: shadow.lg,
              transition: 'background 0.3s',
            }}>
              {langs.map((l, i) => (
                <div
                  key={l}
                  onClick={() => { setLang(l); setShowLangs(false) }}
                  style={{
                    padding: '12px 16px',
                    fontSize: 17,
                    cursor: 'pointer',
                    color: lang === l ? colors.primary : text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: i < langs.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.separator}` : 'none',
                    background: 'transparent',
                    transition: 'color 0.3s',
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
        <SectionHeader title="AI 層" isDark={isDark} />
        <GroupedList isDark={isDark}>
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
                borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.separator}` : 'none',
                background: aiLayer === layer.id ? 'rgba(0,122,255,0.04)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: 17, color: text, transition: 'color 0.3s' }}>{layer.icon} {layer.name}</span>
                {aiLayer === layer.id && <span style={{ color: colors.primary, fontSize: 17 }}>✓</span>}
                {layer.soon && <span style={{ fontSize: 12, color: subtext, fontWeight: '500', transition: 'color 0.3s' }}>即將推出</span>}
              </div>
              <div style={{ fontSize: 13, color: subtext, lineHeight: '1.4', transition: 'color 0.3s' }}>{layer.desc}</div>
            </div>
          ))}
        </GroupedList>

        {/* Notifications section */}
        <SectionHeader title="通知" isDark={isDark} />
        <GroupedList isDark={isDark}>
          {[
            { label: '🧠 Surface 浮現通知', value: surfaceNotif, toggle: () => setSurfaceNotif(!surfaceNotif) },
            { label: '📥 新卡片整理完成', value: cardNotif, toggle: () => setCardNotif(!cardNotif) },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.separator}` : 'none',
            }}>
              <span style={{ fontSize: 17, color: text, transition: 'color 0.3s' }}>{item.label}</span>
              <Toggle value={item.value} onToggle={item.toggle} />
            </div>
          ))}
        </GroupedList>

        {/* Install App section */}
        <SectionHeader title="安裝 App" isDark={isDark} />
        <GroupedList isDark={isDark}>
          <div style={{ padding: '14px 16px' }}>
            {isInstalled ? (
              <div style={{ fontSize: 15, color: isDark ? '#FFFFFF' : colors.text, transition: 'color 0.3s' }}>
                ✅ 已安裝為 App
              </div>
            ) : (
              <>
                <div style={{ fontSize: 15, color: isDark ? '#FFFFFF' : colors.text, marginBottom: '6px', transition: 'color 0.3s' }}>
                  📱 加入主畫面，像 App 一樣使用
                </div>
                <div style={{ fontSize: 13, color: subtext, transition: 'color 0.3s' }}>
                  在瀏覽器選單點「加入主畫面」
                </div>
              </>
            )}
          </div>
        </GroupedList>

        {/* Weekly report section */}
        <SectionHeader title="📊 本週週報" />
        <GroupedList>
          <div style={{ padding: '16px' }}>
            {reportData && !reportData.empty && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}>{reportData.cardCount}</div>
                  <div style={{ fontSize: 12, color: colors.textTertiary, marginTop: '2px' }}>本週卡片</div>
                </div>
                <div style={{ width: '1px', background: colors.separator }} />
                <div style={{ flex: 2, display: 'flex', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: colors.textTertiary, marginBottom: '2px' }}>最活躍主題</div>
                    <div style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{reportData.topTheme}</div>
                  </div>
                </div>
              </div>
            )}
            {reportData && reportData.empty && !reportLoading && (
              <div style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', padding: '8px 0' }}>
                本週還沒有卡片，快去收集知識吧！
              </div>
            )}
            <div
              onClick={handleToggleReport}
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
              {reportExpanded ? '收起週報' : '查看 AI 週報'}
            </div>

            {reportExpanded && (
              <div style={{ marginTop: '16px' }}>
                {reportLoading && (
                  <div style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center', padding: '16px 0' }}>
                    🤔 AI 正在整理本週內容...
                  </div>
                )}
                {reportError && (
                  <div style={{ fontSize: 13, color: colors.danger, padding: '10px 12px', background: 'rgba(255,59,48,0.08)', borderRadius: radius.sm }}>
                    {reportError}
                  </div>
                )}
                {reportData && reportData.report && (
                  <div>
                    <div style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: colors.text,
                      lineHeight: '1.4',
                      marginBottom: '16px',
                      textAlign: 'center',
                    }}>
                      {reportData.report.headline}
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: 12, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                        AI 精選亮點
                      </div>
                      {reportData.report.highlights?.map((h, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          gap: '10px',
                          marginBottom: '8px',
                          alignItems: 'flex-start',
                        }}>
                          <span style={{ fontSize: 14, color: colors.primary, fontWeight: '700', flexShrink: 0 }}>#{i + 1}</span>
                          <span style={{ fontSize: 14, color: colors.text, lineHeight: '1.5' }}>{h}</span>
                        </div>
                      ))}
                    </div>
                    {reportData.report.insight && (
                      <div style={{
                        background: 'rgba(0,122,255,0.06)',
                        borderRadius: radius.md,
                        padding: '12px 14px',
                        marginBottom: '12px',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: '600', color: colors.primary, marginBottom: '4px' }}>AI 洞察</div>
                        <div style={{ fontSize: 14, color: colors.text, lineHeight: '1.5' }}>{reportData.report.insight}</div>
                      </div>
                    )}
                    {reportData.report.encouragement && (
                      <div style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }}>
                        ✨ {reportData.report.encouragement}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </GroupedList>

        {/* Referral - invite friends */}
        <SectionHeader title="邀請好友" isDark={isDark} />
        <GroupedList isDark={isDark}>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: 13, color: subtext, marginBottom: '10px', transition: 'color 0.3s' }}>你的推薦碼</div>
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
            <div style={{ fontSize: 13, color: subtext, textAlign: 'center', marginBottom: '12px', transition: 'color 0.3s' }}>
              {copied ? '已複製！' : '點擊推薦碼即可複製'}
            </div>
            <div style={{ fontSize: 14, color: subtext, textAlign: 'center', marginBottom: '10px', transition: 'color 0.3s' }}>
              你已成功推薦 <strong>{quota?.total_referrals || 0}</strong> 人
            </div>
            {/* Milestone progress indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
              {[
                { count: 1, label: '1人', icon: '🎯' },
                { count: 5, label: '5人', icon: '🔓無限摘要' },
                { count: 10, label: '10人', icon: '🏆永久升級' },
              ].map(({ count, label, icon }) => {
                const reached = (quota?.total_referrals || 0) >= count
                return (
                  <div key={count} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                  }}>
                    <div style={{
                      fontSize: 12,
                      color: reached ? colors.success : subtext,
                      fontWeight: reached ? '600' : '400',
                      transition: 'color 0.3s',
                    }}>{label}</div>
                    <div style={{
                      fontSize: 11,
                      color: reached ? colors.success : subtext,
                      opacity: reached ? 1 : 0.5,
                      transition: 'color 0.3s',
                    }}>{icon}</div>
                  </div>
                )
              })}
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
            <SectionHeader title="輸入邀請碼" isDark={isDark} />
            <GroupedList isDark={isDark}>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: 13, color: subtext, marginBottom: '10px', transition: 'color 0.3s' }}>
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
                      background: isDark ? '#3A3A3C' : 'rgba(118,118,128,0.08)',
                      border: 'none',
                      borderRadius: radius.md,
                      padding: '12px 14px',
                      fontSize: 17,
                      fontWeight: '600',
                      letterSpacing: '0.1em',
                      color: text,
                      outline: 'none',
                      fontFamily: typography.fontFamily,
                      transition: 'background 0.3s, color 0.3s',
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

        {/* My Data section */}
        <SectionHeader title="我的資料" isDark={isDark} />
        <GroupedList isDark={isDark}>
          <ListRow
            label="下載所有資料 (JSON)"
            isDark={isDark}
            onClick={() => handleExport('json')}
            value={exportLoadingJson ? '下載中...' : undefined}
            chevron={!exportLoadingJson}
          />
          <ListRow
            label="下載所有資料 (CSV)"
            isDark={isDark}
            onClick={() => handleExport('csv')}
            value={exportLoadingCsv ? '下載中...' : undefined}
            chevron={!exportLoadingCsv}
            last
          />
        </GroupedList>
        <div style={{ fontSize: 13, color: subtext, padding: '6px 4px 0', paddingLeft: '4px', transition: 'color 0.3s' }}>
          包含所有卡片與主題，隨時帶走
        </div>
        {exportToast ? (
          <div style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.78)',
            color: 'white',
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: '20px',
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}>
            {exportToast}
          </div>
        ) : null}

        {/* Account section */}
        <SectionHeader title="帳號" isDark={isDark} />
        {user && (
          <div style={{ fontSize: 13, color: subtext, padding: '0 4px 6px', paddingLeft: '4px', transition: 'color 0.3s' }}>
            {user.email}
          </div>
        )}
        <GroupedList isDark={isDark}>
          <ListRow label="👤 帳號" value="Pro 方案" onClick={() => {}} isDark={isDark} />
          <ListRow
            label="登出"
            danger
            chevron={false}
            onClick={() => supabase.auth.signOut()}
            last
            isDark={isDark}
          />
        </GroupedList>
      </div>
    </div>
  )
}
