// Settlement formula from the brief:
// missPct = (finishSeconds - goalSeconds) / goalSeconds * 100
// missPct <= 2  → 100% to runner
// missPct > 2   → charityPct = min(100, missPct * 5); runner gets remainder
// DNF / DNS     → 100% to charity

const GRACE_PCT = 2
const PENALTY_MULTIPLIER = 5
const PLATFORM_FEE_PCT = 6 // waived for Founding 100 (handled via runner.founding flag)

export type Settlement = {
  runnerPct: number
  charityPct: number
  runnerAmountCents: number
  charityAmountCents: number
  platformFeeCents: number
}

export function computeSettlement(
  goalSeconds: number,
  finishSeconds: number | null, // null = DNF/DNS
  totalPledgedCents: number,
  isFounding: boolean,
): Settlement {
  let runnerPct: number
  let charityPct: number

  if (finishSeconds === null) {
    runnerPct = 0
    charityPct = 100
  } else {
    const missPct = Math.max(0, (finishSeconds - goalSeconds) / goalSeconds * 100)
    if (missPct <= GRACE_PCT) {
      runnerPct = 100
      charityPct = 0
    } else {
      charityPct = Math.min(100, missPct * PENALTY_MULTIPLIER)
      runnerPct = 100 - charityPct
    }
  }

  const feePct = isFounding ? 0 : PLATFORM_FEE_PCT
  const grossRunnerCents = Math.round(totalPledgedCents * runnerPct / 100)
  const platformFeeCents = Math.round(grossRunnerCents * feePct / 100)
  const runnerAmountCents = grossRunnerCents - platformFeeCents
  const charityAmountCents = Math.round(totalPledgedCents * charityPct / 100)

  return {
    runnerPct: Math.round(runnerPct),
    charityPct: Math.round(charityPct),
    runnerAmountCents,
    charityAmountCents,
    platformFeeCents,
  }
}
