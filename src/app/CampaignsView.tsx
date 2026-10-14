import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { CampaignTrack } from '../campaign'
import type { GuidedCampaign } from '../guided-campaigns'
import { snakeSequence } from './snakeSequence'

export type CampaignSection = 'challenges' | 'practice'

function handleTabKeys(event: ReactKeyboardEvent<HTMLElement>, current: CampaignSection, onChange: (section: CampaignSection) => void) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const order: readonly CampaignSection[] = ['challenges', 'practice']
  const index = order.indexOf(current)
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : event.key === 'ArrowLeft' ? (index + 1) % 2 : (index + 1) % 2
  onChange(order[next])
  requestAnimationFrame(() => event.currentTarget.querySelector<HTMLElement>('[role="tab"][tabindex="0"]')?.focus())
}

interface CampaignsViewProps {
  readonly section: CampaignSection
  readonly guidedCampaigns: readonly GuidedCampaign[]
  readonly practiceTracks: readonly CampaignTrack[]
  readonly selectedTrackIndex: number
  readonly completedLevelIds: ReadonlySet<string>
  readonly overallPracticeCompleted: number
  readonly overallPracticeLevels: number
  readonly activePracticeTrackIndex: number
  readonly activePracticeLevelIndex: number
  readonly practiceSessionActive: boolean
  readonly onSectionChange: (section: CampaignSection) => void
  readonly onOpenLearn: () => void
  readonly onStartCampaign: (index: number) => void
  readonly onSelectPracticeTrack: (index: number) => void
  readonly onStartPractice: (levelIndex: number, trackIndex: number) => void
  readonly onResumePractice: () => void
}

export function CampaignsView({ section, guidedCampaigns, practiceTracks, selectedTrackIndex, completedLevelIds, overallPracticeCompleted, overallPracticeLevels, activePracticeTrackIndex, activePracticeLevelIndex, practiceSessionActive, onSectionChange, onOpenLearn, onStartCampaign, onSelectPracticeTrack, onStartPractice, onResumePractice }: CampaignsViewProps) {
  const selectedTrack = practiceTracks[selectedTrackIndex] ?? practiceTracks[0]
  const selectedCompleted = selectedTrack.levels.filter((level) => completedLevelIds.has(level.id)).length
  const nextLevelIndex = selectedTrack.levels.findIndex((level) => !completedLevelIds.has(level.id))

  return <section className="content-screen campaign-screen editorial-screen" aria-labelledby="campaign-screen-title">
    <header className="editorial-heading campaign-index-heading">
      <div>
        <h1 id="campaign-screen-title">Campaigns</h1>
        <p>Sequences of missions about countermodels, frame conditions, and formula construction.</p>
      </div>
      <div className="learn-callout"><strong>New to modal logic?</strong><button type="button" className="text-button" onClick={onOpenLearn}>Open Learn →</button></div>
    </header>

    <div className="campaign-section-tabs" role="tablist" aria-label="Campaign sections" onKeyDown={(event) => handleTabKeys(event, section, onSectionChange)}>
      {([['challenges', 'Campaigns'], ['practice', 'Practice']] as const).map(([value, label]) => <button key={value} type="button" role="tab" tabIndex={section === value ? 0 : -1} aria-selected={section === value} aria-controls={`campaign-${value}`} className={section === value ? 'active' : ''} onClick={() => onSectionChange(value)}>{label}</button>)}
    </div>

    {section === 'challenges' && <section className="campaign-block" id="campaign-challenges" role="tabpanel" aria-labelledby="challenges-block-title">
      <div className="index-section-heading"><h2 id="challenges-block-title">Choose a campaign</h2></div>
      <div className="campaign-challenge-list">{snakeSequence(guidedCampaigns.map((campaign, index) => ({ campaign, index }))).map(({ item: { campaign, index }, link }) => {
        const completed = campaign.levels.filter((level) => completedLevelIds.has(level.id)).length
        return <article className={`sequence-orb ${completed === campaign.levels.length ? 'complete' : ''}`} data-sequence-link={link} key={campaign.id}>
          <div><h3>{campaign.title}</h3><p>{campaign.description}</p><small>{completed}/{campaign.levels.length} missions complete</small></div>
          <button type="button" className="campaign-launch" onClick={() => onStartCampaign(index)}>{completed === campaign.levels.length ? 'Replay campaign' : completed ? 'Continue campaign' : 'Start campaign'}</button>
        </article>
      })}</div>
    </section>}

    {section === 'practice' && <section className="campaign-block" id="campaign-practice" role="tabpanel" aria-labelledby="practice-block-title">
      <div className="track-heading">
        <div><h2 id="practice-block-title">Practice</h2><p>Choose a sequence, then open any mission without leaving Campaigns.</p></div>
        <div className="collection-progress relational-progress"><strong>{overallPracticeCompleted}<span>/</span>{overallPracticeLevels}</strong><span>practice missions complete</span></div>
      </div>
      <div className="campaign-browser">
        <aside className="track-list" aria-label="Practice campaign list">{snakeSequence(practiceTracks.map((track, index) => ({ track, index }))).map(({ item: { track, index }, link }) => {
          const completed = track.levels.filter((level) => completedLevelIds.has(level.id)).length
          return <button type="button" className={`sequence-orb ${selectedTrackIndex === index ? 'active' : ''}`} data-sequence-link={link} aria-pressed={selectedTrackIndex === index} onClick={() => onSelectPracticeTrack(index)} key={track.id}>
            <strong>{track.title}</strong><span className="track-description">{track.description}</span><span>{completed}/{track.levels.length} complete</span>
          </button>
        })}</aside>
        <div className="track-detail">
          <div className="track-heading">
            <div><h3>{selectedTrack.title}</h3><p>{selectedTrack.description}</p></div>
            <button type="button" className="primary-action" onClick={() => onStartPractice(nextLevelIndex < 0 ? 0 : nextLevelIndex, selectedTrackIndex)}>{selectedCompleted === 0 ? 'Start practice' : selectedCompleted === selectedTrack.levels.length ? 'Replay sequence' : 'Continue practice'}</button>
          </div>
          <div className="level-browser">{snakeSequence(selectedTrack.levels.map((level, index) => ({ level, index }))).map(({ item: { level, index }, link }) => <article className={`sequence-orb ${completedLevelIds.has(level.id) ? 'complete' : ''}`} data-sequence-link={link} key={level.id}>
            <div><h4>{level.title}</h4><p>{level.concept}</p></div>
            <button type="button" className="mission-launch" onClick={() => practiceSessionActive && activePracticeTrackIndex === selectedTrackIndex && activePracticeLevelIndex === index ? onResumePractice() : onStartPractice(index, selectedTrackIndex)}>{practiceSessionActive && activePracticeTrackIndex === selectedTrackIndex && activePracticeLevelIndex === index ? 'Resume' : completedLevelIds.has(level.id) ? 'Replay' : 'Practice'}</button>
          </article>)}</div>
        </div>
      </div>
    </section>}
  </section>
}
