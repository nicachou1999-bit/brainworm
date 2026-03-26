'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleOAuth(provider) {
    setOauthLoading(provider)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setOauthLoading('')
    }
  }

  async function handleSubmit() {
    if (!email || !password) return
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onLogin()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('確認信已寄出，請去收信後再登入。')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: colors.background,
      fontFamily: typography.fontFamily,
    }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🧠</div>
          <div style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>Brainworm</div>
          <div style={{ fontSize: 13, color: colors.textTertiary, marginTop: '4px' }}>你的第二大腦</div>
        </div>

        <div style={{
          background: colors.card,
          borderRadius: radius.lg,
          padding: '20px',
          boxShadow: shadow.md,
        }}>
          {/* Segmented control */}
          <div style={{
            display: 'flex',
            gap: '2px',
            marginBottom: '20px',
            background: 'rgba(118,118,128,0.12)',
            borderRadius: radius.sm,
            padding: '2px',
          }}>
            {['login', 'register'].map(m => (
              <div
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '7px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: '600',
                  background: mode === m ? colors.card : 'transparent',
                  color: mode === m ? colors.text : colors.textTertiary,
                  boxShadow: mode === m ? shadow.sm : 'none',
                  transition: 'all 0.2s',
                }}
              >{m === 'login' ? '登入' : '註冊'}</div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                background: 'rgba(118,118,128,0.08)',
                border: 'none',
                borderRadius: radius.md,
                padding: '14px 16px',
                fontSize: 17,
                color: colors.text,
                outline: 'none',
                fontFamily: typography.fontFamily,
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              placeholder="密碼"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                background: 'rgba(118,118,128,0.08)',
                border: 'none',
                borderRadius: radius.md,
                padding: '14px 16px',
                fontSize: 17,
                color: colors.text,
                outline: 'none',
                fontFamily: typography.fontFamily,
                width: '100%',
                boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{
                fontSize: 13,
                color: colors.danger,
                padding: '10px 12px',
                background: 'rgba(255,59,48,0.08)',
                borderRadius: radius.sm,
              }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{
                fontSize: 13,
                color: colors.success,
                padding: '10px 12px',
                background: 'rgba(52,199,89,0.08)',
                borderRadius: radius.sm,
              }}>
                {message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: colors.primary,
                border: 'none',
                borderRadius: radius.md,
                padding: '16px',
                fontSize: 17,
                fontWeight: '600',
                color: 'white',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '4px',
                fontFamily: typography.fontFamily,
                width: '100%',
              }}
            >
              {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
            </button>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0 16px',
          }}>
            <div style={{ flex: 1, height: '1px', background: colors.separator }} />
            <span style={{ fontSize: 13, color: colors.textTertiary, whiteSpace: 'nowrap' }}>或</span>
            <div style={{ flex: 1, height: '1px', background: colors.separator }} />
          </div>

          {/* Social login buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <OAuthButton
              onClick={() => handleOAuth('google')}
              loading={oauthLoading === 'google'}
              icon={<GoogleIcon />}
              label="使用 Google 登入"
              borderColor="#DB4437"
              fontFamily={typography.fontFamily}
            />
            <OAuthButton
              onClick={() => handleOAuth('facebook')}
              loading={oauthLoading === 'facebook'}
              icon={<FacebookIcon />}
              label="使用 Facebook 登入"
              borderColor="#1877F2"
              fontFamily={typography.fontFamily}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function OAuthButton({ onClick, loading, icon, label, borderColor, fontFamily }) {
  const [hovered, setHovered] = useState(false)
  const [active, setActive] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        height: '48px',
        width: '100%',
        background: active ? 'rgba(0,0,0,0.04)' : hovered ? 'rgba(0,0,0,0.02)' : 'white',
        border: `1.5px solid ${hovered ? borderColor : 'rgba(60,60,67,0.18)'}`,
        borderRadius: 12,
        cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.6 : 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily,
        transition: 'all 0.2s',
        boxSizing: 'border-box',
      }}
    >
      {loading ? <span style={{ fontSize: 13 }}>處理中...</span> : <>{icon}<span>{label}</span></>}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  )
}
