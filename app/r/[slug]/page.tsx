import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import PledgeForm from './PledgeForm'
import Nav from '@/components/Nav'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params

  const { data: runner } = await supabase
    .from('runners')
    .select('*, charities(name)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!runner) notFound()

  const { data: pledges } = await supabase
    .from('pledges')
    .select('amount')
    .eq('runner_id', runner.id)
    .eq('status', 'held')

  const raised = pledges?.reduce((sum, p) => sum + p.amount, 0) ?? 0
  const pct = Math.min(100, Math.round((raised / runner.funding_goal) * 100))
  const pledgeCount = pledges?.length ?? 0

  const [raceHours, raceMins] = runner.goal_time.split(':')

  return (
    <>
      {/* NAV */}
      <Nav right={<a href="#pledge" className="btn btn-solid" style={{ padding: '0.6rem 1.4rem' }}>Back this runner</a>} />

      <div style={{ paddingTop: '5rem' }}>
        {/* HERO */}
        <section style={{ padding: '6rem 2rem 4rem', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', right: '-1rem', transform: 'translateY(-55%)', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(14rem,28vw,22rem)', color: 'rgba(255,255,255,0.02)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>42</div>
          <div style={{ maxWidth: 800, position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1.5rem' }}>
              <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
              {runner.race_name}
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,10vw,8rem)', lineHeight: 0.9, letterSpacing: '0.02em', marginBottom: '1.5rem' }}>
              {runner.name.toUpperCase()}<br /><span style={{ color: 'var(--green)' }}>IS RUNNING.</span>
            </h1>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--mid)', maxWidth: 480 }}>
              Goal: <strong style={{ color: 'var(--white)' }}>{runner.goal_time}</strong> at {runner.race_name} on {new Date(runner.race_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
              Back them with a pledge — real money, real stakes.
            </p>
            {runner.strava_link && (
              <a href={runner.strava_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mid)', textDecoration: 'none' }}>
                → View training on Strava/Garmin
              </a>
            )}
          </div>
        </section>

        {/* STATS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--border)' }}>
          {[
            [`€${raised.toLocaleString()}`, 'Pledged'],
            [`€${runner.funding_goal.toLocaleString()}`, 'Goal'],
            [String(pledgeCount), 'Supporters'],
            [runner.goal_time, 'Target time'],
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
            <span>Funding progress</span><span style={{ color: 'var(--green)' }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{ height: '100%', background: 'var(--green)', width: `${pct}%`, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* PAYOUT MECHANIC */}
        <section style={{ padding: '4rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--gray2)' }}>
          <p className="section-label">How the payout works</p>
          <div style={{ maxWidth: 520, background: 'var(--black)', border: '1px solid var(--border)', padding: '2rem' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '1.5rem' }}>If {runner.name.split(' ')[0]} raises €{runner.funding_goal}</div>
            {[
              ['Hits goal or within 2%', `€${runner.funding_goal}`, 'var(--green)'],
              ['Misses by 10%', `€${Math.round(runner.funding_goal * 0.5)}`, 'var(--green)'],
              ['Misses by 20%', `€${Math.round(runner.funding_goal * 0)}`, '#ff6b6b'],
              ['DNS / DNF', '€0', '#ff6b6b'],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--mid)' }}>{l}</span>
                <span style={{ fontWeight: 500, color: c }}>{v} to {runner.name.split(' ')[0]}</span>
              </div>
            ))}
            <p style={{ fontSize: '0.72rem', color: 'var(--mid)', lineHeight: 1.6, paddingTop: '1rem' }}>
              Penalty = 5× percentage missed. Miss by &gt;20% → 100% to {(runner.charities as { name: string } | null)?.name ?? 'charity'}.
            </p>
          </div>
        </section>

        {/* PLEDGE FORM */}
        <section id="pledge" style={{ padding: '6rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
            <div>
              <p className="section-label">Back {runner.name.split(' ')[0]}</p>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,4rem)', lineHeight: 1, marginBottom: '1.5rem' }}>
                PUT YOUR<br />MONEY ON<br /><span style={{ color: 'var(--green)' }}>THE LINE.</span>
              </h2>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.9, color: 'var(--mid)' }}>
                Your pledge is charged upfront and held securely. On race day, it&apos;s released to {runner.name.split(' ')[0]} based on the result — or donated to {(runner.charities as { name: string } | null)?.name ?? 'charity'} if they miss.
              </p>
            </div>
            <PledgeForm runnerId={runner.id} runnerName={runner.name} />
          </div>
        </section>
      </div>
    </>
  )
}
