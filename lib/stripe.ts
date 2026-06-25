import Stripe from 'stripe'

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  return new Stripe(key, {
    apiVersion: '2024-06-20',
  })
}

export const stripe = getStripe()

export function toSeconds(hms: string): number {
  const [h, m, s] = hms.split(':').map(Number)
  return h * 3600 + m * 60 + (s || 0)
}
