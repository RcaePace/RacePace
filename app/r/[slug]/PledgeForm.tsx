'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PledgeFormInner({ runnerId, runnerName }: { runnerId: string; runnerName: string }) {
  const stripe = useStripe()
  const elements = useElements()

  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    const amountNum = parseInt(amount)
    if (!donorName || !donorEmail || !amountNum || amountNum < 5) {
      setError('Please fill in all fields. Minimum pledge is €5.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Create payment intent on server
      const res = await fetch('/api/pledges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runnerId, donorName, donorEmail, amount: amountNum, message }),
      })
      const { clientSecret, error: serverError } = await res.json()
      if (serverError) throw new Error(serverError)

      const card = elements.getElement(CardElement)!
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card, billing_details: { name: donorName, email: donorEmail } },
      })
      if (stripeError) throw new Error(stripeError.message)

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', border: '1px solid rgba(184,255,87,0.2)', background: 'rgba(184,255,87,0.04)' }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', color: 'var(--green)', marginBottom: '1rem' }}>✓</div>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--mid)' }}>
          Your pledge is locked in.<br />
          <strong style={{ color: '#fff' }}>You&apos;ll hear from us after race day.</strong>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
        <div className="field"><label>Your name</label><input placeholder="Sander de Vries" value={donorName} onChange={e => setDonorName(e.target.value)} /></div>
        <div className="field"><label>Your email</label><input type="email" placeholder="you@gmail.com" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} /></div>
      </div>
      <div className="field">
        <label>Pledge amount (€)</label>
        <input type="number" placeholder="50" min={5} value={amount} onChange={e => setAmount(e.target.value)} />
        <span className="field-hint">Minimum €5. Charged now, held until race day.</span>
      </div>
      <div className="field">
        <label>Message (optional)</label>
        <textarea placeholder={`A message for ${runnerName.split(' ')[0]}...`} value={message} onChange={e => setMessage(e.target.value)} rows={2} />
      </div>
      <div className="field">
        <label>Card details</label>
        <div style={{ background: 'var(--gray)', border: '1px solid var(--border)', padding: '0.85rem 1rem' }}>
          <CardElement options={{ style: { base: { color: '#ffffff', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', '::placeholder': { color: 'rgba(255,255,255,0.18)' } }, invalid: { color: '#ff6b6b' } } }} />
        </div>
        <span className="field-hint">Secured by Stripe. RacePace never sees your card number.</span>
      </div>
      {error && <p style={{ fontSize: '0.78rem', color: '#ff6b6b' }}>{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe}
        style={{ width: '100%', padding: '1.1rem', background: 'var(--green)', color: 'var(--black)', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', marginTop: '0.4rem', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Processing…' : `Pledge €${amount || '—'} to ${runnerName.split(' ')[0]}`}
      </button>
      <p style={{ fontSize: '0.68rem', color: 'var(--mid)', textAlign: 'center' }}>
        Your card is charged now. Funds are released on race day based on the result.
      </p>
    </form>
  )
}

export default function PledgeForm({ runnerId, runnerName }: { runnerId: string; runnerName: string }) {
  return (
    <Elements stripe={stripePromise}>
      <PledgeFormInner runnerId={runnerId} runnerName={runnerName} />
    </Elements>
  )
}
