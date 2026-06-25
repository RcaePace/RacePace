'use client'

import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

type Pledge = {
  id: string
  donor_name: string
  donor_email: string
  amount: number
  message: string | null
  status: string
  created_at: string
}

type Runner = {
  id: string
  name: string
  email: string
  race_name: string
  race_date: string
  goal_time: string
  goal_seconds: number
  funding_goal: number
  slug: string
  status: string
  strava_link: string | null
  stripe_account_id: string | null
  is_founding: boolean
  charities: { name: string } | null
}

type Result = {
  finish_time: string | null
  status: string
  verified_at: string
} | null

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function DashboardClient({ runner, pledges, result }: { runner: Runner; pledges: Pledge[]; result: Result }) {
  const router = useRouter()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const heldPledges = pledges.filter(p => p.status === 'held')
  const raised = heldPledges.reduce((sum, p) => sum + p.amount, 0)
  const pct = Math.min(100, Math.round((raised / runner.funding_goal) * 100))
  const days = daysUntil(runner.race_date)
  const campaignUrl = `${appUrl}/r/${runner.slug}`
  const firstName = runner.name.split(' ')[0]

  async function handleLogout() {
    await getSupabase().auth.signOut()
    router.push('/')
  }

  const statusColor = runner.status === 'active' ? 'var(--green)' : runner.status === 'complete' ? '#888' : '#ffaa00'
  const statusLabel = runner.status === 'active' ? 'Live' : runner.status === 'complete' ? 'Complete' : 'Setting up'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>

      <Nav right={
        <>
          <span style={{ fontSize: '0.75rem', color: 'var(--mid)' }}>{runner.email}</span>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--mid)', padding: '0.5rem 1rem', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Log out</button>
        </>
      } />

      <div style={{ paddingTop: '5rem' }}>

        {/* HEADER */}
        <section style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: statusColor, marginBottom: '0.8rem' }}>
                <span style={{ width: 6, height: 6, background: statusColor, borderRadius: '50%', display: 'inline-block' }} />
                {statusLabel}
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,7vw,5.5rem)', lineHeight: 0.9, letterSpacing: '0.02em' }}>
                HEY,<br /><span style={{ color: 'var(--green)' }}>{firstName.toUpperCase()}.</span>
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href={campaignUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.72rem' }}>View campaign →</a>
              <button
                onClick={() => navigator.clipboard.writeText(campaignUrl)}
                className="btn btn-solid"
                style={{ fontSize: '0.72rem' }}
              >Copy campaign link</button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--border)' }}>
          {[
            [`€${raised.toLocaleString()}`, 'Pledged so far'],
            [`€${runner.funding_goal.toLocaleString()}`, 'Funding goal'],
            [String(heldPledges.length), 'Supporters'],
            [result ? 'Done' : `${days}d`, result ? 'Race complete' : 'Until race day'],
          ].map(([n, l], i) => (
            <div key={i} style={{ padding: '2rem', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.4rem', color: 'var(--green)', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginTop: '0.4rem' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--gray)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '0.6rem' }}>
            <span>Funding progress</span>
            <span style={{ color: 'var(--green)' }}>{pct}% of €{runner.funding_goal.toLocaleString()}</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', background: 'var(--green)', width: `${pct}%`, transition: 'width 1s ease' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

          {/* LEFT — SUPPORTERS */}
          <div style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--green)', margin: 0 }}>Your supporters</p>
            </div>
            {heldPledges.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--mid)', lineHeight: 1.8 }}>No pledges yet.<br />Share your campaign link to get started.</p>
                <button
                  onClick={() => navigator.clipboard.writeText(campaignUrl)}
                  className="btn btn-solid"
                  style={{ marginTop: '1.5rem', fontSize: '0.72rem' }}
                >Copy campaign link</button>
              </div>
            ) : (
              <div>
                {heldPledges.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.2rem 2rem', borderBottom: i < heldPledges.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(184,255,87,0.1)', border: '1px solid rgba(184,255,87,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.9rem', color: 'var(--green)', flexShrink: 0 }}>
                      {p.donor_name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.donor_name}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--green)', fontFamily: "'Bebas Neue',sans-serif", flexShrink: 0 }}>€{p.amount}</span>
                      </div>
                      {p.message && <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: 'var(--mid)', lineHeight: 1.5 }}>&quot;{p.message}&quot;</p>}
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: 'rgba(136,136,136,0.6)' }}>{new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — CAMPAIGN DETAILS */}
          <div style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--green)', margin: 0 }}>Campaign details</p>
            </div>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Race info */}
              {[
                ['Race', runner.race_name],
                ['Race date', new Date(runner.race_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                ['Goal time', runner.goal_time],
                ['Charity if missed', runner.charities?.name ?? 'Nederlandse Hartstichting'],
                ['Platform fee', runner.is_founding ? '0% (Founding 100)' : '6%'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--white)' }}>{value}</p>
                </div>
              ))}

              {/* Strava link */}
              {runner.strava_link && (
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>Training profile</p>
                  <a href={runner.strava_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--green)', textDecoration: 'none' }}>→ View on Strava/Garmin</a>
                </div>
              )}

              {/* Campaign link */}
              <div>
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>Your campaign link</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', background: 'var(--gray)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--mid)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaignUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(campaignUrl)}
                    style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0 }}
                  >Copy</button>
                </div>
              </div>

              {/* Stripe onboarding status */}
              {runner.status === 'onboarding' && (
                <div style={{ padding: '1rem', background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.2)' }}>
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', color: '#ffaa00', letterSpacing: '0.1em', textTransform: 'uppercase' }}>⚠ Bank setup incomplete</p>
                  <p style={{ margin: '0 0 0.8rem', fontSize: '0.78rem', color: 'var(--mid)', lineHeight: 1.6 }}>Complete your Stripe onboarding so pledges can be paid out to you on race day.</p>
                  <a href="/signup" className="btn btn-solid" style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem' }}>Complete setup →</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULT (if race is done) */}
        {result && (
          <section style={{ padding: '3rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--gray2)' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1.5rem' }}>Race result</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
              {[
                ['Status', result.status.toUpperCase()],
                ['Finish time', result.finish_time ?? 'DNF/DNS'],
                ['Verified', new Date(result.verified_at).toLocaleDateString('en-GB')],
              ].map(([l, v]) => (
                <div key={l} style={{ padding: '1.5rem', background: 'var(--black)', border: '1px solid var(--border)' }}>
                  <p style={{ margin: '0 0 0.4rem', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--mid)' }}>{l}</p>
                  <p style={{ margin: 0, fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem', color: 'var(--green)' }}>{v}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em' }}>RACE<span style={{ color: 'var(--green)' }}>PACE</span></div>
          <p style={{ fontSize: '0.68rem', color: 'var(--mid)' }}>© 2026 RacePace — Amsterdam</p>
        </footer>

      </div>
    </div>
  )
}
