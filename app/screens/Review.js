'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

export default function Review({ user }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviewCards()
  }, [])

  async function fetchReviewCards() {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/review', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      setCards(json.cards || [])
    } catch {
      setCards([])
    }
    setLoading(false)
  }

  async function handleReview(remembered) {
    if (submitting) return
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/review', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId: cards[currentIndex].id, remembered }),
      })
    } catch {}

    if (currentIndex + 1 >= cards.length) {
      setDone(true)
    } else {
      setFlipped(false)
      setCurrentIndex(i => i + 1)
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>複習</span>
        </div>
        <div style={styles.centered}>
          <div style={{ fontSize: 40 }}>🧠</div>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>複習</span>
        </div>
        <div style={styles.centered}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
            今天沒有需要複習的內容
          </div>
          <div style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
            明天再來！
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>複習</span>
        </div>
        <div style={styles.centered}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 12 }}>
            今日複習完成！
          </div>
          <div style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center' }}>
            共複習了 {cards.length} 張卡片
          </div>
        </div>
      </div>
    )
  }

  const card = cards[currentIndex]
  const total = cards.length
  const progress = currentIndex + 1

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>複習</span>
        <span style={styles.progress}>
          {progress} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div style={styles.progressBarTrack}>
        <div style={{ ...styles.progressBarFill, width: `${(progress / total) * 100}%` }} />
      </div>

      {/* Card flip area */}
      <div style={styles.cardArea}>
        <div
          style={{ ...styles.perspective }}
          onClick={() => !flipped && setFlipped(true)}
        >
          <div style={{ ...styles.cardFlip, ...(flipped ? styles.cardFlipped : {}) }}>
            {/* Front */}
            <div style={styles.cardFront}>
              <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 12, letterSpacing: 0.5 }}>
                點擊翻牌查看摘要
              </div>
              <div style={{ fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 1.4 }}>
                {card.title || '（無標題）'}
              </div>
            </div>
            {/* Back */}
            <div style={styles.cardBack}>
              <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 12 }}>摘要</div>
              <div style={{ fontSize: 15, color: colors.text, lineHeight: 1.6, textAlign: 'center' }}>
                {card.summary || '（無摘要）'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - only visible after flip */}
      {flipped && (
        <div style={styles.buttonRow}>
          <button
            style={styles.btnAgain}
            onClick={() => handleReview(false)}
            disabled={submitting}
          >
            🔄 再複習
          </button>
          <button
            style={{ ...styles.btnRemember, opacity: submitting ? 0.6 : 1 }}
            onClick={() => handleReview(true)}
            disabled={submitting}
          >
            👍 記住了！
          </button>
        </div>
      )}

      {!flipped && (
        <div style={{ textAlign: 'center', color: colors.textTertiary, fontSize: 13, marginTop: 16 }}>
          點擊卡片翻面
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: colors.background,
    minHeight: '100vh',
    paddingBottom: 100,
    fontFamily: typography.fontFamily,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '56px 20px 12px',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: '-0.5px',
  },
  progress: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: colors.separator,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    margin: '0 20px 32px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  cardArea: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0 24px',
    marginBottom: 32,
  },
  perspective: {
    perspective: '1000px',
    width: '100%',
    maxWidth: 340,
    height: 220,
    cursor: 'pointer',
  },
  cardFlip: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardFlipped: {
    transform: 'rotateY(180deg)',
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    boxShadow: shadow.md,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    boxSizing: 'border-box',
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    backgroundColor: '#F0F4FF',
    borderRadius: radius.lg,
    boxShadow: shadow.md,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    boxSizing: 'border-box',
  },
  buttonRow: {
    display: 'flex',
    gap: 12,
    padding: '0 24px',
  },
  btnAgain: {
    flex: 1,
    padding: '14px 0',
    borderRadius: radius.md,
    border: 'none',
    backgroundColor: '#E5E5EA',
    color: '#3C3C43',
    fontSize: 15,
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnRemember: {
    flex: 1,
    padding: '14px 0',
    borderRadius: radius.md,
    border: 'none',
    backgroundColor: '#34C759',
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '0 32px',
  },
}
