'use client'

import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'

const PENALTY_MULTIPLIER = 5
const GRACE_PCT = 2

function calcPayout(goalSecs: number, fundingEuros: number, missSeconds: number) {
  const pctMiss = (missSeconds / goalSecs) * 100
  const charityPct = pctMiss <= GRACE_PCT ? 0 : Math.min(100, pctMiss * PENALTY_MULTIPLIER)
  const runnerPct = Math.max(0, 100 - charityPct)
  return { runnerPct: Math.round(runnerPct), runnerAmt: Math.round(fundingEuros * runnerPct / 100) }
}

function formatTime(h: number, m: number, s: number) {
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function LandingPage() {
  const [hours, setHours] = useState('')
  const [mins, setMins] = useState('')
  const [secs, setSecs] = useState('')
  const [fundingGoal, setFundingGoal] = useState('')
  const [race, setRace] = useState('')
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const goalSecs = (parseInt(hours) || 0) * 3600 + (parseInt(mins) || 0) * 60 + (parseInt(secs) || 0)
  const funding = parseInt(fundingGoal.replace(/[^0-9]/g, ''))
  const showPreview = funding > 0 && goalSecs >= 60

  const r5 = showPreview ? calcPayout(goalSecs, funding, 300) : null
  const r15 = showPreview ? calcPayout(goalSecs, funding, 900) : null

  async function handleSubmit() {
    if (!fname || !email || !race) return
    setSubmitting(true)
    try {
      await fetch('https://formspree.io/f/xdavoege', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: 'New Founding 100 signup — RacePace',
          firstName: fname,
          lastName: lname,
          email,
          race,
          fundingGoal: fundingGoal,
          goalTime: formatTime(parseInt(hours) || 0, parseInt(mins) || 0, parseInt(secs) || 0),
        }),
      })
      setSubmitted(true)
    } catch {
      alert('Something went wrong — please email hello@racepace.com')
    } finally {
      setSubmitting(false)
    }
  }

  const faqs = [
    ['How exactly is payout calculated?', 'Your payout is proportional to how close you finish to your goal time. The penalty is 5× the percentage you missed by. Finish within 2% and you get the full amount. Miss by 10% and 50% goes to charity. DNS/DNF means 100% to charity.'],
    ['How do you verify my finish time?', 'We cross-reference official chip times from the event organiser. Your bib number is registered when you create your campaign.'],
    ['When does the money get paid out?', 'Funds are released within 24 hours of official results being published — typically the morning after race day.'],
    ['What does the 6% platform fee cover?', 'Payment processing, fund escrow, result verification, and platform maintenance. Founding 100 runners pay zero fees on their first campaign.'],
    ['Can supporters pledge any amount?', 'Yes — no minimum pledge. Most campaigns see amounts between €20 and €250 per person.'],
    ['Which races are supported right now?', "We're starting with TCS Amsterdam Marathon (Oct 2026). Rotterdam and Berlin are confirmed for 2027."],
  ]

  return (
    <>
      {/* NAV */}
      <Nav right={
        <>
          <a href="#how" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textDecoration: 'none' }}>How it works</a>
          <a href="#mechanic" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textDecoration: 'none' }}>Payout logic</a>
          <a href="#faq" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textDecoration: 'none' }}>FAQ</a>
          <a href="#join" className="btn btn-solid" style={{ padding: '0.6rem 1.4rem' }}>Claim your spot</a>
        </>
      } />

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '8rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', right: '-1rem', transform: 'translateY(-55%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(18rem,35vw,28rem)', color: 'rgba(255,255,255,0.025)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>42</div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
            Amsterdam Marathon 2026 — Now open
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(4.5rem,13vw,11rem)', lineHeight: 0.9, letterSpacing: '0.02em', marginBottom: '2.5rem' }}>
            FUND<br />YOUR<br /><span style={{ color: 'var(--green)' }}>FINISH.</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--mid)', maxWidth: 360 }}>
              Your people put money on it.<br />
              <strong style={{ color: 'var(--white)', fontWeight: 400 }}>You train knowing the stakes are real.</strong><br />
              Cross the line. Collect what you earned.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#join" className="btn btn-solid">Join Founding 100</a>
              <a href="#how" className="btn btn-outline">How it works</a>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.9rem 0', overflow: 'hidden', background: 'var(--gray)' }}>
        <div style={{ display: 'flex', animation: 'ticker 22s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: 'flex' }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--green)', padding: '0 2.5rem' }}>AMSTERDAM</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--mid)', padding: '0 2.5rem' }}>42.195 KM</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--green)', padding: '0 2.5rem' }}>FUND YOUR FINISH</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--mid)', padding: '0 2.5rem' }}>ROTTERDAM</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--green)', padding: '0 2.5rem' }}>FOUNDING 100</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--mid)', padding: '0 2.5rem' }}>BERLIN</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--green)', padding: '0 2.5rem' }}>REAL STAKES</span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', color: 'var(--mid)', padding: '0 2.5rem' }}>OCT 2026</span>
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--border)' }}>
        {[
          ['0%', 'Fees for Founding 100'],
          ['6%', 'Standard fee after'],
          ['100', 'Founding spots'],
          ["OCT '26", 'First race · Amsterdam'],
        ].map(([n, l]) => (
          <div key={l} style={{ padding: '2.5rem 2rem', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.8rem', color: 'var(--green)', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginTop: '0.4rem' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <p className="section-label">How it works</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            ['Set your goal', 'Register your race and set a time goal. Not just "finish" — a real target. Sub-4 hours. A PB. Something that scares you a little.'],
            ['Your people back you', 'Share your campaign. Friends, family, colleagues pledge money — conditionally tied to your performance. Everyone has skin in the game.'],
            ['Performance pays out', 'Hit your goal and collect everything. Miss it by a margin? You still earn proportionally. Only a DNS or DNF sends funds to charity.'],
          ].map(([title, body], i) => (
            <div key={i} style={{ padding: '3rem 2.5rem', borderRight: i < 2 ? '1px solid var(--border)' : 'none', position: 'relative' }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '5rem', color: 'rgba(255,255,255,0.04)', position: 'absolute', top: '1.5rem', right: '1.5rem', lineHeight: 1 }}>0{i + 1}</span>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.6rem', letterSpacing: '0.04em', marginBottom: '0.8rem' }}>{title}</h3>
              <p style={{ fontSize: '0.83rem', lineHeight: 1.8, color: 'var(--mid)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAYOUT MECHANIC */}
      <section id="mechanic" style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--gray2)' }}>
        <p className="section-label">Payout logic</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,4rem)', lineHeight: 1, marginBottom: '1.5rem' }}>
              MISS BY<br />A LITTLE.<br /><span style={{ color: 'var(--green)' }}>LOSE A<br />LITTLE.</span>
            </h2>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.9, color: 'var(--mid)', marginBottom: '1rem' }}>Most platforms are binary: finish or lose everything. We think that&apos;s wrong. Running a 4:10 when you targeted 4:00 is still an incredible achievement.</p>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.9, color: 'var(--mid)', marginBottom: '1rem' }}>RacePace pays you proportionally based on how close you get. The further from your goal, the more goes to charity. But you always earn something for finishing.</p>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.9, color: 'var(--mid)' }}>It keeps the stakes real without punishing you for being human.</p>
          </div>
          <div style={{ background: 'var(--black)', border: '1px solid var(--border)', padding: '2rem' }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '1.5rem' }}>Example — Amsterdam Marathon</div>
            {[['Pledges raised', '€1,200'], ['Goal time', '4:00:00'], ['Finish time', '4:10:00'], ['Gap from goal', '+10 min (4.2% off)']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--mid)' }}>{l}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ margin: '1.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '0.6rem' }}>
                <span>You receive</span><span>To charity</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{ width: '79%', background: 'var(--green)' }} />
                  <div style={{ width: '21%', background: '#ff6b6b' }} />
                </div>
              </div>
            </div>
            {[['You receive', '€948 (79%)', 'var(--green)'], ['To charity', '€252 (21%)', '#ff6b6b']].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.9rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--mid)' }}>{l}</span>
                <span style={{ fontWeight: 500, color: c }}>{v}</span>
              </div>
            ))}
            <p style={{ fontSize: '0.72rem', color: 'var(--mid)', lineHeight: 1.6, paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              Gap penalty is calculated as 5× the percentage missed. A 4.2% miss = 21% to charity. Finishing within 2% of goal = full payout. DNS/DNF = 100% to charity.
            </p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why" style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
        <div>
          <p className="section-label">Why RacePace</p>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,4.5rem)', lineHeight: 1, marginBottom: '1.5rem' }}>
            Not charity.<br />Not a bet.<br /><span style={{ color: 'var(--green)' }}>A pact.</span>
          </h2>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.9, color: 'var(--mid)', marginBottom: '1rem' }}>Strava tracks your miles. Instagram likes your posts. But neither of them puts anything real on the line.</p>
          <p style={{ fontSize: '0.88rem', lineHeight: 1.9, color: 'var(--mid)' }}>RacePace changes the psychology of training. When the people you know have money on your finish — you show up differently.</p>
        </div>
        <div>
          {[
            ['Solves the cost barrier', 'Entry + shoes + nutrition + travel = €800–2,000. Let your network cover it, conditionally.'],
            ['Builds real accountability', 'Apps track. They don\'t commit. Financial stakes turn training sessions into obligations you keep.'],
            ['It\'s about you, not a cause', 'Charity runs help foundations. RacePace helps the runner. Different psychology. Different motivation.'],
            ['Your network becomes your team', 'Supporters follow your progress. Race day becomes a shared finish — not just yours.'],
          ].map(([title, body], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', padding: '1.8rem 0', borderBottom: '1px solid var(--border)', borderTop: i === 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 28, height: 28, background: 'rgba(184,255,87,0.08)', border: '1px solid rgba(184,255,87,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, color: 'var(--green)', fontSize: '0.75rem' }}>✓</div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.3rem' }}>{title}</h4>
                <p style={{ fontSize: '0.78rem', lineHeight: 1.7, color: 'var(--mid)' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section id="founder" style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--gray2)' }}>
        <p className="section-label">The story behind RacePace</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6rem', alignItems: 'start', maxWidth: 720 }}>
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.2rem,4vw,3.5rem)', lineHeight: 1, marginBottom: '2rem' }}>
              IT STARTED WITH<br />A <span style={{ color: 'var(--green)' }}>GARMIN</span><br />AND A FRIEND.
            </h2>
            <div style={{ fontSize: '0.92rem', lineHeight: 2, color: 'var(--mid)' }}>
              <p style={{ marginBottom: '1.5rem' }}>A few years ago, a close friend of mine signed up for his first marathon. He was serious about it — training plans, early mornings, long runs on weekends. But when it came to the gear he needed to actually do it properly, the money just wasn&apos;t there.</p>
              <p style={{ marginBottom: '1.5rem' }}>He wanted a Garmin. Not because it was flashy, but because <strong style={{ color: 'var(--white)', fontWeight: 400 }}>he needed the data to train right.</strong> The pace. The heart rate. The splits.</p>
              <p style={{ marginBottom: '1.5rem' }}>I told him I&apos;d buy it for him — but only if he finished the marathon. Not as a gift. As a deal. <em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.7)' }}>Put in the work, cross the line, and it&apos;s yours.</em></p>
              <blockquote style={{ borderLeft: '2px solid var(--green)', padding: '1.5rem 2rem', margin: '2.5rem 0', background: 'rgba(184,255,87,0.03)' }}>
                <p style={{ fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--white)', fontWeight: 300 }}>&quot;That conditional commitment changed everything about how he trained. He didn&apos;t just finish — he ran it better than either of us expected. I realised the accountability wasn&apos;t a side effect. It was the whole point.&quot;</p>
                <cite style={{ display: 'block', marginTop: '0.8rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--green)', fontStyle: 'normal' }}>— Founder, RacePace</cite>
              </blockquote>
              <p style={{ marginBottom: '1.5rem' }}>That&apos;s when the idea hit me. What if anyone could do this? What if every ambitious amateur runner could have a network of people who believed in them enough to put real money on it?</p>
              <p><strong style={{ color: 'var(--white)', fontWeight: 400 }}>RacePace is that platform.</strong> We built it because we couldn&apos;t find it anywhere else.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AMSTERDAM */}
      <section id="amsterdam" style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ paddingRight: '4rem', borderRight: '1px solid var(--border)' }}>
          <p className="section-label">Focus race</p>
          <div style={{ display: 'inline-block', background: 'rgba(184,255,87,0.08)', border: '1px solid rgba(184,255,87,0.2)', color: 'var(--green)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0.4rem 0.9rem', marginBottom: '1.5rem' }}>TCS Amsterdam Marathon — Oct 2026</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,5vw,4rem)', lineHeight: 1, marginBottom: '1.5rem' }}>ONE CITY.<br />ONE RACE.<br />THIS YEAR.</h2>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.9, color: 'var(--mid)', marginBottom: '1rem' }}>We&apos;re starting with Amsterdam because it&apos;s the right race for ambitious amateurs. 45,000 runners. Strong club culture. A city that shows up on race day.</p>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.9, color: 'var(--mid)', marginBottom: '1rem' }}>RacePace is built for the runners who don&apos;t have a sponsor — but deserve one.</p>
          <a href="#join" className="btn btn-solid" style={{ marginTop: '1rem', display: 'inline-block' }}>Claim your Amsterdam spot</a>
        </div>
        <div style={{ paddingLeft: '4rem' }}>
          <p className="section-label">Key dates</p>
          {[
            ['NOW', 'Founding 100 open.', 'Zero platform fee for the first 100 runners.'],
            ['JUL 26', 'Campaigns go live.', 'Build your page, share with your network, start collecting pledges.'],
            ['AUG 26', 'Milestone tracking.', 'Keep supporters updated. Show them you\'re putting in the work.'],
            ['OCT 18', 'Race day.', '42.195 km. Your network is watching.'],
            ['OCT 19', 'Funds released.', 'Proportional payout within 24 hours of official results.'],
          ].map(([date, title, body], i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', padding: '1.2rem 0', borderBottom: '1px solid var(--border)', borderTop: i === 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--green)', flexShrink: 0, width: 80, paddingTop: 2 }}>{date}</div>
              <div style={{ fontSize: '0.8rem', lineHeight: 1.6, color: 'var(--mid)' }}><strong style={{ color: 'var(--white)', fontWeight: 400 }}>{title}</strong> {body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* JOIN / SIGNUP */}
      <section id="join" style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }}>
          <div>
            <p className="section-label">Founding 100</p>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,6vw,5rem)', lineHeight: 0.95, marginBottom: '1.5rem' }}>
              YOUR<br />SPOT IS<br /><span style={{ color: 'var(--green)' }}>WAITING.</span>
            </h2>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.9, color: 'var(--mid)', marginBottom: '2rem' }}>The first 100 runners on RacePace pay zero platform fees. You keep everything you earn. Set your goal, we&apos;ll set up your campaign within 48 hours.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', border: '1px solid var(--border)', background: 'var(--gray)' }}>
              <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)' }}><div style={{ height: '100%', background: 'var(--green)', width: '2%' }} /></div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', whiteSpace: 'nowrap' }}>Founding 100 — now open</div>
            </div>
          </div>

          <div>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid rgba(184,255,87,0.2)', background: 'rgba(184,255,87,0.04)' }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', color: 'var(--green)', marginBottom: '1rem' }}>✓</div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--mid)' }}>You&apos;re on the list.<br />We&apos;ll be in touch within 48 hours.<br /><br /><strong style={{ color: '#fff' }}>Now go for a run.</strong></p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <div className="field"><label>First name</label><input placeholder="Sander" value={fname} onChange={e => setFname(e.target.value)} /></div>
                  <div className="field"><label>Last name</label><input placeholder="de Vries" value={lname} onChange={e => setLname(e.target.value)} /></div>
                </div>
                <div className="field"><label>Email address</label><input type="email" placeholder="you@gmail.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div className="field">
                  <label>Target race</label>
                  <select value={race} onChange={e => setRace(e.target.value)}>
                    <option value="" disabled>Select your race</option>
                    <option>TCS Amsterdam Marathon — Oct 2026</option>
                    <option>Rotterdam Marathon — Apr 2027</option>
                    <option>Berlin Marathon — Sep 2027</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label>Funding goal</label>
                  <input placeholder="e.g. €900" value={fundingGoal} onChange={e => setFundingGoal(e.target.value)} />
                  <span className="field-hint">How much do you want to raise from your supporters?</span>
                </div>
                <div className="field">
                  <label>Race goal time (hours / minutes / seconds)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <input type="number" placeholder="4" min={0} max={9} value={hours} onChange={e => setHours(e.target.value)} style={{ textAlign: 'center' }} />
                    <input type="number" placeholder="00" min={0} max={59} value={mins} onChange={e => setMins(e.target.value)} style={{ textAlign: 'center' }} />
                    <input type="number" placeholder="00" min={0} max={59} value={secs} onChange={e => setSecs(e.target.value)} style={{ textAlign: 'center' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.3rem' }}>
                    {['Hours', 'Minutes', 'Seconds'].map(l => <span key={l} style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textAlign: 'center' }}>{l}</span>)}
                  </div>
                  <span className="field-hint">Set a real goal — not just &quot;finish&quot;. Sub-4? PB? This is what your payout is tied to.</span>
                </div>

                {showPreview && (
                  <div style={{ background: 'var(--gray2)', border: '1px solid var(--border)', padding: '1.2rem 1.4rem' }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '0.8rem' }}>Your payout structure</div>
                    {[
                      ['Funding goal', `€${funding}`],
                      ['Your goal time', formatTime(parseInt(hours) || 0, parseInt(mins) || 0, parseInt(secs) || 0)],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.35rem 0' }}>
                        <span style={{ color: 'var(--mid)' }}>{l}</span><span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--mid)' }}>Hit your goal exactly</span><span style={{ fontWeight: 500, color: 'var(--green)' }}>€{funding} (full payout)</span>
                    </div>
                    {r5 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--mid)' }}>Miss by 5 min</span><span style={{ fontWeight: 500, color: 'var(--green)' }}>€{r5.runnerAmt} ({r5.runnerPct}% to you)</span>
                    </div>}
                    {r15 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--mid)' }}>Miss by 15 min</span><span style={{ fontWeight: 500, color: 'var(--green)' }}>€{r15.runnerAmt} ({r15.runnerPct}% to you)</span>
                    </div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--mid)' }}>DNS / DNF</span><span style={{ fontWeight: 500, color: '#ff6b6b' }}>€0 — all to charity</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ width: '100%', padding: '1.1rem', background: 'var(--green)', color: 'var(--black)', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', marginTop: '0.4rem', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? 'Sending…' : 'Claim My Founding Spot'}
                </button>
                <p style={{ fontSize: '0.68rem', color: 'var(--mid)', textAlign: 'center' }}>No payment required. We&apos;ll reach out within 48 hours.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '6rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <p className="section-label">FAQ</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 4rem' }}>
          {faqs.map(([q, a], i) => (
            <div key={i} style={{ padding: '1.8rem 0', borderBottom: '1px solid var(--border)' }}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
              >
                {q}
                <span style={{ color: 'var(--green)', fontSize: '1.2rem', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>+</span>
              </div>
              {openFaq === i && (
                <p style={{ fontSize: '0.8rem', lineHeight: 1.8, color: 'var(--mid)', marginTop: '0.8rem' }}>{a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.3rem', letterSpacing: '0.08em' }}>RACE<span style={{ color: 'var(--green)' }}>PACE</span></div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['#how', 'How it works'], ['#founder', 'Our story'], ['#join', 'Join'], ['#faq', 'FAQ']].map(([href, label]) => (
            <a key={label} href={href} style={{ fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--mid)', textAlign: 'right' }}>© 2026 RacePace — Amsterdam</div>
      </footer>
    </>
  )
}
