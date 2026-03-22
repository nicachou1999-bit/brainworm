'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Inbox({ user }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [dismissed, setDismissed] = useState(false)

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

    const { error } = await supabase.from('cards').insert({
      user_id: user.id,
      type: '🔗',
      type_label: '網址',
      title: url,
      summary: '正在處理中...',
      url: url.trim(),
      tag: '未分類',
      status: 'processing'
    })

    if (!error) {
      setUrl('')
      setShowAdd(false)
      fetchCards()
    }
    setAdding(false)
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
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>Inbox</div>
          <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>
            {loading ? '載入中...' : `${cards.length} 張卡片`}
          </div>
        </div>
        <div onClick={() => setShowAdd(!showAdd)} style={{
          width: '36px', height: '36px', borderRadius: '10px',
          backgroundColor: '#7C6AF7', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', cursor: 'pointer'
        }}>＋</div>
      </div>

      {showAdd && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '16px', padding: '14px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9B9AAF', marginBottom: '10px' }}>
              貼入網址
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCard()}
                placeholder="https://..."
                style={{
                  flex: 1, background: '#242430', border: '1px solid #2A2A36',
                  borderRadius: '10px', padding: '8px 12px', fontSize: '12px',
                  color: '#F0EFF8', outline: 'none', fontFamily: 'system-ui'
                }}
              />
              <button onClick={addCard} disabled={adding} style={{
                background: '#7C6AF7', border: 'none', borderRadius: '10px',
                padding: '8px 14px', fontSize: '12px', fontWeight: '700',
                color: 'white', cursor: adding ? 'default' : 'pointer',
                opacity: adding ? 0.7 : 1
              }}>
                {adding ? '...' : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '0 16px' }}>
        {!dismissed && cards.length >= 5 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,106,247,0.15), rgba(78,205,196,0.1))',
            border: '1px solid rgba(124,106,247,0.3)',
            borderRadius: '16px', padding: '14px', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#7C6AF7', marginBottom: '6px', letterSpacing: '0.1em' }}>
              🧠 發現新模式
            </div>
            <div style={{ fontSize: '13px', color: '#F0EFF8', marginBottom: '10px', lineHeight: '1.5' }}>
              你已經累積了 <strong>{cards.length} 張卡片</strong>，要整理一下嗎？
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setDismissed(true)} style={{
                padding: '5px 12px', borderRadius: '8px', border: 'none',
                background: '#242430', color: '#9B9AAF', fontSize: '11px',
                fontWeight: '600', cursor: 'pointer'
              }}>稍後</button>
              <button onClick={() => setDismissed(true)} style={{
                padding: '5px 12px', borderRadius: '8px', border: 'none',
                background: '#242430', color: '#9B9AAF', fontSize: '11px',
                fontWeight: '600', cursor: 'pointer'
              }}>忽略</button>
            </div>
          </div>
        )}

        {cards.length > 0 && (
          <div style={{
            fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#5C5B70', marginBottom: '8px'
          }}>最近新增</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#5C5B70', fontSize: '13px' }}>
            載入中...
          </div>
        )}

        {!loading && cards.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: '#5C5B70', fontSize: '13px', lineHeight: '2'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📥</div>
            還沒有卡片<br />點右上角 ＋ 新增第一張
          </div>
        )}

        {cards.map(card => (
          <div key={card.id} style={{
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '16px', padding: '14px', marginBottom: '10px', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{card.type}</span>
              <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C5B70', flex: 1 }}>{card.type_label}</span>
              <span style={{ fontSize: '10px', color: '#5C5B70' }}>{timeAgo(card.created_at)}</span>
            </div>
            {card.status === 'processing' && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: '2px', background: '#242430', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #7C6AF7, #4ECDC4)', borderRadius: '2px' }}></div>
                </div>
                <div style={{ fontSize: '11px', color: '#5C5B70' }}>處理中...</div>
              </div>
            )}
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EFF8', marginBottom: '6px', lineHeight: '1.4' }}>{card.title}</div>
            {card.summary && card.summary !== '正在處理中...' && (
              <div style={{ fontSize: '12px', color: '#9B9AAF', lineHeight: '1.6', marginBottom: '10px' }}>{card.summary}</div>
            )}
            {card.tag && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                  background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80'
                }}>✓ {card.tag}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
