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
  const [showShare, setShowShare] = useState(false)
  const [editLink, setEditLink] = useState('')
  const [generatingLink, setGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)

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

  async function generateEditLink() {
    setGeneratingLink(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ themeId, action: 'generate-edit-link' }),
      })
      const json = await res.json()
      if (json.editUrl) setEditLink(json.editUrl)
    } catch (e) {
      console.error('generate edit link error', e)
    }
    setGeneratingLink(false)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(editLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

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
        <div onClick={() => setShowShare(true)} style={{
          fontSize: '13px', fontWeight: '600', color: '#9B9AAF',
          cursor: 'pointer', padding: '6px 10px',
          background: 'rgba(155,154,175,0.12)', borderRadius: '10px'
        }}>分享</div>
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

      {/* Share Modal */}
      {showShare && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 100, display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowShare(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1C1C22', borderRadius: '24px 24px 0 0',
            padding: '24px 20px 40px', width: '100%', boxSizing: 'border-box',
          }}>
            <div style={{ width: '36px', height: '4px', background: '#3A3A48', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#F0EFF8', marginBottom: '20px' }}>分享主題</div>

            {/* Collab edit link section */}
            <div style={{
              background: '#14141A', borderRadius: '14px', padding: '16px', marginBottom: '16px',
              border: '1px solid #2A2A36'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#F0EFF8', marginBottom: '12px' }}>🔗 共編連結</div>

              {!editLink ? (
                <button
                  onClick={generateEditLink}
                  disabled={generatingLink}
                  style={{
                    width: '100%', padding: '13px',
                    background: generatingLink ? 'rgba(255,149,0,0.5)' : '#FF9500',
                    border: 'none', borderRadius: '12px',
                    fontSize: '15px', fontWeight: '600', color: 'white',
                    cursor: generatingLink ? 'default' : 'pointer',
                  }}
                >
                  {generatingLink ? '產生中...' : '產生共編連結'}
                </button>
              ) : (
                <div>
                  <div style={{
                    background: '#0E0E14', borderRadius: '10px', padding: '10px 12px',
                    fontSize: '12px', color: '#9B9AAF', wordBreak: 'break-all',
                    lineHeight: '1.6', marginBottom: '10px', border: '1px solid #2A2A36'
                  }}>{editLink}</div>
                  <button
                    onClick={copyLink}
                    style={{
                      width: '100%', padding: '13px',
                      background: copied ? '#34C759' : '#FF9500',
                      border: 'none', borderRadius: '12px',
                      fontSize: '15px', fontWeight: '600', color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? '✓ 已複製' : '複製連結'}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowShare(false)}
              style={{
                width: '100%', padding: '13px',
                background: 'rgba(118,118,128,0.12)',
                border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: '500', color: '#9B9AAF',
                cursor: 'pointer',
              }}
            >關閉</button>
          </div>
        </div>
      )}
    </div>
  )
}
