'use client'
import { useState } from 'react'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      paddingBottom: '80px',
      fontFamily: typography.fontFamily,
      backgroundColor: colors.background,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '56px 16px 8px',
      }}>
        <div>
          <div style={{ fontSize: 34, fontWeight: '700', color: colors.text, letterSpacing: 0.37 }}>問 AI</div>
          <div style={{ fontSize: 13, color: colors.textTertiary, marginTop: '2px' }}>基於你的知識庫回答</div>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: radius.sm,
          background: colors.card,
          boxShadow: shadow.sm,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, cursor: 'pointer',
        }}>⊕</div>
      </div>

      {/* Scope selector */}
      <div style={{ padding: '0 16px 8px', position: 'relative' }}>
        <div
          onClick={() => setShowScopes(!showScopes)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 14px',
            background: colors.card,
            borderRadius: radius.md,
            cursor: 'pointer',
            boxShadow: shadow.sm,
          }}>
          <span style={{ fontSize: 13, color: colors.textSecondary }}>範圍：</span>
          <span style={{
            padding: '2px 10px', borderRadius: 6, fontSize: 13, fontWeight: '600',
            background: 'rgba(0,122,255,0.1)', color: colors.primary,
          }}>{scope}</span>
          <span style={{ fontSize: 13, color: colors.textTertiary, marginLeft: 'auto' }}>切換 ›</span>
        </div>
        {showScopes && (
          <div style={{
            position: 'absolute', top: '52px', left: '16px', right: '16px',
            background: colors.card,
            borderRadius: radius.md,
            zIndex: 50,
            overflow: 'hidden',
            boxShadow: shadow.lg,
          }}>
            {scopes.map((s, i) => (
              <div
                key={s}
                onClick={() => { setScope(s); setShowScopes(false) }}
                style={{
                  padding: '12px 16px', fontSize: 15, cursor: 'pointer',
                  color: scope === s ? colors.primary : colors.text,
                  background: scope === s ? 'rgba(0,122,255,0.06)' : 'transparent',
                  borderBottom: i < scopes.length - 1 ? `1px solid ${colors.separator}` : 'none',
                }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
          }}>
            {msg.role === 'ai' && (
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #007AFF, #34C759)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>🧠</div>
            )}
            <div style={{ maxWidth: '78%' }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? `${radius.lg}px ${radius.lg}px 4px ${radius.lg}px` : `${radius.lg}px ${radius.lg}px ${radius.lg}px 4px`,
                fontSize: 15,
                lineHeight: '1.5',
                background: msg.role === 'user' ? colors.primary : colors.card,
                color: msg.role === 'user' ? 'white' : colors.text,
                boxShadow: shadow.sm,
                whiteSpace: 'pre-line',
              }}>{msg.text}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {msg.sources.map(s => (
                    <span key={s} style={{
                      padding: '3px 10px',
                      background: colors.card,
                      borderRadius: 20,
                      fontSize: 12,
                      color: colors.textSecondary,
                      cursor: 'pointer',
                      boxShadow: shadow.sm,
                    }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 16px 12px',
        borderTop: `1px solid ${colors.separator}`,
        background: 'rgba(249,249,249,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="問任何問題..."
          style={{
            flex: 1,
            background: colors.card,
            border: 'none',
            borderRadius: 22,
            padding: '10px 16px',
            fontSize: 15,
            color: colors.text,
            outline: 'none',
            fontFamily: typography.fontFamily,
            boxShadow: shadow.sm,
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            width: '36px', height: '36px',
            background: colors.primary,
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 16,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            alignSelf: 'center',
          }}>↑</button>
      </div>
    </div>
  )
}
