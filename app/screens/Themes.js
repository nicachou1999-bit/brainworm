'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const COLORS = ['#7C6AF7', '#4ECDC4', '#FF6B6B', '#FFD93D', '#4ADE80', '#F97316']
const EMOJIS = ['🎨', '⚡', '🚀', '🧠', '🛠️', '✍️', '📚', '💡', '🌍', '🎯']

export default function Themes({ onThemeClick }) {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎨')
  const [color, setColor] = useState('#7C6AF7')
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
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>主題牆</div>
          <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>
            {loading ? '載入中...' : `${themes.length} 個主題`}
          </div>
        </div>
      </div>

      {showAdd && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '16px', padding: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9B9AAF', marginBottom: '10px' }}>新主題</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="主題名稱"
              style={{
                width: '100%', background: '#242430', border: '1px solid #2A2A36',
                borderRadius: '10px', padding: '8px 12px', fontSize: '13px',
                color: '#F0EFF8', outline: 'none', fontFamily: 'system-ui',
                boxSizing: 'border-box', marginBottom: '10px'
              }}
            />
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: '#5C5B70', marginBottom: '6px' }}>選 Emoji</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <div key={e} onClick={() => setEmoji(e)} style={{
                    width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                    background: emoji === e ? 'rgba(124,106,247,0.2)' : '#242430',
                    border: emoji === e ? '1px solid #7C6AF7' : '1px solid transparent'
                  }}>{e}</div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#5C5B70', marginBottom: '6px' }}>顏色</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setColor(c)} style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer',
                    border: color === c ? '2px solid white' : '2px solid transparent'
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAdd(false)} style={{
                flex: 1, background: '#242430', border: 'none', borderRadius: '10px',
                padding: '9px', fontSize: '13px', color: '#9B9AAF', cursor: 'pointer'
              }}>取消</button>
              <button onClick={addTheme} disabled={adding} style={{
                flex: 2, background: '#7C6AF7', border: 'none', borderRadius: '10px',
                padding: '9px', fontSize: '13px', fontWeight: '700', color: 'white',
                cursor: adding ? 'default' : 'pointer', opacity: adding ? 0.7 : 1
              }}>{adding ? '...' : '建立'}</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '8px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {themes.map(theme => (
          <div key={theme.id} onClick={onThemeClick} style={{
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '14px', padding: '14px 12px',
            cursor: 'pointer', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: theme.color, borderRadius: '14px 14px 0 0'
            }}></div>
            <div style={{ fontSize: '22px', marginBottom: '8px', marginTop: '4px' }}>{theme.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#F0EFF8', marginBottom: '4px', lineHeight: '1.3' }}>{theme.name}</div>
          </div>
        ))}

        <div onClick={() => setShowAdd(true)} style={{
          background: 'transparent', border: '1px dashed #2A2A36',
          borderRadius: '14px', padding: '14px 12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: '4px', minHeight: '100px'
        }}>
          <div style={{ fontSize: '20px', color: '#5C5B70' }}>＋</div>
          <div style={{ fontSize: '12px', color: '#5C5B70' }}>建立新主題</div>
        </div>
      </div>
    </div>
  )
}
