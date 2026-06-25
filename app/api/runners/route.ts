import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { sendWelcomeEmail } from '@/lib/email'

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('runners')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ runners: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, raceName, raceDate, goalTime, goalSeconds, fundingGoal, stravaLink, slug } = body

  if (!name || !email || !raceName || !raceDate || !goalSeconds || !fundingGoal || !slug) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = createServiceClient()

  // Check for duplicate email
  const { data: existing } = await db.from('runners').select('id').eq('email', email).single()
  if (existing) return Response.json({ error: 'A campaign already exists for this email.' }, { status: 409 })

  // Create Stripe Connect Express account
  let stripeAccountId: string
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'NL',
      email,
      capabilities: { transfers: { requested: true } },
      business_type: 'individual',
      metadata: { slug },
    })
    stripeAccountId = account.id
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Stripe account creation failed:', msg)
    return Response.json({ error: msg }, { status: 500 })
  }

  // Insert runner
  const { data: runner, error: dbError } = await db.from('runners').insert({
    name,
    email,
    race_name: raceName,
    race_date: raceDate,
    goal_time: goalTime,
    goal_seconds: goalSeconds,
    funding_goal: fundingGoal,
    strava_link: stravaLink,
    slug,
    stripe_account_id: stripeAccountId,
    status: 'onboarding',
    is_founding: true,
  }).select().single()

  if (dbError) return Response.json({ error: dbError.message }, { status: 500 })

  // Create Supabase auth user so runner can log in to dashboard
  await db.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name, runner_id: runner.id, slug },
  })

  // Send welcome email (non-blocking — don't fail signup if email fails)
  sendWelcomeEmail({ to: email, name, slug, raceName, goalTime }).catch(console.error)

  // Generate Stripe Connect onboarding URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${appUrl}/signup?refresh=true`,
    return_url: `${appUrl}/onboarding-complete?slug=${slug}`,
    type: 'account_onboarding',
  })

  return Response.json({ runner, onboardingUrl: accountLink.url })
}
