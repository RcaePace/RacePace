'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function SignupPage() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [raceName, setRaceName] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [hours, setHours] = useState('')
  const [mins, setMins] = useState('')
  const [secs, setSecs] = useState('')
  const [fundingGoal, setFundingGoal] = useState('')
  const [stravaLink, setStravaLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!name || !email || !raceName || !raceDate || !fundingGoal) {
      setError('Please fill in all required fields.')
      return
    }
    const goalSecs = (parseInt(hours) || 0) * 3600 + (parseInt(mins) || 0) * 60 + (parseInt(secs) || 0)
    if (goalSecs < 60) { setError('Please set a valid goal time.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          raceName,
          raceDate,
          goalTime: `${String(parseInt(hours) || 0).padStart(2, '0')}:${String(parseInt(mins) || 0).padStart(2, '0')}:${String(parseInt(secs) || 0).padStart(2, '0')}`,
          goalSeconds: goalSecs,
          fundingGoal: parseInt(fundingGoal),
          stravaLink: stravaLink || null,
          slug: slugify(name) + '-' + Date.now().toString(36),
        }),
      })
      const { onboardingUrl, error: serverError } = await res.json()
      if (serverError) throw new Error(serverError)
      // Redirect to Stripe Connect onboarding
      window.location.href = onboardingUrl
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 4rem' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <p className="section-label">Runner signup</p>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,8vw,6rem)', lineHeight: 0.9, marginBottom: '2.5rem' }}>
            SET UP YOUR<br /><span style={{ color: 'var(--green)' }}>CAMPAIGN.</span>
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <div className="field"><label>Full name *</label><input placeholder="Sander de Vries" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="field"><label>Email *</label><input type="email" placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>Race name *</label>
              <select value={raceName} onChange={e => setRaceName(e.target.value)}>
                <option value="" disabled>Select your race</option>
                <option>TCS Amsterdam Marathon — Oct 2026</option>
                <option>Rotterdam Marathon — Apr 2027</option>
                <option>Berlin Marathon — Sep 2027</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field"><label>Race date *</label><input type="date" value={raceDate} onChange={e => setRaceDate(e.target.value)} /></div>
            <div className="field">
              <label>Goal time *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <input type="number" placeholder="4" min={0} max={9} value={hours} onChange={e => setHours(e.target.value)} style={{ textAlign: 'center' }} />
                <input type="number" placeholder="00" min={0} max={59} value={mins} onChange={e => setMins(e.target.value)} style={{ textAlign: 'center' }} />
                <input type="number" placeholder="00" min={0} max={59} value={secs} onChange={e => setSecs(e.target.value)} style={{ textAlign: 'center' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.3rem' }}>
                {['Hours', 'Minutes', 'Seconds'].map(l => <span key={l} style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textAlign: 'center' }}>{l}</span>)}
              </div>
            </div>
            <div className="field">
              <label>Funding goal (€) *</label>
              <input type="number" placeholder="900" min={100} value={fundingGoal} onChange={e => setFundingGoal(e.target.value)} />
              <span className="field-hint">How much do you want to raise from supporters?</span>
            </div>
            <div className="field">
              <label>Strava / Garmin profile link (optional)</label>
              <input placeholder="https://www.strava.com/athletes/..." value={stravaLink} onChange={e => setStravaLink(e.target.value)} />
              <span className="field-hint">Supporters can follow your training progress here.</span>
            </div>

            {error && <p style={{ fontSize: '0.78rem', color: '#ff6b6b' }}>{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading}
              style={{ width: '100%', padding: '1.1rem', background: 'var(--green)', color: 'var(--black)', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', marginTop: '0.4rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating campaign…' : 'Continue to bank setup →'}
            </button>
            <p style={{ fontSize: '0.68rem', color: 'var(--mid)', textAlign: 'center' }}>
              Next step: connect your bank account via Stripe so payouts land automatically on race day.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
