import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const db = createServiceClient()
  const { data, error } = await db
    .from('pledges')
    .select('amount')
    .eq('runner_id', id)
    .eq('status', 'held')
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const totalEuros = data.reduce((sum, p) => sum + p.amount, 0)
  return Response.json({ total_cents: totalEuros * 100, count: data.length })
}
