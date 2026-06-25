import { Suspense } from 'react'
import OnboardingCompleteInner from './OnboardingCompleteInner'

export default function OnboardingCompletePage() {
  return (
    <Suspense fallback={null}>
      <OnboardingCompleteInner />
    </Suspense>
  )
}
