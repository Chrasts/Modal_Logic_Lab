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
    ? {
        kicker: 'Interaktivní Kripkeho sémantika',
        intro: 'Vytvářejte konečné Kripkeho modely, sledujte pravdivost formulí a zkoumejte vztah mezi světy, relacemi a modálními principy.',
        choose: 'Zvolte směr',
        learn: 'Výuka',
        learnSummary: 'Systematická cesta modální logikou a Kripkeho sémantikou.',
        campaigns: 'Kampaně',
        campaignsSummary: 'Delší úlohy a cílené procvičování.',
        lab: 'Laboratoř',
        labSummary: 'Volná konstrukce a analýza konečných modelů.',
        complete: 'splněno',
        next: 'další',
        courseComplete: 'kurz dokončen',
        continue: 'Pokračovat',
      }
    : {
        kicker: 'Interactive Kripke semantics',
        intro: 'Build finite Kripke models, trace formula truth, and explore the relation between worlds, accessibility, and modal principles.',
        choose: 'Choose a path',
        learn: 'Learn',
        learnSummary: 'A structured path through modal logic and Kripke semantics.',
        campaigns: 'Campaigns',
        campaignsSummary: 'Advanced, specialized missions.',
        lab: 'Lab',
        labSummary: 'Full sandbox with all modeling and analysis tools.',
        complete: 'complete',
        next: 'Next',
        courseComplete: 'course complete',
        continue: 'Continue',
      }


  return <section className="content-screen home-screen home-screen--relational" aria-labelledby="home-title">
    <div className="home-layout">
      <header className="home-intro">
        <p className="eyebrow">{copy.kicker}</p>
        <h1 id="home-title" aria-label="Modal Logic Lab - Interactive Kripke Models">Modal Logic Lab</h1>
        <p className="home-deck">{copy.intro}</p>

        {currentSession && onResume && <aside className="home-resume-region" aria-label="Continue current session">
          <button
            type="button"
            className="home-resume-link"
            aria-label={(cs ? copy.continue : 'Resume') + ' ' + currentSession.kind + ': ' + currentSession.title}
            onClick={onResume}
          >
            <span>{copy.continue}</span>
            <strong>{currentSession.title}</strong>
            {currentSession.context && <small>{currentSession.context}</small>}
            <b aria-hidden="true">→</b>
          </button>
        </aside>}
      </header>

      <div className="home-frame" aria-label={copy.choose}>
        <nav className="home-destinations" aria-label="Main activities">
          <button type="button" className="home-destination home-destination--learn" aria-label={cs ? "Začít nebo pokračovat ve výuce modální logiky" : "Start or continue Learn Modal Logic"} onClick={onLearn}>
            <span className="home-node-marker" aria-hidden="true"><i /></span>
            <span className="home-destination-copy">
              <strong>{copy.learn}</strong>
              <span>{copy.learnSummary}</span>
              <small className="home-learn-progress"><b>{completed}/{total} {copy.complete}</b><span>{completed === total ? copy.courseComplete : copy.next + ': ' + (nextTitle ?? copy.learn)}</span></small>
            </span>
            <span className="home-destination-arrow" aria-hidden="true">→</span>
          </button>

          <button type="button" className="home-destination" aria-label={cs ? "Kampaně: delší výzvy a cílené procvičování" : "Campaigns: longer challenges and focused practice"} onClick={onCampaigns}>
            <span className="home-node-marker" aria-hidden="true"><i /></span>
            <span className="home-destination-copy">
              <strong>{copy.campaigns}</strong>
              <span>{copy.campaignsSummary}</span>
            </span>
            <span className="home-destination-arrow" aria-hidden="true">→</span>
          </button>

          <button type="button" className="home-destination" aria-label={cs ? "Laboratoř: experimentování s modely a formulemi" : "Lab: experiment with models and formulas"} onClick={onLab}>
            <span className="home-node-marker" aria-hidden="true"><i /></span>
            <span className="home-destination-copy">
              <strong>{copy.lab}</strong>
              <span>{copy.labSummary}</span>
            </span>
            <span className="home-destination-arrow" aria-hidden="true">→</span>
          </button>
        </nav>
      </div>
    </div>
  </section>
}
