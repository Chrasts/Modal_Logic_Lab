import type { Dispatch, SetStateAction } from 'react'
import type { GameLevel } from '../campaign'
import { createLocalId, type AttemptFailureCategory, type GuestProfile, type HistoryEntry } from '../campaign/useCampaignPersistence'
import { learnCourse, type LearnLesson } from '../learn'
import type { LearnProgress } from '../learn-progress'

interface AttemptContext {
  readonly authorWorkspaceActive: boolean
  readonly authorPlaytest: boolean
  readonly gameMode: string
  readonly activeLevel?: GameLevel
  readonly evaluationScope: string
  readonly worldCount: number
  readonly edgeCount: number
  readonly trueAtomCount?: number
  readonly semanticChanges?: number
  readonly courseLesson?: LearnLesson
  readonly learnTransferActive: boolean
  readonly setGuestProfile: Dispatch<SetStateAction<GuestProfile>>
  readonly setGuidedHintLevel: Dispatch<SetStateAction<number>>
  readonly setLearnProgress: Dispatch<SetStateAction<LearnProgress>>
}

/** Persist one verification outcome and advance campaign/Learn session state. */
export function recordWorkspaceAttempt(context: AttemptContext, success: boolean, bonusAchieved?: boolean, failureCategory?: AttemptFailureCategory) {
  if (context.authorWorkspaceActive || context.authorPlaytest || context.gameMode === 'author') return
  const entry: HistoryEntry = {
    id: createLocalId(), timestamp: new Date().toISOString(), mode: context.gameMode,
    levelId: context.activeLevel?.id, title: context.activeLevel?.title ?? 'Model Sandbox verification',
    scope: context.evaluationScope, success, worldCount: context.worldCount, edgeCount: context.edgeCount,
    trueAtomCount: context.trueAtomCount, semanticChanges: context.semanticChanges, bonusAchieved,
    concept: context.activeLevel?.concept ?? `${context.evaluationScope} sandbox`,
    failureCategory: success ? undefined : failureCategory,
  }
  context.setGuestProfile((current) => ({ ...current, history: [entry, ...current.history].slice(0, 250) }))
  if (context.gameMode === 'guidedCampaign' && !success) context.setGuidedHintLevel((current) => Math.min(3, current + 1))
  if (!context.courseLesson) return

  context.setLearnProgress((current) => {
    const completedLessonIds = success && !context.learnTransferActive && !current.completedLessonIds.includes(context.courseLesson!.id) ? [...current.completedLessonIds, context.courseLesson!.id] : current.completedLessonIds
    const chapter = learnCourse.chapters.find(({ id }) => id === context.courseLesson!.chapterId)
    const completedChapterIds = chapter && chapter.lessons.length > 0 && chapter.lessons.every((lesson) => completedLessonIds.includes(lesson.id)) && !current.completedChapterIds.includes(chapter.id) ? [...current.completedChapterIds, chapter.id] : current.completedChapterIds
    return {
      ...current,
      completedLessonIds,
      completedChapterIds,
      attemptsByLesson: { ...current.attemptsByLesson, [context.courseLesson!.id]: (current.attemptsByLesson[context.courseLesson!.id] ?? 0) + 1 },
      successfulAttemptsByLesson: success ? { ...current.successfulAttemptsByLesson, [context.courseLesson!.id]: (current.successfulAttemptsByLesson[context.courseLesson!.id] ?? 0) + 1 } : current.successfulAttemptsByLesson,
      transferCompletedLessonIds: success && context.learnTransferActive && !current.transferCompletedLessonIds.includes(context.courseLesson!.id) ? [...current.transferCompletedLessonIds, context.courseLesson!.id] : current.transferCompletedLessonIds,
      completedAt: success && !context.learnTransferActive ? { ...current.completedAt, [context.courseLesson!.id]: new Date().toISOString() } : current.completedAt,
      highestStageByLesson: { ...current.highestStageByLesson, [context.courseLesson!.id]: Math.max(current.highestStageByLesson[context.courseLesson!.id] ?? 0, success ? 4 : 3) },
    }
  })
}
