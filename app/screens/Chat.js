'use client'
import { useState } from 'react'

const initialMessages = [
  {
    id: 1,
    role: 'user',
    text: '我之前存了哪些關於番茄工作法的資料？'
  },
  {
    id: 2,
    role: 'ai',
    text: '根據你的知識庫，你有 3 筆關於番茄工作法的資料：\n\n1. 一篇科學研究文章，探討 25 分鐘工作區塊與注意力恢復的關聯\n2. 你的語音筆記，提到想結合番茄工作法和深度工作\n3. Cal Newport PDF 中有一段提到對番茄法的看法',
    sources: ['📄 Deep Work PDF', '🔗 番茄科學', '🎙️ 語音筆記']
  },
  {
    id: 3,
    role: 'user',
    text: '這些跟手機成癮有沒有關聯？'
  },
  {
    id: 4,
    role: 'ai',
    text: '有的！你的「深度工作」和「手機成癮」主題有共同關鍵字：注意力、多巴胺、專注力。\n\n要我幫你把這兩個主題合併成一個更大的研究主題嗎？',
    sources: []
  }
]

const scopes = ['全部知識庫', '⚡ 深度工作', '🎨 UI 靈感', '🚀 創業點子']

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [scope, setScope] = useState('⚡ 深度工作')
  const [showScopes, setShowScopes] = useState(false)

  function sendMessage() {
    if (!input.trim()) return
    const userMsg = { id: messages.length + 1, role: 'user', text: input }
    const aiMsg = {
      id: messages.length + 2,
      role: 'ai',
      text: '正在從你的知識庫搜尋相關資料...',
      sources: []
    }
    setMessages([...messages, userMsg, aiMsg])
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>問 AI</div>
          <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>基於你的知識庫回答</div>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#1C1C22', border: '1px solid #2A2A36',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', cursor: 'pointer'
        }}>⊕</div>
      </div>

      <div style={{ padding: '0 16px 8px', position: 'relative' }}>
        <div
          onClick={() => setShowScopes(!showScopes)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 12px', background: '#1C1C22',
            border: '1px solid #2A2A36', borderRadius: '10px',
            cursor: 'pointer'
          }}>
          <span style={{ fontSize: '11px', color: '#9B9AAF' }}>範圍：</span>
          <span style={{
            padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600',
            background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', color: '#7C6AF7'
          }}>{scope}</span>
          <span style={{ fontSize: '11px', color: '#5C5B70', marginLeft: 'auto' }}>切換 ›</span>
        </div>
        {showScopes && (
          <div style={{
            position: 'absolute', top: '48px', left: '16px', right: '16px',
            background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '12px', zIndex: 50, overflow: 'hidden'
          }}>
            {scopes.map(s => (
              <div
                key={s}
                onClick={() => { setScope(s); setShowScopes(false) }}
                style={{
                  padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                  color: scope === s ? '#7C6AF7' : '#F0EFF8',
                  background: scope === s ? 'rgba(124,106,247,0.1)' : 'transparent',
                  borderBottom: '1px solid #2A2A36'
                }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex', gap: '8px', alignItems: 'flex-start',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
              background: msg.role === 'ai' ? 'linear-gradient(135deg, #7C6AF7, #4ECDC4)' : '#2A2A36',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
            }}>{msg.role === 'ai' ? '🧠' : '😊'}</div>
            <div style={{ maxWidth: '80%' }}>
              <div style={{
                padding: '10px 12px', borderRadius: '12px', fontSize: '12px', lineHeight: '1.6',
                background: msg.role === 'ai' ? '#1C1C22' : '#7C6AF7',
                border: msg.role === 'ai' ? '1px solid #2A2A36' : 'none',
                color: '#F0EFF8',
                borderTopLeftRadius: msg.role === 'ai' ? '4px' : '12px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '12px',
                whiteSpace: 'pre-line'
              }}>{msg.text}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {msg.sources.map(s => (
                    <span key={s} style={{
                      padding: '2px 8px', background: '#1C1C22',
                      border: '1px solid #2A2A36', borderRadius: '6px',
                      fontSize: '10px', color: '#9B9AAF', cursor: 'pointer'
                    }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', gap: '6px', padding: '10px 16px 6px',
        borderTop: '1px solid #2A2A36', background: '#0C0C0F'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="問任何問題..."
          style={{
            flex: 1, background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '10px', padding: '8px 12px', fontSize: '12px',
            color: '#F0EFF8', outline: 'none', fontFamily: 'system-ui'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            width: '34px', height: '34px', background: '#7C6AF7',
            border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontSize: '14px', color: 'white'
          }}>↑</button>
      </div>
    </div>
  )
}
