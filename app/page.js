'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Login from './screens/Login'
import Inbox from './screens/Inbox'
import Themes from './screens/Themes'
import ThemeDetail from './screens/ThemeDetail'
import Chat from './screens/Chat'
import Settings from './screens/Settings'
import Review from './screens/Review'
import { colors, typography } from './styles/ios-theme'
import { ThemeProvider, useTheme } from './context/ThemeContext'

const TAB_ITEMS = [
  { icon: '📥', label: 'Inbox', id: 'inbox' },
  { icon: '🗺️', label: '主題', id: 'themes' },
  { icon: '🧠', label: '複習', id: 'review' },
  { icon: '💬', label: '問 AI', id: 'chat' },
  { icon: '⚙️', label: '設定', id: 'settings' },
]

function HomeInner() {
  const [screen, setScreen] = useState('inbox')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()
  const [hasReviewCards, setHasReviewCards] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    async function checkReviewCards() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const res = await fetch('/api/review', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const json = await res.json()
        setHasReviewCards((json.cards || []).length > 0)
      } catch {}
    }
    checkReviewCards()
  }, [user])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        maxWidth: '390px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: typography.fontFamily,
      }}>
        <div style={{ fontSize: '32px' }}>🧠</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '390px', margin: '0 auto', fontFamily: typography.fontFamily }}>
        <Login onLogin={() => {}} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      maxWidth: '390px',
      margin: '0 auto',
      fontFamily: typography.fontFamily,
      color: isDark ? '#FFFFFF' : colors.text,
      position: 'relative',
      transition: 'color 0.3s',
    }}>
      {screen === 'inbox' && <Inbox user={user} />}
      {screen === 'themes' && <Themes onThemeClick={() => setScreen('themeDetail')} />}
      {screen === 'themeDetail' && <ThemeDetail onBack={() => setScreen('themes')} />}
      {screen === 'review' && <Review user={user} />}
      {screen === 'chat' && <Chat user={user} />}
      {screen === 'settings' && <Settings user={user} />}

      {screen !== 'themeDetail' && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '390px',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 28px',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : colors.separator}`,
          background: isDark ? 'rgba(28,28,30,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          zIndex: 100,
          transition: 'background 0.3s',
        }}>
          {TAB_ITEMS.map(item => {
            const active = screen === item.id
            return (
              <div
                key={item.id}
                onClick={() => setScreen(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  padding: '4px 12px',
                  minWidth: '56px',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span style={{ fontSize: '22px', opacity: active ? 1 : 0.45 }}>{item.icon}</span>
                  {item.id === 'review' && hasReviewCards && !active && (
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#FF3B30',
                      border: '1.5px solid rgba(249,249,249,0.85)',
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  color: active ? colors.primary : '#8E8E93',
                  letterSpacing: '-0.1px',
                }}>{item.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeInner />
    </ThemeProvider>
  )
}
