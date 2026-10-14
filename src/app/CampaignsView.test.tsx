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

  it('renders campaign selection and mission list inside Practice', () => {
    const onSelectPracticeTrack = vi.fn()
    render(<CampaignsView {...baseProps} section="practice" onSelectPracticeTrack={onSelectPracticeTrack} />)
    expect(screen.getByLabelText('Practice campaign list')).toBeInTheDocument()
    expect(screen.queryByText('Choose a sequence, then open any mission without leaving Campaigns.')).not.toBeInTheDocument()
    expect(document.querySelector('.campaign-browser .sequence-orb')).toBeNull()
    expect(screen.getAllByRole('button', { name: 'Practice' }).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByLabelText('Practice campaign list').querySelectorAll('button')[1])
    expect(onSelectPracticeTrack).toHaveBeenCalledWith(1)
  })
})
