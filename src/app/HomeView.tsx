import './HomeView.css'

export interface HomeCurrentSession {
  readonly kind: 'lesson' | 'mission'
  readonly title: string
  readonly context?: string
}

export function HomeView({ language = 'en', completed, total, nextTitle, currentSession, onResume, onLearn, onCampaigns, onLab }: {
  readonly language?: 'en' | 'cs'
  readonly completed: number
  readonly total: number
  readonly nextTitle?: string
  readonly onLearn: () => void
  readonly onCampaigns: () => void
  readonly onLab: () => void
  readonly currentSession?: HomeCurrentSession
  readonly onResume?: () => void
}) {
  const cs = language === 'cs'
  const copy = cs
    ? { learn: 'Výuka', campaigns: 'Kampaně', lab: 'Laboratoř', complete: 'splněno', courseComplete: 'Kurz dokončen', next: 'Další', openCampaigns: 'Otevřít kampaně', openLab: 'Otevřít laboratoř' }
    : { learn: 'Learn', campaigns: 'Campaigns', lab: 'Lab', complete: 'complete', courseComplete: 'Course complete', next: 'Next', openCampaigns: 'Open Campaigns', openLab: 'Open Lab' }
  return <section className="content-screen home-screen home-screen--redesigned" aria-labelledby="home-title">
    <header className="home-hero">
      <h1 id="home-title" aria-label="Modal Logic Lab - Interactive Kripke Models">Modal Logic Lab</h1>
    </header>

    {currentSession && onResume && <aside className="home-resume-region" aria-label="Continue current session">
      <button
        type="button"
        className="home-resume-strip"
        aria-label={`Resume ${currentSession.kind}: ${currentSession.title}`}
        onClick={onResume}
      >
        <span className="home-resume-kicker">Continue</span>
        <span className="home-resume-session">
          <strong>{currentSession.title}</strong>
          {currentSession.context && <small>{currentSession.context}</small>}
        </span>
        <span className="home-resume-action">Resume →</span>
      </button>
    </aside>}

    <nav className="home-actions home-primary-actions" aria-label="Main activities">
      <article className="home-destination home-destination--learn">
        <span className="home-destination-heading-row">
          <span className="home-destination-title">{copy.learn}</span>
          <span className="home-destination-arrow" aria-hidden="true">↗</span>
        </span>
        <span className="home-destination-summary" id="home-learn-description">{cs ? 'Modální logika krok za krokem.' : 'Modal logic step by step.'}</span>
        <span className="home-learn-progress" aria-label={`${completed}/${total} complete. ${completed === total ? 'Course complete' : `Next: ${nextTitle ?? 'Learn overview'}`}`}>
          <strong>{completed}/{total} {copy.complete}</strong>
          <span>{completed === total ? copy.courseComplete : `${copy.next}: ${nextTitle ?? copy.learn}`}</span>
        </span>
        <button
          type="button"
          className="home-destination-hitbox"
          aria-label="Start or continue Learn Modal Logic"
          aria-describedby="home-learn-description"
          onClick={onLearn}
        >{cs ? 'VÝUKA' : 'LEARN'}</button>
      </article>

      <article className="home-destination home-destination--campaigns">
        <span className="home-destination-heading-row">
          <span className="home-destination-title">{copy.campaigns}</span>
          <span className="home-destination-arrow" aria-hidden="true">↗</span>
        </span>
        <span className="home-destination-summary" id="home-campaigns-description">{cs ? 'Pokročilé a specializované mise.' : 'Advanced, specialized missions.'}</span>
        <button
          type="button"
          className="home-destination-hitbox"
          aria-label="Campaigns: longer challenges and focused practice"
          aria-describedby="home-campaigns-description"
          onClick={onCampaigns}
        >{copy.openCampaigns}</button>
      </article>

      <article className="home-destination home-destination--lab">
        <span className="home-destination-heading-row">
          <span className="home-destination-title">{copy.lab}</span>
          <span className="home-destination-arrow" aria-hidden="true">↗</span>
        </span>
        <span className="home-destination-summary" id="home-lab-description">{cs ? 'Plný sandbox se všemi nástroji pro modelování a analýzu.' : 'Full sandbox with all modeling and analysis tools.'}</span>
        <button
          type="button"
          className="home-destination-hitbox"
          aria-label="Lab: experiment with models and formulas"
          aria-describedby="home-lab-description"
          onClick={onLab}
        >{copy.openLab}</button>
      </article>
    </nav>
  </section>
}
