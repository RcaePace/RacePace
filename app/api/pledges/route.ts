import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { runnerId, donorName, donorEmail, amount, message } = await req.json()

  if (!runnerId || !donorName || !donorEmail || !amount || amount < 5) {
    return Response.json({ error: 'Missing or invalid fields. Minimum pledge is €5.' }, { status: 400 })
  }

  const stripe = getStripe()
  const db = createServiceClient()

  // Verify runner exists and is active
  const { data: runner } = await db.from('runners').select('id, name, slug').eq('id', runnerId).eq('status', 'active').single()
  if (!runner) return Response.json({ error: 'Runner not found or campaign not active.' }, { status: 404 })

  // Create Stripe Payment Intent — capture immediately, funds sit on platform balance
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // euros → cents
    currency: 'eur',
    capture_method: 'automatic',
    metadata: {
      runner_id: runnerId,
      runner_slug: runner.slug,
      donor_name: donorName,
      donor_email: donorEmail,
    },
    description: `Pledge for ${runner.name} — RacePace`,
    receipt_email: donorEmail,
  })

  // Record pledge as held (webhook will confirm once payment succeeds)
  const { error: dbError } = await db.from('pledges').insert({
    runner_id: runnerId,
    donor_name: donorName,
    donor_email: donorEmail,
    amount, // euros
    message: message || null,
    stripe_payment_intent_id: paymentIntent.id,
    status: 'held',
  })

  if (dbError) {
    // Best-effort: cancel the payment intent if DB insert fails
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => null)
    return Response.json({ error: dbError.message }, { status: 500 })
  }

  return Response.json({ clientSecret: paymentIntent.client_secret })
}
