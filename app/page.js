'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Login from './screens/Login'
import Inbox from './screens/Inbox'
import Themes from './screens/Themes'
import ThemeDetail from './screens/ThemeDetail'
import Chat from './screens/Chat'
import Settings from './screens/Settings'

export default function Home() {
  const [screen, setScreen] = useState('inbox')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#0C0C0F', minHeight: '100vh', maxWidth: '390px',
        margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '32px' }}>🧠</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '390px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#F0EFF8' }}>
        <Login onLogin={() => {}} />
      </div>
    )
  }

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
      {screen === 'inbox' && <Inbox user={user} />}
      {screen === 'themes' && <Themes onThemeClick={() => setScreen('themeDetail')} />}
      {screen === 'themeDetail' && <ThemeDetail onBack={() => setScreen('themes')} />}
      {screen === 'chat' && <Chat user={user} />}
      {screen === 'settings' && <Settings user={user} />}

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
