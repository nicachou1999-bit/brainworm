# Brainworm 專案任務說明
## 給 Cowork 的指示

你好，請幫我繼續完成這個 Next.js 專案。專案位置在你已經授權的資料夾內。

---

## 專案現狀

這是一個叫做「大腦懶惰蟲 / Brainworm」的 App，用 Next.js 建立。

目前已經完成的檔案：
- `app/page.js` — 主頁面，有底部導航，可切換畫面
- `app/screens/Inbox.js` — Inbox 畫面（已完成）
- `app/screens/Themes.js` — 主題牆畫面（已完成）
- `app/screens/ThemeDetail.js` — 主題詳細頁（已完成）
- `app/screens/Chat.js` — 問 AI 畫面（已完成）
- `app/screens/Settings.js` — 設定畫面（已完成）

---

## 現在需要做的事

請按照以下順序完成這些任務：

---

### 任務 1：確認所有檔案內容正確

請先讀取以下每個檔案，確認內容是否存在且正確：
- `app/page.js`
- `app/screens/Inbox.js`
- `app/screens/Themes.js`
- `app/screens/ThemeDetail.js`
- `app/screens/Chat.js`
- `app/screens/Settings.js`

如果任何檔案是空的或有錯誤，請用下面「正確的程式碼」章節的內容修復它。

---

### 任務 2：寫入正確的程式碼

請將以下程式碼分別寫入對應的檔案：

---

#### `app/page.js`

```javascript
'use client'
import { useState } from 'react'
import Inbox from './screens/Inbox'
import Themes from './screens/Themes'
import ThemeDetail from './screens/ThemeDetail'
import Chat from './screens/Chat'
import Settings from './screens/Settings'

export default function Home() {
  const [screen, setScreen] = useState('inbox')

  return (
    <div style={{
      backgroundColor: '#0C0C0F',
      minHeight: '100vh',
      maxWidth: '390px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      color: '#F0EFF8',
      position: 'relative'
    }}>
      {screen === 'inbox' && <Inbox />}
      {screen === 'themes' && <Themes onThemeClick={() => setScreen('themeDetail')} />}
      {screen === 'themeDetail' && <ThemeDetail onBack={() => setScreen('themes')} />}
      {screen === 'chat' && <Chat />}
      {screen === 'settings' && <Settings />}

      {screen !== 'themeDetail' && (
        <div style={{
          position: 'fixed', bottom: '0', left: '50%', transform: 'translateX(-50%)',
          width: '390px', display: 'flex', justifyContent: 'space-around',
          padding: '10px 10px 24px', borderTop: '1px solid #2A2A36',
          background: '#141418', zIndex: 100
        }}>
          {[
            { icon: '📥', label: 'Inbox', id: 'inbox' },
            { icon: '🗺️', label: '主題', id: 'themes' },
            { icon: '💬', label: '問 AI', id: 'chat' },
            { icon: '⚙️', label: '設定', id: 'settings' }
          ].map(item => (
            <div key={item.id} onClick={() => setScreen(item.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '3px', cursor: 'pointer', padding: '4px 12px', borderRadius: '10px'
            }}>
              <span style={{ fontSize: '20px', opacity: screen === item.id ? 1 : 0.4 }}>{item.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: '500', color: screen === item.id ? '#7C6AF7' : '#5C5B70' }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

#### `app/screens/Inbox.js`

```javascript
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
```

---

#### `app/screens/Themes.js`

```javascript
'use client'

const themes = [
  { id: 1, emoji: '🎨', name: 'UI 靈感', count: 38, color: '#7C6AF7', shared: false },
  { id: 2, emoji: '⚡', name: '深度工作', count: 24, color: '#4ECDC4', shared: true },
  { id: 3, emoji: '🚀', name: '創業點子', count: 31, color: '#FF6B6B', shared: false },
  { id: 4, emoji: '🧠', name: 'Brainworm App', count: 16, color: '#FFD93D', shared: true },
  { id: 5, emoji: '🛠️', name: '生產力工具', count: 22, color: '#4ADE80', shared: false },
  { id: 6, emoji: '✍️', name: '寫作靈感', count: 11, color: '#7C6AF7', shared: false },
]

export default function Themes({ onThemeClick }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>主題牆</div>
          <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>6 個主題 · 142 張卡片</div>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#1C1C22', border: '1px solid #2A2A36',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', cursor: 'pointer'
        }}>🔍</div>
      </div>

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
            {theme.shared && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px', opacity: 0.6 }}>👥</div>
            )}
            <div style={{ fontSize: '22px', marginBottom: '8px', marginTop: '4px' }}>{theme.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#F0EFF8', marginBottom: '4px', lineHeight: '1.3' }}>{theme.name}</div>
            <div style={{ fontSize: '10px', color: '#5C5B70' }}>{theme.count} 張卡片</div>
          </div>
        ))}
        <div style={{
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
```

---

#### `app/screens/ThemeDetail.js`

```javascript
'use client'

const members = [
  { id: 1, emoji: '😊', name: '你（擁有者）', role: 'owner', roleLabel: '擁有者', contributed: 12 },
  { id: 2, emoji: '🐱', name: '小明', role: 'editor', roleLabel: '編輯者', contributed: 8 },
  { id: 3, emoji: '🦊', name: '小華', role: 'viewer', roleLabel: '觀看者', contributed: 0 },
]

const cards = [
  { id: 1, type: '📄', typeLabel: 'PDF', time: '3 天前', title: 'Deep Work', summary: '四條深度工作規則：專注哲學、擁抱無聊、遠離社群...', contributor: '你', contributorColor: '#9B9AAF' },
  { id: 2, type: '🔗', typeLabel: '網址', time: '1 天前', title: '番茄工作法的科學根據', summary: '25分鐘工作區塊與注意力恢復週期的關聯研究...', contributor: '小明', contributorColor: '#4ECDC4' },
  { id: 3, type: '🎙️', typeLabel: '語音', time: '5 小時前', title: '語音筆記 1分32秒', summary: '關於深度工作和手機成癮的關聯想法...', contributor: '你', contributorColor: '#9B9AAF' },
]

export default function ThemeDetail({ onBack }) {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 16px 8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div onClick={onBack} style={{ fontSize: '18px', cursor: 'pointer', color: '#9B9AAF', padding: '0 4px' }}>‹</div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800' }}>⚡ 深度工作</div>
            <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>24 張卡片 · 共享中</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1C1C22', border: '1px solid #2A2A36', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer' }}>📦</div>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1C1C22', border: '1px solid #2A2A36', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', cursor: 'pointer' }}>👥</div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5B70', margin: '8px 0' }}>成員</div>

        {members.map(member => (
          <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px', padding: '10px 12px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C6AF7, #4ECDC4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{member.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#F0EFF8' }}>{member.name}</div>
              <div style={{ fontSize: '10px', color: '#5C5B70', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                {member.contributed > 0 ? `貢獻 ${member.contributed} 張` : '觀看中'}
              </div>
            </div>
            <div style={{
              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600',
              background: member.role === 'owner' ? 'rgba(124,106,247,0.15)' : member.role === 'editor' ? 'rgba(74,222,128,0.15)' : 'rgba(155,154,175,0.15)',
              color: member.role === 'owner' ? '#7C6AF7' : member.role === 'editor' ? '#4ADE80' : '#9B9AAF'
            }}>{member.roleLabel}</div>
          </div>
        ))}

        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px' }}>卡片（24）</div>

        {cards.map(card => (
          <div key={card.id} style={{ background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '16px', padding: '14px', marginBottom: '10px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>{card.type}</span>
              <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5C5B70', flex: 1 }}>{card.typeLabel}</span>
              <span style={{ fontSize: '10px', color: '#5C5B70' }}>{card.time}</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0EFF8', marginBottom: '6px', lineHeight: '1.4' }}>{card.title}</div>
            <div style={{ fontSize: '12px', color: '#9B9AAF', lineHeight: '1.6', marginBottom: '8px' }}>{card.summary}</div>
            <div style={{ fontSize: '10px', color: card.contributorColor }}>貢獻者：{card.contributor}</div>
          </div>
        ))}

        <div style={{ padding: '14px', background: 'linear-gradient(135deg, rgba(124,106,247,0.15), rgba(78,205,196,0.1))', border: '1px solid rgba(124,106,247,0.3)', borderRadius: '14px', cursor: 'pointer', marginTop: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#F0EFF8', marginBottom: '4px' }}>📦 生成整理包</div>
          <div style={{ fontSize: '11px', color: '#9B9AAF' }}>AI 會先問你用途，再決定怎麼打包並匯出到 NotebookLM</div>
        </div>
      </div>
    </div>
  )
}
```

---

#### `app/screens/Chat.js`

```javascript
'use client'
import { useState } from 'react'

const initialMessages = [
  { id: 1, role: 'user', text: '我之前存了哪些關於番茄工作法的資料？' },
  {
    id: 2, role: 'ai',
    text: '根據你的知識庫，你有 3 筆關於番茄工作法的資料：\n\n1. 一篇科學研究文章，探討 25 分鐘工作區塊與注意力恢復的關聯\n2. 你的語音筆記，提到想結合番茄工作法和深度工作\n3. Cal Newport PDF 中有一段提到對番茄法的看法',
    sources: ['📄 Deep Work PDF', '🔗 番茄科學', '🎙️ 語音筆記']
  },
  { id: 3, role: 'user', text: '這些跟手機成癮有沒有關聯？' },
  {
    id: 4, role: 'ai',
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
    const aiMsg = { id: messages.length + 2, role: 'ai', text: '正在從你的知識庫搜尋相關資料...', sources: [] }
    setMessages([...messages, userMsg, aiMsg])
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 16px 8px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>問 AI</div>
          <div style={{ fontSize: '12px', color: '#9B9AAF', marginTop: '2px' }}>基於你的知識庫回答</div>
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#1C1C22', border: '1px solid #2A2A36', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer' }}>⊕</div>
      </div>

      <div style={{ padding: '0 16px 8px', position: 'relative' }}>
        <div onClick={() => setShowScopes(!showScopes)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '10px', cursor: 'pointer' }}>
          <span style={{ fontSize: '11px', color: '#9B9AAF' }}>範圍：</span>
          <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', background: 'rgba(124,106,247,0.15)', border: '1px solid rgba(124,106,247,0.3)', color: '#7C6AF7' }}>{scope}</span>
          <span style={{ fontSize: '11px', color: '#5C5B70', marginLeft: 'auto' }}>切換 ›</span>
        </div>
        {showScopes && (
          <div style={{ position: 'absolute', top: '48px', left: '16px', right: '16px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px', zIndex: 50, overflow: 'hidden' }}>
            {scopes.map(s => (
              <div key={s} onClick={() => { setScope(s); setShowScopes(false) }} style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', color: scope === s ? '#7C6AF7' : '#F0EFF8', background: scope === s ? 'rgba(124,106,247,0.1)' : 'transparent', borderBottom: '1px solid #2A2A36' }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0, background: msg.role === 'ai' ? 'linear-gradient(135deg, #7C6AF7, #4ECDC4)' : '#2A2A36', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{msg.role === 'ai' ? '🧠' : '😊'}</div>
            <div style={{ maxWidth: '80%' }}>
              <div style={{ padding: '10px 12px', borderRadius: '12px', fontSize: '12px', lineHeight: '1.6', background: msg.role === 'ai' ? '#1C1C22' : '#7C6AF7', border: msg.role === 'ai' ? '1px solid #2A2A36' : 'none', color: '#F0EFF8', borderTopLeftRadius: msg.role === 'ai' ? '4px' : '12px', borderTopRightRadius: msg.role === 'user' ? '4px' : '12px', whiteSpace: 'pre-line' }}>{msg.text}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {msg.sources.map(s => (
                    <span key={s} style={{ padding: '2px 8px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '6px', fontSize: '10px', color: '#9B9AAF', cursor: 'pointer' }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '6px', padding: '10px 16px 6px', borderTop: '1px solid #2A2A36', background: '#0C0C0F' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="問任何問題..." style={{ flex: 1, background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', color: '#F0EFF8', outline: 'none', fontFamily: 'system-ui' }} />
        <button onClick={sendMessage} style={{ width: '34px', height: '34px', background: '#7C6AF7', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', color: 'white' }}>↑</button>
      </div>
    </div>
  )
}
```

---

#### `app/screens/Settings.js`

```javascript
'use client'
import { useState } from 'react'

export default function Settings() {
  const [lang, setLang] = useState('繁體中文')
  const [aiLayer, setAiLayer] = useState('cloud')
  const [surfaceNotif, setSurfaceNotif] = useState(true)
  const [cardNotif, setCardNotif] = useState(false)
  const [showLangs, setShowLangs] = useState(false)
  const langs = ['繁體中文', 'English', 'Español']

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800' }}>設定</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5B70', margin: '8px 0' }}>語言</div>

        <div style={{ position: 'relative' }}>
          <div onClick={() => setShowLangs(!showLangs)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px', marginBottom: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '13px', color: '#F0EFF8' }}>🌐 顯示語言</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9B9AAF' }}>{lang}</span>
              <span style={{ fontSize: '12px', color: '#5C5B70' }}>›</span>
            </span>
          </div>
          {showLangs && (
            <div style={{ position: 'absolute', top: '48px', left: 0, right: 0, background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px', zIndex: 50, overflow: 'hidden' }}>
              {langs.map(l => (
                <div key={l} onClick={() => { setLang(l); setShowLangs(false) }} style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', color: lang === l ? '#7C6AF7' : '#F0EFF8', background: lang === l ? 'rgba(124,106,247,0.1)' : 'transparent', borderBottom: '1px solid #2A2A36' }}>{l}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px' }}>AI 層</div>

        {[
          { id: 'cloud', icon: '☁️', name: 'Brainworm 雲端 AI', desc: '最佳品質，語音轉文字、多模態、問答全功能（Pro 方案）' },
          { id: 'byok', icon: '🔑', name: '自帶 API Key（BYOK）', desc: '使用自己的 OpenAI / Anthropic Key，可接本地 Ollama' },
          { id: 'local', icon: '💻', name: '本地模型（離線）', desc: '完全離線，資料不離開裝置，功能較有限', soon: true },
        ].map(layer => (
          <div key={layer.id} onClick={() => !layer.soon && setAiLayer(layer.id)} style={{ padding: '12px 14px', background: aiLayer === layer.id ? 'rgba(124,106,247,0.08)' : '#1C1C22', border: aiLayer === layer.id ? '1px solid #7C6AF7' : '1px solid #2A2A36', borderRadius: '12px', marginBottom: '6px', cursor: layer.soon ? 'default' : 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#F0EFF8' }}>{layer.icon} {layer.name}</span>
              {aiLayer === layer.id && <span style={{ color: '#7C6AF7', fontSize: '14px' }}>✓</span>}
              {layer.soon && <span style={{ fontSize: '10px', color: '#5C5B70', fontWeight: '600' }}>即將推出</span>}
            </div>
            <div style={{ fontSize: '11px', color: '#9B9AAF', lineHeight: '1.5' }}>{layer.desc}</div>
          </div>
        ))}

        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px' }}>通知</div>

        {[
          { label: '🧠 Surface 浮現通知', value: surfaceNotif, toggle: () => setSurfaceNotif(!surfaceNotif) },
          { label: '📥 新卡片整理完成', value: cardNotif, toggle: () => setCardNotif(!cardNotif) },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#F0EFF8' }}>{item.label}</span>
            <div onClick={item.toggle} style={{ width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer', background: item.value ? '#7C6AF7' : '#2A2A36', display: 'flex', alignItems: 'center', padding: item.value ? '0 3px 0 0' : '0 0 0 3px', justifyContent: item.value ? 'flex-end' : 'flex-start' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white' }}></div>
            </div>
          </div>
        ))}

        <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px' }}>帳號</div>

        {[
          { label: '👤 帳號', value: 'Pro 方案' },
          { label: '📤 匯出所有資料', value: '' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px', marginBottom: '6px', cursor: 'pointer' }}>
            <span style={{ fontSize: '13px', color: '#F0EFF8' }}>{item.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {item.value && <span style={{ fontSize: '12px', color: '#9B9AAF' }}>{item.value}</span>}
              <span style={{ fontSize: '12px', color: '#5C5B70' }}>›</span>
            </span>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px', marginBottom: '6px', cursor: 'pointer' }}>
          <span style={{ fontSize: '13px', color: '#FF6B6B' }}>登出</span>
        </div>
      </div>
    </div>
  )
}
```

---

### 任務 3：確認專案可以正常執行

完成所有檔案後，請確認專案沒有語法錯誤。如果有任何錯誤請自動修復。

---

## 設計規範（供參考）

- 背景色：`#0C0C0F`
- 卡片背景：`#1C1C22`
- 邊框：`#2A2A36`
- 主要文字：`#F0EFF8`
- 次要文字：`#9B9AAF`
- 暗淡文字：`#5C5B70`
- 主色（紫）：`#7C6AF7`
- 輔色（青）：`#4ECDC4`
- 綠色：`#4ADE80`
- 紅色：`#FF6B6B`
- 黃色：`#FFD93D`
- 最大寬度：390px（手機尺寸）

---

## 完成後

請告訴我哪些檔案已經成功寫入，以及是否有任何錯誤需要處理。
