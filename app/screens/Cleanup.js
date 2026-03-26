'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'
import { useTheme } from '../context/ThemeContext'

const REASON_STYLE = {
  orphan: { bg: 'rgba(255,149,0,0.15)', color: '#FF9500' },
  dusty:  { bg: 'rgba(0,122,255,0.12)', color: '#007AFF' },
  stub:   { bg: 'rgba(255,59,48,0.12)', color: '#FF3B30' },
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function Cleanup({ onClose }) {
  const { isDark } = useTheme()
  const text = isDark ? '#FFFFFF' : colors.text
  const subtext = isDark ? '#8E8E93' : colors.textTertiary
  const bg = isDark ? '#000000' : colors.background
  const cardBg = isDark ? '#1C1C1E' : colors.card

  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [themes, setThemes] = useState([])
  const [themeModal, setThemeModal] = useState(null) // card id
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/cleanup-suggestions', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const json = await res.json()
        setSuggestions(json.suggestions || [])
      } catch {}
      setLoading(false)
    }
    load()

    supabase
      .from('themes')
      .select('id, name, emoji')
      .then(({ data }) => { if (data) setThemes(data) })
  }, [])

  async function handleDelete(id) {
    if (!confirm('確定刪除這張卡片？無法復原')) return
    setRemovingId(id)
    await supabase.from('cards').delete().eq('id', id)
    setTimeout(() => {
      setSuggestions(prev => prev.filter(c => c.id !== id))
      setRemovingId(null)
    }, 300)
  }

  async function handleAssignTheme(cardId, themeId) {
    await supabase.from('cards').update({ theme_id: themeId }).eq('id', cardId)
    setSuggestions(prev => prev.filter(c => c.id !== cardId))
    setThemeModal(null)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: bg,
      fontFamily: typography.fontFamily,
      overflowY: 'auto',
      transition: 'background 0.3s',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '56px 16px 12px',
        gap: '12px',
        background: bg,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        transition: 'background 0.3s',
      }}>
        <div
          onClick={onClose}
          style={{
            fontSize: 17,
            color: colors.primary,
            cursor: 'pointer',
            padding: '4px 0',
            whiteSpace: 'nowrap',
          }}
        >
          ‹ 返回
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: text }}>
          智慧清理
        </div>
        <div style={{ width: '48px' }} />
      </div>

      <div style={{ padding: '0 16px 90px' }}>
        <div style={{ fontSize: 13, color: subtext, marginBottom: '16px', transition: 'color 0.3s' }}>
          以下卡片可能需要整理或刪除
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: subtext, fontSize: 15 }}>
            載入中...
          </div>
        )}

        {!loading && suggestions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <div style={{ fontSize: 48, marginBottom: '16px' }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: '600', color: text, marginBottom: '8px' }}>
              目前沒有需要清理的卡片
            </div>
            <div style={{ fontSize: 15, color: subtext }}>
              你的知識庫整理得很好，繼續保持！
            </div>
          </div>
        )}

        {!loading && suggestions.map(card => {
          const rs = REASON_STYLE[card.reasonType] || REASON_STYLE.stub
          const removing = removingId === card.id
          return (
            <div
              key={card.id}
              style={{
                background: cardBg,
                borderRadius: radius.lg,
                padding: '14px 16px',
                marginBottom: '12px',
                boxShadow: shadow.sm,
                opacity: removing ? 0 : 1,
                transform: removing ? 'translateX(40px)' : 'translateX(0)',
                transition: 'opacity 0.3s, transform 0.3s, background 0.3s',
              }}
            >
              {/* Content */}
              <div style={{
                fontSize: 15,
                color: text,
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: card.summary ? '6px' : '8px',
                transition: 'color 0.3s',
              }}>
                {card.content || '（無內容）'}
              </div>

              {card.summary && (
                <div style={{
                  fontSize: 13,
                  color: subtext,
                  marginBottom: '8px',
                  lineHeight: '1.4',
                  transition: 'color 0.3s',
                }}>
                  {card.summary}
                </div>
              )}

              {/* Reason badge + date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: rs.color,
                  background: rs.bg,
                  borderRadius: '20px',
                  padding: '2px 10px',
                }}>
                  {card.reason}
                </span>
                <span style={{ fontSize: 12, color: subtext }}>
                  {formatDate(card.created_at)}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div
                  onClick={() => setThemeModal(card.id)}
                  style={{
                    fontSize: 15,
                    color: colors.primary,
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  歸入主題 →
                </div>
                <div
                  onClick={() => handleDelete(card.id)}
                  style={{
                    fontSize: 15,
                    color: colors.danger,
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  刪除 🗑
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Theme picker modal */}
      {themeModal && (
        <div
          onClick={() => setThemeModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '390px',
              margin: '0 auto',
              background: isDark ? '#2C2C2E' : colors.card,
              borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
              padding: '20px 16px 40px',
              maxHeight: '60vh',
              overflowY: 'auto',
              transition: 'background 0.3s',
            }}
          >
            <div style={{ fontSize: 17, fontWeight: '600', color: text, marginBottom: '16px', textAlign: 'center' }}>
              選擇主題
            </div>
            {themes.length === 0 && (
              <div style={{ textAlign: 'center', color: subtext, fontSize: 15, padding: '16px 0' }}>
                尚未建立任何主題
              </div>
            )}
            {themes.map((theme, i) => (
              <div
                key={theme.id}
                onClick={() => handleAssignTheme(themeModal, theme.id)}
                style={{
                  padding: '14px 12px',
                  fontSize: 17,
                  color: text,
                  cursor: 'pointer',
                  borderBottom: i < themes.length - 1
                    ? `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.separator}`
                    : 'none',
                  transition: 'color 0.3s',
                }}
              >
                {theme.emoji} {theme.name}
              </div>
            ))}
            <div
              onClick={() => setThemeModal(null)}
              style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: 17,
                color: colors.danger,
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              取消
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
