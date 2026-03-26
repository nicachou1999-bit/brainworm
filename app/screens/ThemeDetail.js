'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const TYPE_EMOJI = {
  '🔗': '🔗',
  '📄': '📄',
  '🎙️': '🎙️',
  '📷': '📷',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} 分鐘前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小時前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

export default function ThemeDetail({ themeId, themeName, themeEmoji, onBack }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!themeId) return
    setLoading(true)
    supabase
      .from('cards')
      .select('*')
      .eq('theme_id', themeId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCards(data || [])
        setLoading(false)
      })
  }, [themeId])

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div onClick={onBack} style={{
            fontSize: '18px', cursor: 'pointer', color: '#9B9AAF', padding: '0 4px'
          }}>‹</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800' }}>
              {themeEmoji} {themeName || '主題'}
            </div>
            <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>
              {loading ? '載入中...' : `${cards.length} 張卡片`}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {!themeId && (
          <div style={{ textAlign: 'center', color: '#9B9AAF', marginTop: '40px', fontSize: '14px' }}>
            請先選擇主題
          </div>
        )}

        {themeId && !loading && cards.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9B9AAF', marginTop: '40px', fontSize: '14px' }}>
            此主題尚無卡片
          </div>
        )}

        {cards.length > 0 && (
          <>
            <div style={{
              fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px'
            }}>卡片（{cards.length}）</div>

            {cards.map(card => (
              <div key={card.id} style={{
                background: '#1C1C22', border: '1px solid #2A2A36',
                borderRadius: '16px', padding: '14px', marginBottom: '10px', cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{card.type || '📄'}</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C5B70', flex: 1 }}>{card.type_label || ''}</span>
                  <span style={{ fontSize: '10px', color: '#5C5B70' }}>{card.created_at ? timeAgo(card.created_at) : ''}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EFF8', marginBottom: '6px', lineHeight: '1.4' }}>{card.title}</div>
                {card.summary && (
                  <div style={{ fontSize: '12px', color: '#9B9AAF', lineHeight: '1.6' }}>{card.summary}</div>
                )}
              </div>
            ))}
          </>
        )}

        <div style={{
          padding: '14px',
          background: 'linear-gradient(135deg, rgba(124,106,247,0.15), rgba(78,205,196,0.1))',
          border: '1px solid rgba(124,106,247,0.3)',
          borderRadius: '14px', cursor: 'pointer', marginTop: '8px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EFF8', marginBottom: '4px' }}>📦 生成整理包</div>
          <div style={{ fontSize: '11px', color: '#9B9AAF' }}>AI 會先問你用途，再決定怎麼打包並匯出到 NotebookLM</div>
        </div>
      </div>
    </div>
  )
}
