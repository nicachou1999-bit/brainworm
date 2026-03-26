'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

export default function Inbox({ user }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const fileInputRef = useRef(null)
  const [classifySuggestion, setClassifySuggestion] = useState(null)
  // classifySuggestion: { cardId, themeId, themeName } | null
  const dismissTimerRef = useRef(null)

  useEffect(() => {
    fetchCards()
  }, [])

  async function fetchCards() {
    setLoading(true)
    const { data } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })
    setCards(data || [])
    setLoading(false)
  }

  async function addCard() {
    if (!url.trim()) return
    setAdding(true)

    const { data: inserted, error } = await supabase
      .from('cards')
      .insert({
        user_id: user.id,
        type: '🔗',
        type_label: '網址',
        title: url,
        summary: '正在處理中...',
        url: url.trim(),
        tag: '未分類',
        status: 'processing'
      })
      .select()
      .single()

    if (!error && inserted) {
      setUrl('')
      setShowAdd(false)
      fetchCards()
      // Run auto-classify in background (non-blocking)
      runAutoClassify(inserted)
    } else if (!error) {
      // Fallback if .single() isn't available
      setUrl('')
      setShowAdd(false)
      fetchCards()
    }
    setAdding(false)
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // 立即顯示「分析中...」暫時卡片
    const tempId = 'temp-' + Date.now()
    setCards(prev => [{
      id: tempId,
      type: '📷',
      type_label: '圖片',
      title: '分析中...',
      summary: '',
      status: 'analyzing',
      created_at: new Date().toISOString()
    }, ...prev])

    try {
      // 上傳圖片到 Supabase Storage
      const timestamp = Date.now()
      const path = `${user.id}/${timestamp}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('card-images')
        .upload(path, file)

      let imageUrl = null
      if (!uploadError) {
        const { data: signedData } = await supabase.storage
          .from('card-images')
          .createSignedUrl(path, 315360000) // 約 10 年
        imageUrl = signedData?.signedUrl
      }

      // 呼叫 AI 分析 API
      const { data: { session } } = await supabase.auth.getSession()
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData
      })
      const analyzed = await res.json()

      // 插入卡片到資料庫
      const { error: insertError } = await supabase.from('cards').insert({
        user_id: user.id,
        type: '📷',
        type_label: '圖片',
        title: analyzed.title || '圖片卡片',
        summary: analyzed.summary || '',
        tag: analyzed.primary_tags?.[0] || analyzed.category || '',
        status: 'done',
        image_url: imageUrl
      })

      if (!insertError) {
        setCards(prev => prev.filter(c => c.id !== tempId))
        fetchCards()
      }
    } catch (err) {
      console.error('圖片分析失敗:', err)
      setCards(prev => prev.filter(c => c.id !== tempId))
    }

    e.target.value = ''
  }

  async function runAutoClassify(card) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/auto-classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          cardId: card.id,
          cardTitle: card.title,
          cardSummary: card.summary || '',
          primaryTags: card.tag ? [card.tag] : []
        })
      })

      if (!res.ok) return
      const data = await res.json()

      if (data.suggested) {
        setClassifySuggestion({ cardId: card.id, ...data.suggested })
        // Auto-dismiss after 3 seconds
        if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
        dismissTimerRef.current = setTimeout(() => {
          setClassifySuggestion(prev =>
            prev?.cardId === card.id ? null : prev
          )
        }, 3000)
      }
    } catch {
      // Non-blocking — ignore errors
    }
  }

  async function assignToTheme(cardId, themeId) {
    await supabase
      .from('cards')
      .update({ theme_id: themeId })
      .eq('id', cardId)
    setClassifySuggestion(null)
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
  }

  function dismissSuggestion() {
    setClassifySuggestion(null)
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} 分鐘前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} 小時前`
    return `${Math.floor(hours / 24)} 天前`
  }

  return (
    <div style={{ paddingBottom: '90px', fontFamily: typography.fontFamily }}>
      <style>{`
        @keyframes slideUpIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .classify-toast {
          animation: slideUpIn 0.25s ease-out forwards;
        }
      `}</style>

      {/* Large title header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '56px 16px 8px',
      }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: '700', color: colors.text, letterSpacing: 0.37 }}>Inbox</div>
          <div style={{ fontSize: 13, color: colors.textTertiary, marginTop: '2px' }}>
            {loading ? '載入中...' : `${cards.length} 張卡片`}
          </div>
        </div>
      </div>

      {/* Add URL panel */}
      {showAdd && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            background: colors.card,
            borderRadius: radius.lg,
            padding: '16px',
            boxShadow: shadow.sm,
          }}>
            <div style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: '10px' }}>
              貼入網址
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCard()}
                placeholder="https://..."
                style={{
                  flex: 1,
                  background: 'rgba(118,118,128,0.08)',
                  border: 'none',
                  borderRadius: radius.sm,
                  padding: '10px 12px',
                  fontSize: 15,
                  color: colors.text,
                  outline: 'none',
                  fontFamily: typography.fontFamily,
                }}
              />
              <button onClick={addCard} disabled={adding} style={{
                background: colors.primary,
                border: 'none',
                borderRadius: radius.sm,
                padding: '10px 16px',
                fontSize: 15,
                fontWeight: '600',
                color: 'white',
                cursor: adding ? 'default' : 'pointer',
                opacity: adding ? 0.7 : 1,
                fontFamily: typography.fontFamily,
              }}>
                {adding ? '...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '0 16px' }}>
        {/* Smart suggestion banner */}
        {!dismissed && cards.length >= 5 && (
          <div style={{
            background: colors.card,
            border: `1px solid rgba(0,122,255,0.2)`,
            borderRadius: radius.lg,
            padding: '14px',
            marginBottom: '16px',
            boxShadow: shadow.sm,
          }}>
            <div style={{ fontSize: 11, fontWeight: '700', color: colors.primary, marginBottom: '6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              🧠 發現新模式
            </div>
            <div style={{ fontSize: 13, color: colors.text, marginBottom: '10px', lineHeight: '1.5' }}>
              你已經累積了 <strong>{cards.length} 張卡片</strong>，要整理一下嗎？
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDismissed(true)} style={{
                padding: '6px 14px', borderRadius: radius.sm, border: 'none',
                background: 'rgba(118,118,128,0.12)', color: colors.textSecondary, fontSize: 13,
                fontWeight: '500', cursor: 'pointer', fontFamily: typography.fontFamily,
              }}>稍後</button>
              <button onClick={() => setDismissed(true)} style={{
                padding: '6px 14px', borderRadius: radius.sm, border: 'none',
                background: 'rgba(118,118,128,0.12)', color: colors.textSecondary, fontSize: 13,
                fontWeight: '500', cursor: 'pointer', fontFamily: typography.fontFamily,
              }}>忽略</button>
            </div>
          </div>
        )}

        {cards.length > 0 && (
          <div style={{
            fontSize: 13,
            fontWeight: '600',
            letterSpacing: '-0.08px',
            color: colors.textTertiary,
            marginBottom: '8px',
            paddingLeft: '4px',
          }}>最近新增</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: colors.textTertiary, fontSize: 15 }}>
            載入中...
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: colors.textTertiary, fontSize: 15, lineHeight: '2',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📥</div>
            還沒有卡片<br />點右下角 ＋ 新增第一張
          </div>
        )}

        {cards.map(card => (
          <div key={card.id} style={{
            background: colors.card,
            borderRadius: radius.lg,
            padding: '14px 16px',
            marginBottom: '10px',
            cursor: 'pointer',
            boxShadow: shadow.sm,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: 16 }}>{card.type}</span>
              <span style={{ fontSize: 11, fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.textTertiary, flex: 1 }}>{card.type_label}</span>
              <span style={{ fontSize: 12, color: colors.textTertiary }}>{timeAgo(card.created_at)}</span>
            </div>
            {(card.status === 'processing' || card.status === 'analyzing') && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: '3px', background: 'rgba(0,122,255,0.15)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', width: '60%', background: colors.primary, borderRadius: '2px' }}></div>
                </div>
                <div style={{ fontSize: 12, color: colors.textTertiary }}>
                  {card.status === 'analyzing' ? 'AI 分析中...' : '處理中...'}
                </div>
              </div>
            )}
            {/* 卡片內容區：有圖片時左側顯示縮圖 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              {card.image_url && (
                <img
                  src={card.image_url}
                  alt=""
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: '6px', lineHeight: '1.4' }}>{card.title}</div>
                {card.summary && card.summary !== '正在處理中...' && (
                  <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: '1.5', marginBottom: '10px' }}>{card.summary}</div>
                )}
              </div>
            </div>
            {card.tag && (
              <div style={{ display: 'flex', gap: '6px', marginTop: card.image_url ? '8px' : '0' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: '500',
                  background: 'rgba(52,199,89,0.1)', color: colors.success,
                }}>✓ {card.tag}</span>
              </div>
            )}

            {/* Auto-classify suggestion toast */}
            {classifySuggestion?.cardId === card.id && (
              <div
                className="classify-toast"
                style={{
                  marginTop: '10px',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: 13, color: '#1C1C1E', flex: 1, lineHeight: '1.4' }}>
                  💡 建議歸入《{classifySuggestion.themeName}》
                </span>
                <button
                  onClick={e => { e.stopPropagation(); assignToTheme(card.id, classifySuggestion.themeId) }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#007AFF',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    fontFamily: typography.fontFamily,
                  }}
                >加入</button>
                <button
                  onClick={e => { e.stopPropagation(); dismissSuggestion() }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 16,
                    color: '#8E8E93',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    lineHeight: 1,
                    fontFamily: typography.fontFamily,
                  }}
                >✕</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 隱藏的圖片 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />

      {/* FAB 區域：📷 相機 + ＋ 文字 */}
      {/* 相機 FAB（右側，深灰色） */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: 'calc(50% - 195px + 16px)',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#636366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          color: 'white',
          lineHeight: 1,
        }}
      >📷</div>

      {/* ＋ FAB（相機左側，藍色） */}
      <div
        onClick={() => setShowAdd(!showAdd)}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: 'calc(50% - 195px + 16px + 64px)',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,122,255,0.4)',
          color: 'white',
          fontWeight: '300',
          lineHeight: 1,
        }}
      >＋</div>
    </div>
  )
}
