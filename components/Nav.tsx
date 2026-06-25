import Link from 'next/link'
import { ReactNode } from 'react'

export default function Nav({ right }: { right?: ReactNode }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1.4rem 2rem',
      background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link href="/" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', letterSpacing: '0.08em', color: 'var(--white)', textDecoration: 'none' }}>
        RACE<span style={{ color: 'var(--green)' }}>PACE</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {right}
        <Link
          href="/login"
          style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--green)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--mid)')}
        >
          Log in
        </Link>
      </div>
    </nav>
  )
}
