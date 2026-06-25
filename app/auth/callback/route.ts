import { NextRequest } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createAuthClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Auth failed — send back to login with error flag
      return Response.redirect(new URL('/login?error=auth', req.url))
    }
  }

  // Redirect relative to request URL — works on any domain (race-pace.run or localhost)
  return Response.redirect(new URL('/dashboard', req.url))
}
