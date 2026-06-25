import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

// Lazy singleton — safe for browser and server (env vars available at runtime)
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _supabase
}

// Backwards-compat default export used in server components (SSR always has env vars)
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
}

// Server-side client with service role (bypasses RLS) — only use in API routes
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export type Runner = {
  id: string
  name: string
  email: string
  race_name: string
  race_date: string
  goal_time: string        // stored as HH:MM:SS
  goal_seconds: number
  funding_goal: number
  charity_id: string | null
  stripe_account_id: string | null
  strava_link: string | null
  slug: string
  status: 'onboarding' | 'active' | 'complete'
  created_at: string
}

export type Pledge = {
  id: string
  runner_id: string
  donor_name: string
  donor_email: string
  amount: number           // in euros (not cents)
  message: string | null
  stripe_payment_intent_id: string
  status: 'held' | 'released_to_runner' | 'donated_to_charity' | 'refunded'
  created_at: string
}

export type Result = {
  runner_id: string
  finish_time: string | null  // HH:MM:SS, null = DNF/DNS
  status: 'finished' | 'dnf' | 'dns'
  verified_by: string
  verified_at: string
}

export type Charity = {
  id: string
  name: string
  description: string
  stripe_account_id: string | null
}
