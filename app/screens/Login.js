'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { colors, typography, shadow, radius } from '../styles/ios-theme'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      if (ref) {
        setReferralCode(ref.toUpperCase().slice(0, 6))
        setMode('register')
      }
    }
  }, [])

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
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        // 若有推薦碼，等帳號建立後兌換（新用戶需先確認 email，記錄推薦碼供之後使用）
        if (referralCode && data?.user) {
          // 儲存推薦碼到 localStorage，確認 email 後登入時自動兌換
          localStorage.setItem('pending_referral_code', referralCode)
        }
        setMessage('確認信已寄出，請去收信後再登入。')
      }
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

            {mode === 'register' && (
              <input
                type="text"
                placeholder="邀請碼（選填）"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value.toUpperCase().slice(0, 6))}
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
                  letterSpacing: referralCode ? '0.1em' : 'normal',
                  fontWeight: referralCode ? '600' : '400',
                }}
              />
            )}

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
        </div>
      </div>
    </div>
  )
}
