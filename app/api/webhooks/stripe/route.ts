import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: unknown) {
    return Response.json({ error: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 400 })
  }

  const db = createServiceClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      // Confirm the pledge is recorded and still held
      await db.from('pledges')
        .update({ status: 'held' })
        .eq('stripe_payment_intent_id', pi.id)
        .eq('status', 'held')
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      // Remove failed pledge so it doesn't count toward funding total
      await db.from('pledges')
        .delete()
        .eq('stripe_payment_intent_id', pi.id)
        .eq('status', 'held')
      break
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      // When runner completes Stripe onboarding, activate their campaign
      if (account.details_submitted && account.charges_enabled) {
        await db.from('runners')
          .update({ status: 'active' })
          .eq('stripe_account_id', account.id)
          .eq('status', 'onboarding')
      }
      break
    }

    case 'transfer.created': {
      // Transfer to runner or charity — just log, status already updated in settle route
      break
    }

    default:
      // Unhandled event type — safe to ignore
  }

  return Response.json({ received: true })
}
