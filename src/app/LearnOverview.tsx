import { useState, type ReactNode } from 'react'
import type { GameLevel } from '../campaign'
import type { ConceptQuestion, LearnCourse, LearnLesson } from '../learn'
import type { LearnProgress } from '../learn-progress'
import { snakeSequence } from './snakeSequence'

type LearnCollectionEntry =
  | { readonly kind: 'welcome' }
  | { readonly kind: 'controls' }
  | { readonly kind: 'chapter'; readonly chapter: LearnCourse['chapters'][number] }

function ChapterRecapQuestions({ questions }: { readonly questions: readonly ConceptQuestion[] }) {
  const [answers, setAnswers] = useState<Readonly<Record<number, string>>>({})
  return <div className="concept-recap" aria-label="Concept recap questions">
    <strong>Concept check</strong>
    {questions.map((question, index) => {
      const answer = answers[index]
      const correct = answer === question.correctChoice
      return <fieldset key={question.prompt}>
        <legend>{index + 1}. {question.prompt}</legend>
        <div>{question.choices.map((choice) => <button type="button" className={answer === choice ? 'selected' : ''} aria-pressed={answer === choice} key={choice} onClick={() => setAnswers((current) => ({ ...current, [index]: choice }))}>{choice}</button>)}</div>
        {answer && <p role="status" className={correct ? 'correct' : 'incorrect'}><b>{correct ? 'Correct.' : 'Not quite.'}</b> {question.explanation}</p>}
      </fieldset>
    })}
  </div>
}

function ChapterLessonPanel({ chapterId, title, children, onClose, restartLabel, onRestart }: {
  readonly chapterId: string
  readonly title: string
  readonly children: ReactNode
  readonly onClose: () => void
  readonly restartLabel?: string
  readonly onRestart?: () => void
}) {
  return <section id={`chapter-lessons-${chapterId}`} className="chapter-expanded" aria-label={`Lessons in ${title}`}>
    <header className="chapter-expanded-heading">
      <div><span>Selected section</span><h3>Lesson list</h3><p>{title}</p></div>
      <button type="button" className="text-button" onClick={onClose}>Close list</button>
    </header>
    <div className="chapter-lesson-outline">{children}</div>
    {onRestart && restartLabel && <footer className="chapter-expanded-actions"><button type="button" className="text-button" onClick={onRestart}>{restartLabel}</button></footer>}
  </section>
}

interface LearnOverviewProps {
  readonly completed: number
  readonly total: number
  readonly progress: LearnProgress
  readonly tutorialLevels: readonly GameLevel[]
  readonly tutorialCompleted: number
  readonly nextTutorialIndex: number
  readonly expandedChapterId: string | null
  readonly completedLevelIds: ReadonlySet<string>
  readonly course: LearnCourse
  readonly lessons: readonly LearnLesson[]
  readonly onContinue: () => void
  readonly onWelcome: () => void
  readonly onOpenControl: (index: number) => void
  readonly onRestartControls: () => void
  readonly onOpenLesson: (index: number) => void
  readonly onRestartChapter: (chapterId: string) => void
  readonly onToggleChapter: (chapterId: string) => void
}

export function LearnOverview({ completed, total, progress, tutorialLevels, tutorialCompleted, nextTutorialIndex, expandedChapterId, completedLevelIds, course, lessons, onContinue, onWelcome, onOpenControl, onRestartControls, onOpenLesson, onRestartChapter, onToggleChapter }: LearnOverviewProps) {
  const collectionEntries = snakeSequence<LearnCollectionEntry>([
    { kind: 'welcome' },
    { kind: 'controls' },
    ...course.chapters.map((chapter) => ({ kind: 'chapter' as const, chapter })),
  ])

  return <section className="content-screen learn-course-screen editorial-screen" aria-labelledby="learn-course-title">
    <header className="editorial-heading learn-index-heading">
      <div>
        <h1 id="learn-course-title">Learn Modal Logic</h1>
      </div>
      <div className="collection-progress relational-progress" role="status">
        <strong>{completed}/{total}</strong>
        <span>{completed === total ? 'course complete' : 'lessons complete'}</span>
        <div className="progress-meter" aria-hidden="true"><i style={{ width: `${completed / total * 100}%` }} /></div>
      </div>
      {completed < total && <button type="button" className="primary-action editorial-heading-action" onClick={onContinue}>{completed === 0 ? 'Start Learning' : 'Continue Learning'}</button>}
    </header>

    {expandedChapterId && <button type="button" className="chapter-focus-backdrop" aria-label="Close lesson list" onClick={() => onToggleChapter(expandedChapterId)} />}

    <div className="learn-chapter-list relational-chapter-path">
      {collectionEntries.map(({ item: entry, link }) => {
        if (entry.kind === 'welcome') return <article className="chapter-row sequence-orb" data-sequence-link={link} key="welcome">
          <div className="chapter-orb">
            <div className="chapter-copy"><h2>Welcome to Modal Logic</h2><p>Possible worlds, accessibility, possibility, necessity, and how guided tasks work.</p></div>
            <div className="chapter-actions"><button type="button" className={progress.welcomeViewed ? 'secondary-button' : 'primary-action'} onClick={onWelcome}>{progress.welcomeViewed ? 'Replay introduction' : 'Open introduction'}</button></div>
          </div>
        </article>

        if (entry.kind === 'controls') return <article className={`chapter-row sequence-orb ${tutorialCompleted === tutorialLevels.length ? 'complete ' : ''}${expandedChapterId === 'controls' ? 'expanded' : ''}`} data-sequence-link={link} key="controls">
          <div className="chapter-orb">
            <div className="chapter-copy"><h2>Learn the Controls</h2><p>Use the shared model editor before beginning semantic lessons.</p></div>
            <div className="chapter-actions"><button type="button" className={tutorialCompleted === tutorialLevels.length ? 'secondary-button' : 'primary-action'} onClick={() => onOpenControl(nextTutorialIndex < 0 ? 0 : nextTutorialIndex)}><span className="chapter-diamond-label">{tutorialCompleted === tutorialLevels.length ? 'Replay section' : tutorialCompleted > 0 ? 'Continue' : 'Start'}</span></button><div className="chapter-browse-action"><button type="button" className="text-button" aria-expanded={expandedChapterId === 'controls'} aria-controls="chapter-lessons-controls" onClick={() => onToggleChapter('controls')}>{expandedChapterId === 'controls' ? 'Hide lessons' : 'View lessons'}</button><small>{tutorialCompleted}/{tutorialLevels.length} lessons</small></div></div>
          </div>
          {expandedChapterId === 'controls' && <ChapterLessonPanel chapterId="controls" title="Learn the Controls" onClose={() => onToggleChapter('controls')} restartLabel="Restart section" onRestart={tutorialCompleted > 0 && tutorialCompleted < tutorialLevels.length ? onRestartControls : undefined}><ol>{tutorialLevels.map((level, index) => {
            const lessonComplete = completedLevelIds.has(level.id)
            const lessonCurrent = !lessonComplete && index === nextTutorialIndex
            return <li className={lessonComplete ? 'complete' : lessonCurrent ? 'current' : ''} key={level.id}><span><b>{level.title}</b><small>{lessonComplete ? 'Completed' : lessonCurrent ? 'Current' : 'Unfinished'}</small></span><button type="button" className={lessonComplete ? 'secondary-button' : 'text-button'} onClick={() => onOpenControl(index)}>{lessonComplete ? 'Replay' : 'Open'}</button></li>
          })}</ol></ChapterLessonPanel>}
        </article>

        const chapter = entry.chapter
        const chapterCompleted = chapter.lessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length
        const chapterComplete = chapterCompleted === chapter.lessons.length && chapter.lessons.length > 0
        const available = chapter.lessons.length > 0
        const currentIndex = lessons.findIndex((lesson) => lesson.chapterId === chapter.id && !progress.completedLessonIds.includes(lesson.id))
        const expanded = expandedChapterId === chapter.id
        return <article className={`chapter-row sequence-orb ${chapterComplete ? 'complete ' : ''}${expanded ? 'expanded' : ''}`} data-sequence-link={link} key={chapter.id}>
          <div className="chapter-orb">
            <div className="chapter-copy">
              <h2>{chapter.title}</h2>
              <p>{chapter.description}</p>
            </div>
            {available ? <div className="chapter-actions">
              <button type="button" className={chapterComplete ? 'secondary-button' : 'primary-action'} onClick={() => onOpenLesson(currentIndex < 0 ? lessons.findIndex((lesson) => lesson.chapterId === chapter.id) : currentIndex)}><span className="chapter-diamond-label">{chapterComplete ? 'Replay section' : chapterCompleted > 0 ? 'Continue' : 'Start'}</span></button>
              <div className="chapter-browse-action"><button type="button" className="text-button" aria-expanded={expanded} aria-controls={`chapter-lessons-${chapter.id}`} onClick={() => onToggleChapter(chapter.id)}>{expanded ? 'Hide lessons' : 'View lessons'}</button>{available && <small>{chapterCompleted}/{chapter.lessons.length} lessons</small>}</div>
            </div> : <span className="chapter-coming">Coming later</span>}
          </div>
          {expanded && <ChapterLessonPanel chapterId={chapter.id} title={chapter.title} onClose={() => onToggleChapter(chapter.id)} restartLabel="Restart section" onRestart={!chapterComplete && chapterCompleted > 0 ? () => onRestartChapter(chapter.id) : undefined}>
              <ol>{chapter.lessons.map((lesson) => {
                const lessonComplete = progress.completedLessonIds.includes(lesson.id)
                const lessonCurrent = progress.currentLessonId === lesson.id || (!chapterComplete && lessons[currentIndex]?.id === lesson.id)
                return <li className={lessonComplete ? 'complete' : lessonCurrent ? 'current' : ''} key={lesson.id}>
                  <span><b>{lesson.title}</b><small>{lessonComplete ? 'Completed' : lessonCurrent ? 'Current' : 'Unfinished'}</small></span>
                  <button type="button" className={lessonComplete ? 'secondary-button' : 'text-button'} onClick={() => onOpenLesson(lessons.findIndex(({ id }) => id === lesson.id))}>{lessonComplete ? 'Replay' : 'Open'}</button>
                </li>
              })}</ol>
              {chapterComplete && <div className="chapter-recap"><strong>Section recap</strong><ul>{chapter.completionSummary.map((item) => <li key={item}>{item}</li>)}</ul>{chapter.recapQuestions && <ChapterRecapQuestions questions={chapter.recapQuestions} />}{chapter.nextPreview && <p>{chapter.nextPreview}</p>}</div>}
            </ChapterLessonPanel>}
        </article>
      })}
    </div>
  </section>
}
