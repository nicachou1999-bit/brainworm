'use client'
import { useState, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { typography } from '../styles/ios-theme'

const SLIDES = [
  {
    icon: '🐛',
    title: '歡迎來到頭腦懶惰蟲 🐛',
    subtitle: '你的懶人智能知識收集器',
    desc: '什麼都可以丟進來，AI 幫你整理好',
  },
  {
    icon: '📥',
    title: '隨手收集靈感',
    desc: '貼網址、說話、拍照——AI 自動整理成漂亮的知識卡片',
    hasAnimation: true,
  },
  {
    icon: '🗂️',
    title: '自動整理，不用動腦',
    desc: 'AI 幫你打標籤、分主題，甚至匯出成報告或 NotebookLM 格式',
  },
  {
    icon: '🧠',
    title: '複習讓知識真正留下來',
    desc: '每天 3 分鐘翻牌複習，AI 算好最佳時機提醒你',
    isLast: true,
  },
]

export default function Onboarding({ onComplete }) {
  const { isDark } = useTheme()
  const [current, setCurrent] = useState(0)
  const startX = useRef(null)

  const bg = isDark ? '#1C1C1E' : '#FFFFFF'
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const subColor = '#8E8E93'

  function goNext() {
    if (current < SLIDES.length - 1) setCurrent(c => c + 1)
  }
  function goPrev() {
    if (current > 0) setCurrent(c => c - 1)
  }

  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (dx < -50) goNext()
    else if (dx > 50) goPrev()
    startX.current = null
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: typography.fontFamily,
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        transition: 'background-color 0.3s',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      <button
        onClick={onComplete}
        style={{
          position: 'absolute',
          top: 56,
          right: 24,
          zIndex: 10,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: subColor,
          fontSize: 15,
          fontFamily: typography.fontFamily,
          padding: '4px 8px',
        }}
      >
        跳過
      </button>

      {/* Slides track */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            width: `${SLIDES.length * 100}%`,
            height: '100%',
            transform: `translateX(-${current * (100 / SLIDES.length)}%)`,
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              style={{
                width: `${100 / SLIDES.length}%`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 32px',
                textAlign: 'center',
                flexShrink: 0,
                boxSizing: 'border-box',
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 32 }}>
                {slide.icon}
              </div>

              {/* Subtitle (slide 1 only) */}
              {slide.subtitle && (
                <div style={{
                  fontSize: 15,
                  color: subColor,
                  marginBottom: 10,
                  fontWeight: '500',
                }}>
                  {slide.subtitle}
                </div>
              )}

              {/* Title */}
              <div style={{
                fontSize: 26,
                fontWeight: '700',
                color: textColor,
                marginBottom: 16,
                lineHeight: 1.3,
              }}>
                {slide.title}
              </div>

              {/* Floating cards animation (slide 2) */}
              {slide.hasAnimation && i === current && (
                <FloatingCards isDark={isDark} />
              )}

              {/* Description */}
              <div style={{
                fontSize: 16,
                color: subColor,
                lineHeight: 1.65,
                maxWidth: 280,
              }}>
                {slide.desc}
              </div>

              {/* CTA button (last slide) */}
              {slide.isLast && (
                <button
                  onClick={onComplete}
                  style={{
                    marginTop: 52,
                    width: '100%',
                    maxWidth: 320,
                    padding: '18px',
                    backgroundColor: '#007AFF',
                    border: 'none',
                    borderRadius: 16,
                    fontSize: 17,
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                    fontFamily: typography.fontFamily,
                    letterSpacing: '-0.2px',
                    boxSizing: 'border-box',
                  }}
                >
                  開始使用
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Page dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 52,
      }}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === current ? '#007AFF' : '#C7C7CC',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function FloatingCards({ isDark }) {
  const cardBg = isDark ? '#2C2C2E' : '#F2F2F7'
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E'
  const items = ['🔗 網址', '🎙️ 語音', '📸 照片']

  return (
    <div style={{ position: 'relative', width: '100%', height: 72, marginBottom: 20 }}>
      {items.map((label, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${12 + i * 30}%`,
            top: 0,
            backgroundColor: cardBg,
            borderRadius: 10,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: '500',
            color: textColor,
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
            animation: `floatIn 0.45s ease ${i * 0.12}s both`,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      ))}
      <style>{`
        @keyframes floatIn {
          from { transform: translateY(-28px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
