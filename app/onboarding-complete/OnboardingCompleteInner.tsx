'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OnboardingCompleteInner() {
  const params = useSearchParams()
  const slug = params.get('slug')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '4rem', color: 'var(--green)', marginBottom: '1rem' }}>✓</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,6vw,4rem)', lineHeight: 1, marginBottom: '1.5rem' }}>
          YOU&apos;RE<br /><span style={{ color: 'var(--green)' }}>SET UP.</span>
        </h1>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.9, color: 'var(--mid)', marginBottom: '2rem' }}>
          Your bank account is connected. Your campaign will go live shortly — we&apos;ll review and activate it within a few hours.
        </p>
        {slug && (
          <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--mid)', marginBottom: '2rem' }}>
            Your campaign link will be:<br />
            <strong style={{ color: 'var(--white)' }}>{process.env.NEXT_PUBLIC_APP_URL ?? 'racepace.com'}/r/{slug}</strong>
          </p>
        )}
        <Link href="/" className="btn btn-outline">Back to home</Link>
      </div>
    </div>
  )
}
