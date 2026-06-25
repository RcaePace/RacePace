'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import Nav from '@/components/Nav'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get('error') === 'auth' ? 'Login link expired or already used. Request a new one.' : ''
  )

  async function handleLogin() {
    if (!email) return
    setLoading(true)
    setError('')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appUrl}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '4rem', color: 'var(--green)', marginBottom: '1rem' }}>✓</div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.5rem', lineHeight: 1, marginBottom: '1rem' }}>
            CHECK YOUR<br /><span style={{ color: 'var(--green)' }}>EMAIL.</span>
          </h1>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--mid)' }}>
            We sent a login link to <strong style={{ color: 'var(--white)' }}>{email}</strong>.<br />
            Click it to access your dashboard. No password needed.
          </p>
        </div>
      ) : (
        <>
          <p className="section-label">Runner login</p>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,8vw,5rem)', lineHeight: 0.9, marginBottom: '2rem' }}>
            YOUR<br /><span style={{ color: 'var(--green)' }}>DASHBOARD.</span>
          </h1>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--mid)', marginBottom: '2rem' }}>
            Enter your email and we&apos;ll send you a magic login link. No password required.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {error && <p style={{ fontSize: '0.78rem', color: '#ff6b6b' }}>{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{ width: '100%', padding: '1.1rem', background: 'var(--green)', color: 'var(--black)', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Sending…' : 'Send login link'}
            </button>
            <p style={{ fontSize: '0.68rem', color: 'var(--mid)', textAlign: 'center' }}>
              Don&apos;t have an account yet? <a href="/signup" style={{ color: 'var(--green)', textDecoration: 'none' }}>Sign up here →</a>
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <Nav />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </>
  )
}
