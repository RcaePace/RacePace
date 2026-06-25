'use client'

import { useEffect, useState } from 'react'

type Runner = {
  id: string
  name: string
  race_name: string
  race_date: string
  goal_time: string
  goal_seconds: number
  funding_goal: number
  slug: string
  status: string
  is_founding: boolean
}

type PledgeSummary = {
  total_cents: number
  count: number
}

export default function AdminPage() {
  const [runners, setRunners] = useState<Runner[]>([])
  const [selected, setSelected] = useState<Runner | null>(null)
  const [pledgeSummary, setPledgeSummary] = useState<PledgeSummary | null>(null)
  const [finishHours, setFinishHours] = useState('')
  const [finishMins, setFinishMins] = useState('')
  const [finishSecs, setFinishSecs] = useState('')
  const [resultStatus, setResultStatus] = useState<'finished' | 'dnf' | 'dns'>('finished')
  const [settling, setSettling] = useState(false)
  const [settlementResult, setSettlementResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/runners').then(r => r.json()).then(d => setRunners(d.runners ?? []))
  }, [])

  async function selectRunner(runner: Runner) {
    setSelected(runner)
    setSettlementResult(null)
    setError('')
    const res = await fetch(`/api/runners/${runner.id}/pledges`)
    const data = await res.json()
    setPledgeSummary(data)
  }

  async function settle() {
    if (!selected) return
    setSettling(true)
    setError('')
    const finishSeconds = resultStatus === 'finished'
      ? (parseInt(finishHours) || 0) * 3600 + (parseInt(finishMins) || 0) * 60 + (parseInt(finishSecs) || 0)
      : null

    const res = await fetch('/api/settle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        runnerId: selected.id,
        finishTime: resultStatus === 'finished'
          ? `${String(parseInt(finishHours) || 0).padStart(2, '0')}:${String(parseInt(finishMins) || 0).padStart(2, '0')}:${String(parseInt(finishSecs) || 0).padStart(2, '0')}`
          : null,
        finishSeconds,
        status: resultStatus,
        verifiedBy: 'admin',
      }),
    })
    const data = await res.json()
    if (data.error) setError(data.error)
    else setSettlementResult(data)
    setSettling(false)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: 'var(--black)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', marginBottom: '0.5rem' }}>
          RACE<span style={{ color: 'var(--green)' }}>PACE</span> ADMIN
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--mid)', marginBottom: '3rem' }}>Result entry & settlement. Handle with care — transfers are irreversible.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Runner list */}
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '1rem' }}>Active runners</p>
            {runners.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--mid)' }}>No active runners yet.</p>}
            {runners.map(r => (
              <div
                key={r.id}
                onClick={() => selectRunner(r)}
                style={{ padding: '1.2rem 1.5rem', border: `1px solid ${selected?.id === r.id ? 'var(--green)' : 'var(--border)'}`, marginBottom: '0.5rem', cursor: 'pointer', background: selected?.id === r.id ? 'rgba(184,255,87,0.04)' : 'var(--gray)' }}
              >
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', letterSpacing: '0.04em' }}>{r.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--mid)', marginTop: '0.2rem' }}>{r.race_name} · Goal: {r.goal_time}</div>
                {r.is_founding && <div style={{ fontSize: '0.62rem', color: 'var(--green)', marginTop: '0.2rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Founding 100</div>}
              </div>
            ))}
          </div>

          {/* Settlement panel */}
          {selected && (
            <div>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--mid)', marginBottom: '1rem' }}>Settle: {selected.name}</p>

              {pledgeSummary && (
                <div style={{ padding: '1rem 1.5rem', background: 'var(--gray2)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0' }}>
                    <span style={{ color: 'var(--mid)' }}>Total pledged</span>
                    <span style={{ color: 'var(--green)', fontWeight: 500 }}>€{((pledgeSummary.total_cents ?? 0) / 100).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '0.4rem 0' }}>
                    <span style={{ color: 'var(--mid)' }}>Pledges held</span>
                    <span style={{ fontWeight: 500 }}>{pledgeSummary.count}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <div className="field">
                  <label>Result status</label>
                  <select value={resultStatus} onChange={e => setResultStatus(e.target.value as 'finished' | 'dnf' | 'dns')}>
                    <option value="finished">Finished</option>
                    <option value="dnf">DNF (Did Not Finish)</option>
                    <option value="dns">DNS (Did Not Start)</option>
                  </select>
                </div>

                {resultStatus === 'finished' && (
                  <div className="field">
                    <label>Finish time</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <input type="number" placeholder="4" value={finishHours} onChange={e => setFinishHours(e.target.value)} style={{ textAlign: 'center' }} />
                      <input type="number" placeholder="00" value={finishMins} onChange={e => setFinishMins(e.target.value)} style={{ textAlign: 'center' }} />
                      <input type="number" placeholder="00" value={finishSecs} onChange={e => setFinishSecs(e.target.value)} style={{ textAlign: 'center' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.3rem' }}>
                      {['Hours', 'Minutes', 'Seconds'].map(l => <span key={l} style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid)', textAlign: 'center' }}>{l}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {error && <p style={{ fontSize: '0.78rem', color: '#ff6b6b', marginBottom: '1rem' }}>{error}</p>}

              {settlementResult ? (
                <div style={{ padding: '1.5rem', border: '1px solid rgba(184,255,87,0.2)', background: 'rgba(184,255,87,0.04)', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.8rem' }}>Settlement complete</p>
                  {Object.entries(settlementResult).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--mid)' }}>{k}</span>
                      <span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  onClick={settle}
                  disabled={settling}
                  style={{ width: '100%', padding: '1rem', background: '#ff6b6b', color: 'var(--black)', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', opacity: settling ? 0.7 : 1 }}
                >
                  {settling ? 'Settling…' : '⚠ Trigger settlement (irreversible)'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
