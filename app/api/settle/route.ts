import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'
import { computeSettlement } from '@/lib/settlement'

export async function POST(req: NextRequest) {
  const { runnerId, finishTime, finishSeconds, status, verifiedBy } = await req.json()

  if (!runnerId || !status || !verifiedBy) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const stripe = getStripe()
  const db = createServiceClient()

  // Load runner
  const { data: runner, error: runnerErr } = await db
    .from('runners')
    .select('*, charities(stripe_account_id)')
    .eq('id', runnerId)
    .single()
  if (runnerErr || !runner) return Response.json({ error: 'Runner not found' }, { status: 404 })
  if (!runner.stripe_account_id) return Response.json({ error: 'Runner has not completed Stripe onboarding' }, { status: 400 })

  // Check no result already recorded
  const { data: existing } = await db.from('results').select('runner_id').eq('runner_id', runnerId).single()
  if (existing) return Response.json({ error: 'Result already recorded for this runner' }, { status: 409 })

  // Load all held pledges
  const { data: pledges, error: pledgeErr } = await db
    .from('pledges')
    .select('id, amount, stripe_payment_intent_id')
    .eq('runner_id', runnerId)
    .eq('status', 'held')
  if (pledgeErr) return Response.json({ error: pledgeErr.message }, { status: 500 })
  if (!pledges || pledges.length === 0) return Response.json({ error: 'No held pledges found' }, { status: 400 })

  const totalCents = pledges.reduce((sum, p) => sum + p.amount * 100, 0)

  const settlement = computeSettlement(
    runner.goal_seconds,
    status === 'finished' ? (finishSeconds ?? null) : null,
    totalCents,
    runner.is_founding,
  )

  const results: Record<string, unknown> = {
    runner: runner.name,
    status,
    goal: runner.goal_time,
    finish: finishTime ?? 'DNF/DNS',
    runnerPct: `${settlement.runnerPct}%`,
    charityPct: `${settlement.charityPct}%`,
    runnerAmount: `€${(settlement.runnerAmountCents / 100).toFixed(2)}`,
    charityAmount: `€${(settlement.charityAmountCents / 100).toFixed(2)}`,
    platformFee: `€${(settlement.platformFeeCents / 100).toFixed(2)}`,
  }

  // Record result first
  await db.from('results').insert({
    runner_id: runnerId,
    finish_time: finishTime ?? null,
    status,
    verified_by: verifiedBy,
  })

  // Transfer runner's share
  if (settlement.runnerAmountCents > 0) {
    try {
      await stripe.transfers.create({
        amount: settlement.runnerAmountCents,
        currency: 'eur',
        destination: runner.stripe_account_id,
        metadata: { runner_id: runnerId, type: 'runner_payout' },
      })
      results.runnerTransfer = 'sent'
    } catch (err: unknown) {
      results.runnerTransfer = `FAILED: ${err instanceof Error ? err.message : 'unknown'}`
    }
  }

  // Transfer charity's share
  const charityStripeId = (runner.charities as { stripe_account_id: string | null } | null)?.stripe_account_id
  if (settlement.charityAmountCents > 0 && charityStripeId) {
    try {
      await stripe.transfers.create({
        amount: settlement.charityAmountCents,
        currency: 'eur',
        destination: charityStripeId,
        metadata: { runner_id: runnerId, type: 'charity_payout' },
      })
      results.charityTransfer = 'sent'
    } catch (err: unknown) {
      results.charityTransfer = `FAILED: ${err instanceof Error ? err.message : 'unknown'}`
    }
  } else if (settlement.charityAmountCents > 0) {
    results.charityTransfer = 'SKIPPED — charity has no Stripe account'
  }

  // Mark all pledges as settled
  const newStatus = settlement.runnerPct > 0 ? 'released_to_runner' : 'donated_to_charity'
  await db.from('pledges')
    .update({ status: newStatus })
    .in('id', pledges.map(p => p.id))

  // Mark runner as complete
  await db.from('runners').update({ status: 'complete' }).eq('id', runnerId)

  return Response.json(results)
}
