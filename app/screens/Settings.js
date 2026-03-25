'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: 13,
      fontWeight: '400',
      color: colors.textTertiary,
      margin: '24px 0 6px',
      paddingLeft: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>{title}</div>
  )
}

function GroupedList({ children }) {
  return (
    <div style={{
      background: colors.card,
      borderRadius: radius.lg,
      overflow: 'hidden',
      boxShadow: shadow.sm,
    }}>
      {children}
    </div>
  )
}

function ListRow({ label, value, chevron = true, onClick, danger = false, last = false, right }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: last ? 'none' : `1px solid ${colors.separator}`,
        background: 'transparent',
      }}
    >
      <span style={{ fontSize: 17, color: danger ? colors.danger : colors.text }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {right}
        {value && <span style={{ fontSize: 15, color: colors.textTertiary }}>{value}</span>}
        {chevron && !right && <span style={{ fontSize: 15, color: colors.textTertiary }}>›</span>}
      </span>
    </div>
  )
}

function Toggle({ value, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: '51px',
        height: '31px',
        borderRadius: '16px',
        cursor: 'pointer',
        background: value ? colors.success : 'rgba(120,120,128,0.16)',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        justifyContent: value ? 'flex-end' : 'flex-start',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: '27px',
        height: '27px',
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}></div>
    </div>
  )
}

export default function Settings({ user }) {
  const [lang, setLang] = useState('繁體中文')
  const [aiLayer, setAiLayer] = useState('cloud')
  const [surfaceNotif, setSurfaceNotif] = useState(true)
  const [cardNotif, setCardNotif] = useState(false)

  const langs = ['繁體中文', 'English', 'Español']
  const [showLangs, setShowLangs] = useState(false)

  return (
    <div style={{ paddingBottom: '90px', fontFamily: typography.fontFamily }}>
      {/* Large title header */}
      <div style={{ padding: '56px 16px 0' }}>
        <div style={{ fontSize: 34, fontWeight: '700', color: colors.text, letterSpacing: 0.37 }}>設定</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Language section */}
        <SectionHeader title="語言" />
        <div style={{ position: 'relative' }}>
          <GroupedList>
            <ListRow
              label="🌐 顯示語言"
              value={lang}
              onClick={() => setShowLangs(!showLangs)}
              last
            />
          </GroupedList>
          {showLangs && (
            <div style={{
              position: 'absolute',
              top: '52px',
              left: 0,
              right: 0,
              background: colors.card,
              borderRadius: radius.lg,
              zIndex: 50,
              overflow: 'hidden',
              boxShadow: shadow.lg,
            }}>
              {langs.map((l, i) => (
                <div
                  key={l}
                  onClick={() => { setLang(l); setShowLangs(false) }}
                  style={{
                    padding: '12px 16px',
                    fontSize: 17,
                    cursor: 'pointer',
                    color: lang === l ? colors.primary : colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: i < langs.length - 1 ? `1px solid ${colors.separator}` : 'none',
                    background: 'transparent',
                  }}
                >
                  {l}
                  {lang === l && <span style={{ color: colors.primary, fontSize: 17 }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI layer section */}
        <SectionHeader title="AI 層" />
        <GroupedList>
          {[
            { id: 'cloud', icon: '☁️', name: 'Brainworm 雲端 AI', desc: '最佳品質，語音轉文字、多模態、問答全功能（Pro 方案）' },
            { id: 'byok', icon: '🔑', name: '自帶 API Key（BYOK）', desc: '使用自己的 OpenAI / Anthropic Key，可接本地 Ollama' },
            { id: 'local', icon: '💻', name: '本地模型（離線）', desc: '完全離線，資料不離開裝置，功能較有限', soon: true },
          ].map((layer, i, arr) => (
            <div
              key={layer.id}
              onClick={() => !layer.soon && setAiLayer(layer.id)}
              style={{
                padding: '12px 16px',
                cursor: layer.soon ? 'default' : 'pointer',
                borderBottom: i < arr.length - 1 ? `1px solid ${colors.separator}` : 'none',
                background: aiLayer === layer.id ? 'rgba(0,122,255,0.04)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: 17, color: colors.text }}>{layer.icon} {layer.name}</span>
                {aiLayer === layer.id && <span style={{ color: colors.primary, fontSize: 17 }}>✓</span>}
                {layer.soon && <span style={{ fontSize: 12, color: colors.textTertiary, fontWeight: '500' }}>即將推出</span>}
              </div>
              <div style={{ fontSize: 13, color: colors.textTertiary, lineHeight: '1.4' }}>{layer.desc}</div>
            </div>
          ))}
        </GroupedList>

        {/* Notifications section */}
        <SectionHeader title="通知" />
        <GroupedList>
          {[
            { label: '🧠 Surface 浮現通知', value: surfaceNotif, toggle: () => setSurfaceNotif(!surfaceNotif) },
            { label: '📥 新卡片整理完成', value: cardNotif, toggle: () => setCardNotif(!cardNotif) },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: i < arr.length - 1 ? `1px solid ${colors.separator}` : 'none',
            }}>
              <span style={{ fontSize: 17, color: colors.text }}>{item.label}</span>
              <Toggle value={item.value} onToggle={item.toggle} />
            </div>
          ))}
        </GroupedList>

        {/* Account section */}
        <SectionHeader title="帳號" />
        {user && (
          <div style={{ fontSize: 13, color: colors.textTertiary, padding: '0 4px 6px', paddingLeft: '4px' }}>
            {user.email}
          </div>
        )}
        <GroupedList>
          <ListRow label="👤 帳號" value="Pro 方案" onClick={() => {}} />
          <ListRow label="📤 匯出所有資料" onClick={() => {}} last={false} />
          <ListRow
            label="登出"
            danger
            chevron={false}
            onClick={() => supabase.auth.signOut()}
            last
          />
        </GroupedList>
      </div>
    </div>
  )
}
