import { useState } from 'react'
import type { GameLevel } from '../campaign'
import type { ParsedCustomLevelFile } from '../level-format'

/** Browser-local authoring collection, kept apart from the active workspace. */
export function useCustomMissionLibrary() {
  const [customLevels, setCustomLevels] = useState<readonly GameLevel[]>([])
  const [customCampaignTitle, setCustomCampaignTitle] = useState('Custom campaign')
  const [customCampaignDescription, setCustomCampaignDescription] = useState('A user-authored sequence of modal logic missions.')
  const [authoredCampaignMissions, setAuthoredCampaignMissions] = useState<readonly ParsedCustomLevelFile[]>([])

  return {
    customLevels, setCustomLevels,
    customCampaignTitle, setCustomCampaignTitle,
    customCampaignDescription, setCustomCampaignDescription,
    authoredCampaignMissions, setAuthoredCampaignMissions,
  }
}
