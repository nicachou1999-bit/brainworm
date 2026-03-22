'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      backgroundColor: '#0C0C0F'
    }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🧠</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#F0EFF8' }}>Brainworm</div>
          <div style={{ fontSize: '13px', color: '#9B9AAF', marginTop: '4px' }}>你的第二大腦</div>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#1C1C22', borderRadius: '12px', padding: '4px' }}>
          {['login', 'register'].map(m => (
            <div key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
              flex: 1, textAlign: 'center', padding: '8px', borderRadius: '9px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600',
              background: mode === m ? '#7C6AF7' : 'transparent',
              color: mode === m ? 'white' : '#9B9AAF'
            }}>{m === 'login' ? '登入' : '註冊'}</div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px',
              padding: '12px 14px', fontSize: '14px', color: '#F0EFF8', outline: 'none',
              fontFamily: 'system-ui'
            }}
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              background: '#1C1C22', border: '1px solid #2A2A36', borderRadius: '12px',
              padding: '12px 14px', fontSize: '14px', color: '#F0EFF8', outline: 'none',
              fontFamily: 'system-ui'
            }}
          />

          {error && (
            <div style={{ fontSize: '12px', color: '#FF6B6B', padding: '8px 12px', background: 'rgba(255,107,107,0.1)', borderRadius: '8px' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ fontSize: '12px', color: '#4ADE80', padding: '8px 12px', background: 'rgba(74,222,128,0.1)', borderRadius: '8px' }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: '#7C6AF7', border: 'none', borderRadius: '12px',
              padding: '13px', fontSize: '14px', fontWeight: '700',
              color: 'white', cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '4px'
            }}
          >
            {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
          </button>
        </div>
      </div>
    </div>
  )
}
