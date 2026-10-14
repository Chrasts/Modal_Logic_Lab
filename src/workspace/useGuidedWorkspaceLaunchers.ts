import type { Dispatch, SetStateAction } from 'react'
import { campaignTracks, tutorialLevels, type GameLevel } from '../campaign'
import { guidedCampaigns } from '../guided-campaigns'
import { learnLessons } from '../learn'
import type { LearnProgress } from '../learn-progress'
import type { AppView } from '../app/app-navigation'

type WorkspaceGameMode = 'sandbox' | 'tutorial' | 'learn' | 'campaign' | 'guidedCampaign' | 'custom' | 'author'

interface GuidedWorkspaceLaunchersOptions {
  readonly gameMode: WorkspaceGameMode
  readonly campaignTrackIndex: number
  readonly guidedCampaignIndex: number
  readonly completedLevelIds: ReadonlySet<string>
  readonly learnProgress: LearnProgress
  readonly captureSandbox: () => void
  readonly loadLevel: (index: number, levels: readonly GameLevel[]) => void
  readonly setGameMode: Dispatch<SetStateAction<WorkspaceGameMode>>
  readonly setCampaignTrackIndex: Dispatch<SetStateAction<number>>
  readonly setPlayingTrackIndex: Dispatch<SetStateAction<number | null>>
  readonly setGuidedCampaignIndex: Dispatch<SetStateAction<number>>
  readonly setGuidedHintLevel: Dispatch<SetStateAction<number>>
  readonly setLearnTransferActive: Dispatch<SetStateAction<boolean>>
  readonly setLearnHintLevel: Dispatch<SetStateAction<number>>
  readonly setPredictionAnswer: Dispatch<SetStateAction<string>>
  readonly setLearnProgress: Dispatch<SetStateAction<LearnProgress>>
  readonly setLearnConceptOpen: Dispatch<SetStateAction<boolean>>
  readonly setAppView: Dispatch<SetStateAction<AppView>>
}

/** Starts guided content through the shared workspace-level loading boundary. */
export function useGuidedWorkspaceLaunchers(options: GuidedWorkspaceLaunchersOptions) {
  const startGuidedLevel = (mode: 'tutorial' | 'campaign', index: number, trackIndex = options.campaignTrackIndex) => {
    if (options.gameMode === 'sandbox') options.captureSandbox()
    if (mode === 'campaign') options.setCampaignTrackIndex(trackIndex)
    if (mode === 'campaign') options.setPlayingTrackIndex(trackIndex)
    options.setGameMode(mode)
    options.loadLevel(index, mode === 'tutorial' ? tutorialLevels : campaignTracks[trackIndex].levels)
    options.setAppView('workspace')
  }

  const startGuidedCampaign = (index = options.guidedCampaignIndex) => {
    const campaign = guidedCampaigns[index]
    if (!campaign) return
    if (options.gameMode === 'sandbox') options.captureSandbox()
    options.setGuidedCampaignIndex(index)
    options.setGameMode('guidedCampaign')
    options.setGuidedHintLevel(1)
    const nextLevel = campaign.levels.findIndex((level) => !options.completedLevelIds.has(level.id))
    options.loadLevel(nextLevel < 0 ? 0 : nextLevel, campaign.levels)
    options.setAppView('workspace')
  }

  const startLearnLesson = (index: number) => {
    const lesson = learnLessons[index]
    if (!lesson) return
    if (options.gameMode === 'sandbox') options.captureSandbox()
    options.setGameMode('learn')
    options.setLearnTransferActive(false)
    options.setLearnHintLevel(0)
    options.setPredictionAnswer(options.learnProgress.predictionAnswers[lesson.id] ?? '')
    options.setLearnProgress((current) => ({ ...current, currentLessonId: lesson.id, highestStageByLesson: { ...current.highestStageByLesson, [lesson.id]: Math.max(current.highestStageByLesson[lesson.id] ?? 0, 0) } }))
    options.loadLevel(index, learnLessons.map(({ task }) => task))
    options.setLearnConceptOpen(true)
    options.setAppView('workspace')
  }

  const startLearnTransfer = (lessonId: string) => {
    const index = learnLessons.findIndex((lesson) => lesson.id === lessonId)
    const lesson = learnLessons[index]
    if (!lesson?.transferTask) return
    options.setGameMode('learn')
    options.setLearnTransferActive(true)
    options.setLearnHintLevel(0)
    options.loadLevel(index, learnLessons.map((item) => item.id === lessonId ? { ...lesson.transferTask!, prediction: undefined } : item.task))
    options.setLearnConceptOpen(false)
    options.setAppView('workspace')
  }

  return { startGuidedLevel, startGuidedCampaign, startLearnLesson, startLearnTransfer }
}
