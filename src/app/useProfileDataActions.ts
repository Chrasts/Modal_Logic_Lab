import type { Dispatch, SetStateAction } from 'react'
import type { GuestProfile } from '../campaign/useCampaignPersistence'
import { createEducatorCsv } from '../educator-export'

interface ProfileDataActionsOptions {
  readonly guestProfile: GuestProfile
  readonly completedLevelIds: ReadonlySet<string>
  readonly contentRevision: number
  readonly setGuestProfile: Dispatch<SetStateAction<GuestProfile>>
  readonly downloadFile: (contents: string, filename: string, type: string) => void
}

/** Keeps profile-specific local export and history actions out of the application shell. */
export function useProfileDataActions({ guestProfile, completedLevelIds, contentRevision, setGuestProfile, downloadFile }: ProfileDataActionsOptions) {
  const downloadProfile = () => {
    const contents = JSON.stringify({
      format: 'logic-model-builder-profile', version: 1, contentRevision,
      guest: guestProfile, completedLevelIds: [...completedLevelIds],
    }, null, 2)
    downloadFile(contents, 'logic-model-builder-profile.json', 'application/json')
  }

  const downloadEducatorResults = () => {
    const csv = createEducatorCsv(guestProfile.id, guestProfile.history)
    downloadFile(csv, `logic-model-builder-results-${guestProfile.id.slice(0, 8)}.csv`, 'text/csv;charset=utf-8')
  }

  const clearLocalHistory = () => {
    if (!window.confirm('Clear this guest profile history? Learning progress will remain unchanged.')) return
    setGuestProfile((current) => ({ ...current, history: [] }))
  }

  return { downloadProfile, downloadEducatorResults, clearLocalHistory }
}
