import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const db = createServiceClient()

  const { data: runner } = await db
    .from('runners')
    .select('*, charities(name)')
    .eq('email', user.email!)
    .single()

  if (!runner) redirect('/signup')

  const { data: pledges } = await db
    .from('pledges')
    .select('*')
    .eq('runner_id', runner.id)
    .order('created_at', { ascending: false })

  const { data: result } = await db
    .from('results')
    .select('*')
    .eq('runner_id', runner.id)
    .single()

  return <DashboardClient runner={runner} pledges={pledges ?? []} result={result} />
}
