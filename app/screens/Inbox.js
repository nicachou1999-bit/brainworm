'use client'
import { useState } from 'react'

const cards = [
  {
    id: 1,
    type: '🔗',
    typeLabel: '網址',
    time: '14 分鐘前',
    title: 'Notion 的五個致命缺點與替代方案',
    summary: '作者認為 Notion 在資料量大時效能下降明顯，並缺乏真正的離線支援...',
    tag: '生產力工具',
    status: 'done'
  },
  {
    id: 2,
    type: '🎙️',
    typeLabel: '語音',
    time: '1 小時前',
    title: '車上錄音 2分14秒',
    summary: '關於新 App 的入口設計，提到多入口的重要性...',
    tag: 'Brainworm App',
    status: 'processing'
  },
  {
    id: 3,
    type: '🖼️',
    typeLabel: '截圖',
    time: '3 小時前',
    title: '深色 ToDo App UI 截圖',
    summary: '底部導航列設計，使用深色主題，有五個主要分頁...',
    tag: 'UI 靈感',
    status: 'done'
  }
]

export default function Inbox() {
  const [dismissed, setDismissed] = useState(false)

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>Inbox</div>
          <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>今天 3 筆新進來</div>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          backgroundColor: '#7C6AF7', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', cursor: 'pointer'
        }}>＋</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {!dismissed && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(124,106,247,0.15), rgba(78,205,196,0.1))',
            border: '1px solid rgba(124,106,247,0.3)',
            borderRadius: '16px', padding: '14px', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#7C6AF7', marginBottom: '6px', letterSpacing: '0.1em' }}>
              🧠 發現新模式
            </div>
            <div style={{ fontSize: '13px', color: '#F0EFF8', marginBottom: '10px', lineHeight: '1.5' }}>
              「UI 設計」主題累積了 <strong>16 張卡片</strong>，要我幫你整理成一份概覽嗎？
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{
                padding: '5px 12px', borderRadius: '8px', border: 'none',
                background: '#7C6AF7', color: 'white', fontSize: '11px',
                fontWeight: '600', cursor: 'pointer'
              }}>現在整理</button>
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

        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#5C5B70', marginBottom: '8px'
        }}>今日新增</div>

        {cards.map(card => (
          <div key={card.id} style={{
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '16px', padding: '14px', marginBottom: '10px', cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{card.type}</span>
              <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C5B70', flex: 1 }}>{card.typeLabel}</span>
              <span style={{ fontSize: '10px', color: '#5C5B70' }}>{card.time}</span>
            </div>
            {card.status === 'processing' && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ height: '2px', background: '#242430', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', width: '60%', background: 'linear-gradient(90deg, #7C6AF7, #4ECDC4)', borderRadius: '2px' }}></div>
                </div>
                <div style={{ fontSize: '11px', color: '#5C5B70' }}>正在轉文字與摘要中...</div>
              </div>
            )}
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EFF8', marginBottom: '6px', lineHeight: '1.4' }}>{card.title}</div>
            <div style={{ fontSize: '12px', color: '#9B9AAF', lineHeight: '1.6', marginBottom: '10px' }}>{card.summary}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{
                padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
                background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80'
              }}>✓ {card.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}