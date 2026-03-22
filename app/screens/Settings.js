'use client'
import { useState } from 'react'

export default function Settings() {
  const [lang, setLang] = useState('繁體中文')
  const [aiLayer, setAiLayer] = useState('cloud')
  const [surfaceNotif, setSurfaceNotif] = useState(true)
  const [cardNotif, setCardNotif] = useState(false)

  const langs = ['繁體中文', 'English', 'Español']
  const [showLangs, setShowLangs] = useState(false)

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800' }}>設定</div>
      </div>

      <div style={{ padding: '0 16px' }}>

        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#5C5B70', margin: '8px 0'
        }}>語言</div>

        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowLangs(!showLangs)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36',
              borderRadius: '12px', marginBottom: '6px', cursor: 'pointer'
            }}>
            <span style={{ fontSize: '13px', color: '#F0EFF8' }}>🌐 顯示語言</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#9B9AAF' }}>{lang}</span>
              <span style={{ fontSize: '12px', color: '#5C5B70' }}>›</span>
            </span>
          </div>
          {showLangs && (
            <div style={{
              position: 'absolute', top: '48px', left: 0, right: 0,
              background: '#1C1C22', border: '1px solid #2A2A36',
              borderRadius: '12px', zIndex: 50, overflow: 'hidden'
            }}>
              {langs.map(l => (
                <div
                  key={l}
                  onClick={() => { setLang(l); setShowLangs(false) }}
                  style={{
                    padding: '10px 14px', fontSize: '13px', cursor: 'pointer',
                    color: lang === l ? '#7C6AF7' : '#F0EFF8',
                    background: lang === l ? 'rgba(124,106,247,0.1)' : 'transparent',
                    borderBottom: '1px solid #2A2A36'
                  }}>{l}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px'
        }}>AI 層</div>

        {[
          { id: 'cloud', icon: '☁️', name: 'Brainworm 雲端 AI', desc: '最佳品質，語音轉文字、多模態、問答全功能（Pro 方案）' },
          { id: 'byok', icon: '🔑', name: '自帶 API Key（BYOK）', desc: '使用自己的 OpenAI / Anthropic Key，可接本地 Ollama' },
          { id: 'local', icon: '💻', name: '本地模型（離線）', desc: '完全離線，資料不離開裝置，功能較有限', soon: true },
        ].map(layer => (
          <div
            key={layer.id}
            onClick={() => !layer.soon && setAiLayer(layer.id)}
            style={{
              padding: '12px 14px', background: '#1C1C22',
              border: aiLayer === layer.id ? '1px solid #7C6AF7' : '1px solid #2A2A36',
              borderRadius: '12px', marginBottom: '6px', cursor: layer.soon ? 'default' : 'pointer',
              background: aiLayer === layer.id ? 'rgba(124,106,247,0.08)' : '#1C1C22'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#F0EFF8' }}>{layer.icon} {layer.name}</span>
              {aiLayer === layer.id && <span style={{ color: '#7C6AF7', fontSize: '14px' }}>✓</span>}
              {layer.soon && <span style={{ fontSize: '10px', color: '#5C5B70', fontWeight: '600' }}>即將推出</span>}
            </div>
            <div style={{ fontSize: '11px', color: '#9B9AAF', lineHeight: '1.5' }}>{layer.desc}</div>
          </div>
        ))}

        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px'
        }}>通知</div>

        {[
          { label: '🧠 Surface 浮現通知', value: surfaceNotif, toggle: () => setSurfaceNotif(!surfaceNotif) },
          { label: '📥 新卡片整理完成', value: cardNotif, toggle: () => setCardNotif(!cardNotif) },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '12px', marginBottom: '6px'
          }}>
            <span style={{ fontSize: '13px', color: '#F0EFF8' }}>{item.label}</span>
            <div
              onClick={item.toggle}
              style={{
                width: '36px', height: '20px', borderRadius: '10px', cursor: 'pointer',
                background: item.value ? '#7C6AF7' : '#2A2A36',
                display: 'flex', alignItems: 'center',
                padding: item.value ? '0 3px 0 0' : '0 0 0 3px',
                justifyContent: item.value ? 'flex-end' : 'flex-start',
                transition: 'all 0.2s'
              }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white' }}></div>
            </div>
          </div>
        ))}

        <div style={{
          fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#5C5B70', margin: '16px 0 8px'
        }}>帳號</div>

        {[
          { label: '👤 帳號', value: 'Pro 方案' },
          { label: '📤 匯出所有資料', value: '' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36',
            borderRadius: '12px', marginBottom: '6px', cursor: 'pointer'
          }}>
            <span style={{ fontSize: '13px', color: '#F0EFF8' }}>{item.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {item.value && <span style={{ fontSize: '12px', color: '#9B9AAF' }}>{item.value}</span>}
              <span style={{ fontSize: '12px', color: '#5C5B70' }}>›</span>
            </span>
          </div>
        ))}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px', background: '#1C1C22', border: '1px solid #2A2A36',
          borderRadius: '12px', marginBottom: '6px', cursor: 'pointer'
        }}>
          <span style={{ fontSize: '13px', color: '#FF6B6B' }}>登出</span>
        </div>

      </div>
    </div>
  )
}
