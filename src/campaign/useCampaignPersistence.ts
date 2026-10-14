import { useEffect, useState } from 'react'
import { campaignTracks, legacyTutorialLevelIds, tutorialLevels } from '../campaign'
import { guidedCampaigns } from '../guided-campaigns'

export type AttemptFailureCategory = 'missing-answer' | 'construction' | 'frame-configuration' | 'frame-property' | 'objective' | 'required-answer' | 'syntax-or-model' | 'wrong-world' | 'missing-diamond-witness' | 'unwanted-diamond-witness' | 'box-counterexample' | 'vacuous-box' | 'model-global-counterexample' | 'frame-countervaluation' | 'frame-validity-quantification' | 'correspondence-mismatch'

export interface HistoryEntry {
  readonly id: string
  readonly timestamp: string
  readonly mode: string
  readonly levelId?: string
  readonly title: string
  readonly scope: string
  readonly success: boolean
  readonly worldCount: number
  readonly edgeCount: number
  readonly trueAtomCount?: number
  readonly semanticChanges?: number
  readonly bonusAchieved?: boolean
  readonly concept?: string
  readonly failureCategory?: AttemptFailureCategory
}

export interface GuestProfile {
  readonly id: string
  readonly createdAt: string
  readonly history: readonly HistoryEntry[]
  readonly solutionSignatures: Readonly<Record<string, readonly string[]>>
}

const campaignProgressKey = 'logic-game:campaign-progress:v2'
const legacyCampaignProgressKey = 'logic-game:campaign-progress:v1'
const campaignContentRevisionKey = 'logic-game:campaign-content-revision:v1'
const campaignAssistanceKey = 'logic-game:campaign-assistance:v1'
const guestProfileKey = 'logic-game:guest-profile:v1'
export const currentCampaignContentRevision = 2
const revisedCampaignLevelIds = new Set(['tutorial-v2-valuation'])
const knownCampaignLevelIds = new Set([...tutorialLevels, ...campaignTracks.flatMap((track) => track.levels), ...guidedCampaigns.flatMap((campaign) => campaign.levels)].map((level) => level.id))

export const createLocalId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export function normalizeGuestProfile(value: unknown): GuestProfile {
  const guest = value as Partial<GuestProfile> | undefined
  if (!guest || typeof guest.id !== 'string' || typeof guest.createdAt !== 'string' || !Array.isArray(guest.history)) throw new Error('Invalid guest profile backup.')
  const history = guest.history.filter((entry): entry is HistoryEntry => Boolean(entry && typeof entry.id === 'string' && typeof entry.timestamp === 'string' && typeof entry.title === 'string' && typeof entry.success === 'boolean')).slice(0, 250)
  const rawSolutions = guest.solutionSignatures && typeof guest.solutionSignatures === 'object' ? guest.solutionSignatures : {}
  const solutionSignatures = Object.fromEntries(Object.entries(rawSolutions).filter(([, signatures]) => Array.isArray(signatures)).map(([levelId, signatures]) => [levelId, [...new Set((signatures as unknown[]).filter((signature): signature is string => typeof signature === 'string'))].slice(0, 25)]))
  return { id: guest.id, createdAt: guest.createdAt, history, solutionSignatures }
}

export function filterCampaignProgressIds(ids: readonly string[], contentRevision = 1): string[] {
  return ids.filter((id) => knownCampaignLevelIds.has(id) && (contentRevision >= currentCampaignContentRevision || !revisedCampaignLevelIds.has(id)))
}

export const isKnownCampaignLevelId = (id: string) => knownCampaignLevelIds.has(id)

function loadGuestProfile(): GuestProfile {
  try {
    return normalizeGuestProfile(JSON.parse(localStorage.getItem(guestProfileKey) ?? 'null'))
  } catch {
    return { id: createLocalId(), createdAt: new Date().toISOString(), history: [], solutionSignatures: {} }
  }
}

function loadCampaignProgress(): ReadonlySet<string> {
  try {
    const stored = JSON.parse(localStorage.getItem(campaignProgressKey) ?? localStorage.getItem(legacyCampaignProgressKey) ?? '[]')
    const storedContentRevision = Number(localStorage.getItem(campaignContentRevisionKey) ?? 1)
    const legacyTutorialIds = new Set<string>(legacyTutorialLevelIds)
    const migrated = Array.isArray(stored) ? filterCampaignProgressIds(stored.filter((id): id is string => typeof id === 'string').filter((id) => !legacyTutorialIds.has(id)), storedContentRevision) : []
    localStorage.setItem(campaignContentRevisionKey, String(currentCampaignContentRevision))
    return new Set(migrated)
  } catch {
    return new Set()
  }
}

function loadCampaignAssistance(): ReadonlySet<string> {
  try {
    const stored = JSON.parse(localStorage.getItem(campaignAssistanceKey) ?? '[]')
    return new Set(Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

export function useCampaignPersistence() {
  const [referenceSolutionViewed, setReferenceSolutionViewed] = useState<ReadonlySet<string>>(loadCampaignAssistance)
  const [completedLevelIds, setCompletedLevelIds] = useState<ReadonlySet<string>>(loadCampaignProgress)
  const [guestProfile, setGuestProfile] = useState<GuestProfile>(loadGuestProfile)

  useEffect(() => {
    try { localStorage.setItem(campaignProgressKey, JSON.stringify([...completedLevelIds])) } catch { /* Progress remains available for this session. */ }
  }, [completedLevelIds])

  useEffect(() => {
    try { localStorage.setItem(campaignAssistanceKey, JSON.stringify([...referenceSolutionViewed])) } catch { /* Assistance state remains available for this session. */ }
  }, [referenceSolutionViewed])

  useEffect(() => {
    try { localStorage.setItem(guestProfileKey, JSON.stringify(guestProfile)) } catch { /* History remains available for this session. */ }
  }, [guestProfile])

  return {
    referenceSolutionViewed, setReferenceSolutionViewed,
    completedLevelIds, setCompletedLevelIds,
    guestProfile, setGuestProfile,
  }
}
