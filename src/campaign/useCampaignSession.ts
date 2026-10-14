import { useState } from 'react'

type CampaignSection = 'challenges' | 'practice'

/** Navigation state for the public Campaigns and Practice views. */
export function useCampaignSession() {
  const [campaignSection, setCampaignSection] = useState<CampaignSection>('challenges')
  const [campaignLevelIndex, setCampaignLevelIndex] = useState(0)
  const [campaignTrackIndex, setCampaignTrackIndex] = useState(0)
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number | null>(null)
  const [guidedCampaignIndex, setGuidedCampaignIndex] = useState(0)
  const [guidedHintLevel, setGuidedHintLevel] = useState(0)

  return {
    campaignSection, setCampaignSection,
    campaignLevelIndex, setCampaignLevelIndex,
    campaignTrackIndex, setCampaignTrackIndex,
    playingTrackIndex, setPlayingTrackIndex,
    guidedCampaignIndex, setGuidedCampaignIndex,
    guidedHintLevel, setGuidedHintLevel,
  }
}
