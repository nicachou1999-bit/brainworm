'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

const COLORS = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5AC8FA']
const EMOJIS = ['🎨', '⚡', '🚀', '🧠', '🛠️', '✍️', '📚', '💡', '🌍', '🎯']

export default function Themes({ onThemeClick }) {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎨')
  const [color, setColor] = useState('#007AFF')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchThemes()
  }, [])

  async function fetchThemes() {
    setLoading(true)
    const { data } = await supabase
      .from('themes')
      .select('*')
      .order('created_at', { ascending: false })
    setThemes(data || [])
    setLoading(false)
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
      setShowAdd(false)
      fetchThemes()
    }
    setAdding(false)
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

      {/* Grid */}
      <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {themes.map(theme => (
          <div key={theme.id} onClick={onThemeClick} style={{
            background: colors.card,
            borderRadius: radius.lg,
            padding: '16px 14px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: shadow.sm,
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: theme.color, borderRadius: `${radius.lg}px ${radius.lg}px 0 0`,
            }}></div>
            <div style={{ fontSize: 26, marginBottom: '10px', marginTop: '6px' }}>{theme.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: '600', color: colors.text, lineHeight: '1.3' }}>{theme.name}</div>
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
    </div>
  )
}
