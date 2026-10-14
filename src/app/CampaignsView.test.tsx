// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { campaignTracks } from '../campaign'
import { guidedCampaigns } from '../guided-campaigns'
import { CampaignsView } from './CampaignsView'

afterEach(cleanup)

const baseProps: Parameters<typeof CampaignsView>[0] = {
  section: 'challenges', guidedCampaigns, practiceTracks: campaignTracks, selectedTrackIndex: 0,
  completedLevelIds: new Set(), overallPracticeCompleted: 0,
  overallPracticeLevels: campaignTracks.reduce((sum, track) => sum + track.levels.length, 0),
  activePracticeTrackIndex: 0, activePracticeLevelIndex: 0, practiceSessionActive: false,
  onSectionChange: vi.fn(), onStartCampaign: vi.fn(),
  onSelectPracticeTrack: vi.fn(), onStartPractice: vi.fn(), onResumePractice: vi.fn(),
}

describe('CampaignsView', () => {
  it('switches between Campaigns and Practice through its controller callback', () => {
    const onSectionChange = vi.fn()
    render(<CampaignsView {...baseProps} onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Practice' }))
    expect(onSectionChange).toHaveBeenCalledWith('practice')
  })

  it('renders each campaign as an unnumbered launch choice without availability copy', () => {
    const onStartCampaign = vi.fn()
    render(<CampaignsView {...baseProps} onStartCampaign={onStartCampaign} />)

    expect(screen.queryByText(`${guidedCampaigns.length} available`)).not.toBeInTheDocument()
    expect(screen.queryByText('01')).not.toBeInTheDocument()
    expect(screen.queryByText('Choose a campaign')).not.toBeInTheDocument()
    expect(screen.queryByText('New to modal logic?')).not.toBeInTheDocument()
    expect(document.querySelector('.campaign-challenge-list .sequence-orb')).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Start campaign' })).toHaveLength(guidedCampaigns.length)

    fireEvent.click(screen.getAllByRole('button', { name: 'Start campaign' })[0])
    expect(onStartCampaign).toHaveBeenCalledWith(0)
  })

  it('shows only playable Practice tracks and clickable mission circles, without a summary circle', () => {
    const onSelectPracticeTrack = vi.fn()
    const onStartPractice = vi.fn()
    const practiceTracks = [...campaignTracks, { ...campaignTracks[0], id: 'future', title: 'Future placeholder', levels: [] }]
    render(<CampaignsView {...baseProps} section="practice" practiceTracks={practiceTracks} onSelectPracticeTrack={onSelectPracticeTrack} onStartPractice={onStartPractice} />)
    const trackList = screen.getByLabelText('Practice campaign list')
    expect(trackList.querySelectorAll('button.practice-track-choice')).toHaveLength(campaignTracks.length)
    expect(screen.queryByText('Future placeholder')).not.toBeInTheDocument()
    expect(document.querySelector('.track-detail > .track-heading')).toBeNull()
    expect(document.querySelector('.practice-track-summary')).toBeInTheDocument()
    expect(document.querySelector('.campaign-browser .sequence-orb')).toBeNull()

    const firstMission = screen.getByRole('button', { name: 'Necessary, not actual: Practice' })
    expect(firstMission).toHaveClass('practice-mission-choice')
    fireEvent.click(firstMission)
    expect(onStartPractice).toHaveBeenCalledWith(0, 0)

    fireEvent.click(trackList.querySelectorAll('button')[1])
    expect(onSelectPracticeTrack).toHaveBeenCalledWith(1)
  })
})
