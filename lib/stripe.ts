import Stripe from 'stripe'

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  return new Stripe(key, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2024-06-20' as any,
  })
}


export function toSeconds(hms: string): number {
  const [h, m, s] = hms.split(':').map(Number)
  return h * 3600 + m * 60 + (s || 0)
}
