'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

const COLORS = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5AC8FA']
const EMOJIS = ['🎨', '⚡', '🚀', '🧠', '🛠️', '✍️', '📚', '💡', '🌍', '🎯']

export default function Themes({ onThemeClick }) {
  const [themes, setThemes] = useState([])
  const [cardCounts, setCardCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎨')
  const [color, setColor] = useState('#007AFF')
  const [adding, setAdding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const longPressTimers = useRef({})

  useEffect(() => {
    fetchThemes()
  }, [])

  async function fetchThemes() {
    setLoading(true)
    const { data } = await supabase
      .from('themes')
      .select('*')
      .order('created_at', { ascending: false })
    const list = data || []
    setThemes(list)
    setLoading(false)
    if (list.length > 0) fetchCardCounts(list.map(t => t.id))
  }

  async function fetchCardCounts(ids) {
    const { data } = await supabase
      .from('cards')
      .select('theme_id')
      .in('theme_id', ids)
    if (!data) return
    const counts = {}
    for (const row of data) {
      counts[row.theme_id] = (counts[row.theme_id] || 0) + 1
    }
    setCardCounts(counts)
  }

  async function addTheme() {
    if (!name.trim()) return
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('themes').insert({
      user_id: user.id,
      emoji,
      name: name.trim(),
      color
    })
    if (!error) {
      setName('')
      setEmoji('🎨')
      setColor('#007AFF')
      setShowAdd(false)
      fetchThemes()
    }
    setAdding(false)
  }

  async function deleteTheme(id) {
    await supabase.from('themes').delete().eq('id', id)
    setDeleteTarget(null)
    setThemes(prev => prev.filter(t => t.id !== id))
  }

  function startLongPress(id) {
    longPressTimers.current[id] = setTimeout(() => {
      setDeleteTarget(id)
    }, 600)
  }

  function cancelLongPress(id) {
    clearTimeout(longPressTimers.current[id])
  }

  return (
    <div style={{ paddingBottom: '90px', fontFamily: typography.fontFamily }}>
      {/* Large title header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '56px 16px 8px',
      }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: '700', color: colors.text, letterSpacing: 0.37 }}>主題</div>
          <div style={{ fontSize: 13, color: colors.textTertiary, marginTop: '2px' }}>
            {loading ? '載入中...' : `${themes.length} 個主題`}
          </div>
        </div>
      </div>

      {/* Add theme form */}
      {showAdd && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            background: colors.card,
            borderRadius: radius.lg,
            padding: '16px',
            boxShadow: shadow.sm,
          }}>
            <div style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: '12px' }}>新主題</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="主題名稱"
              style={{
                width: '100%',
                background: 'rgba(118,118,128,0.08)',
                border: 'none',
                borderRadius: radius.sm,
                padding: '12px 14px',
                fontSize: 15,
                color: colors.text,
                outline: 'none',
                fontFamily: typography.fontFamily,
                boxSizing: 'border-box',
                marginBottom: '12px',
              }}
            />
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: 12, color: colors.textTertiary, marginBottom: '8px' }}>選 Emoji</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <div key={e} onClick={() => setEmoji(e)} style={{
                    width: '36px', height: '36px', borderRadius: radius.sm, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    background: emoji === e ? 'rgba(0,122,255,0.12)' : 'rgba(118,118,128,0.08)',
                    border: emoji === e ? `1.5px solid ${colors.primary}` : '1.5px solid transparent',
                  }}>{e}</div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: 12, color: colors.textTertiary, marginBottom: '8px' }}>顏色</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setColor(c)} style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: c, cursor: 'pointer',
                    border: color === c ? `3px solid ${colors.text}` : '3px solid transparent',
                    boxSizing: 'border-box',
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAdd(false)} style={{
                flex: 1,
                background: 'rgba(118,118,128,0.12)',
                border: 'none',
                borderRadius: radius.sm,
                padding: '12px',
                fontSize: 15,
                fontWeight: '500',
                color: colors.textSecondary,
                cursor: 'pointer',
                fontFamily: typography.fontFamily,
              }}>取消</button>
              <button onClick={addTheme} disabled={adding} style={{
                flex: 2,
                background: colors.primary,
                border: 'none',
                borderRadius: radius.sm,
                padding: '12px',
                fontSize: 15,
                fontWeight: '600',
                color: 'white',
                cursor: adding ? 'default' : 'pointer',
                opacity: adding ? 0.7 : 1,
                fontFamily: typography.fontFamily,
              }}>{adding ? '...' : '建立'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && themes.length === 0 && !showAdd && (
        <div style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: '12px' }}>🎨</div>
          <div style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: '6px' }}>還沒有主題</div>
          <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: '24px' }}>建立主題來整理你的卡片</div>
          <button onClick={() => setShowAdd(true)} style={{
            background: colors.primary, border: 'none',
            borderRadius: radius.sm, padding: '12px 28px',
            fontSize: 15, fontWeight: '600', color: 'white', cursor: 'pointer',
            fontFamily: typography.fontFamily,
          }}>建立第一個主題</button>
        </div>
      )}

      {/* Grid */}
      {themes.length > 0 && (
        <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {themes.map(theme => (
            <div
              key={theme.id}
              onClick={() => onThemeClick(theme)}
              onMouseDown={() => startLongPress(theme.id)}
              onMouseUp={() => cancelLongPress(theme.id)}
              onMouseLeave={() => cancelLongPress(theme.id)}
              onTouchStart={() => startLongPress(theme.id)}
              onTouchEnd={() => cancelLongPress(theme.id)}
              style={{
                background: colors.card,
                borderRadius: radius.lg,
                padding: '16px 14px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: shadow.sm,
                userSelect: 'none',
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                background: theme.color, borderRadius: `${radius.lg}px ${radius.lg}px 0 0`,
              }}></div>
              <div style={{ fontSize: 26, marginBottom: '6px', marginTop: '6px' }}>{theme.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: '600', color: colors.text, lineHeight: '1.3' }}>{theme.name}</div>
              <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: '4px' }}>
                {cardCounts[theme.id] || 0} 張卡片
              </div>
            </div>
          ))}

          <div onClick={() => setShowAdd(true)} style={{
            background: colors.card,
            border: `1.5px dashed ${colors.separator}`,
            borderRadius: radius.lg,
            padding: '16px 14px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            minHeight: '110px',
          }}>
            <div style={{ fontSize: 24, color: colors.primary }}>＋</div>
            <div style={{ fontSize: 13, color: colors.primary, fontWeight: '500' }}>建立新主題</div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }} onClick={() => setDeleteTarget(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1C1C22', borderRadius: '20px',
            padding: '24px 20px', width: '100%', maxWidth: '320px', boxSizing: 'border-box',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: '12px' }}>🗑️</div>
            <div style={{ fontSize: 17, fontWeight: '700', color: '#F0EFF8', marginBottom: '8px' }}>刪除主題？</div>
            <div style={{ fontSize: 13, color: '#9B9AAF', marginBottom: '24px' }}>
              {themes.find(t => t.id === deleteTarget)?.name} 將被刪除，此動作無法復原。
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteTarget(null)} style={{
                flex: 1, padding: '12px', background: 'rgba(118,118,128,0.12)',
                border: 'none', borderRadius: '12px', fontSize: 15, fontWeight: '500',
                color: '#9B9AAF', cursor: 'pointer',
              }}>取消</button>
              <button onClick={() => deleteTheme(deleteTarget)} style={{
                flex: 1, padding: '12px', background: '#FF3B30',
                border: 'none', borderRadius: '12px', fontSize: 15, fontWeight: '600',
                color: 'white', cursor: 'pointer',
              }}>刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
