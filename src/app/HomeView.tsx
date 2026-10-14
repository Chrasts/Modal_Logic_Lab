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
        intro: 'Stavějte konečné Kripkeho modely a sledujte, kdy je formule pravdivá v daném světě, v celém modelu nebo na rámci.',
        choose: 'Hlavní části aplikace',
        learn: 'Výuka',
        learnSummary: 'Kapitoly a lekce od možných světů k práci s formulemi.',
        campaigns: 'Kampaně',
        campaignsSummary: 'Mise pro konstrukci protipříkladů a zkoumání rámců.',
        lab: 'Laboratoř',
        labSummary: 'Vlastní model, formule, relace a stopa vyhodnocení.',
        complete: 'splněno',
        next: 'další',
        courseComplete: 'kurz dokončen',
        continue: 'Pokračovat',
      }
    : {
        intro: 'Build finite Kripke models and check a formula at one world, throughout a model, or on a frame.',
        choose: 'Main parts of the environment',
        learn: 'Learn',
        learnSummary: 'Chapters and lessons from possible worlds to formula evaluation.',
        campaigns: 'Campaigns',
        campaignsSummary: 'Missions for countermodels and frame construction.',
        lab: 'Lab',
        labSummary: 'Your own model, formula, relations, and evaluation trace.',
        complete: 'complete',
        next: 'Next',
        courseComplete: 'course complete',
        continue: 'Continue',
      }


  return <section className="content-screen home-screen home-screen--relational" aria-labelledby="home-title">
    <div className="home-layout">
      <header className="home-intro">
        <div className="home-logo-lockup">
          <h1 id="home-title" aria-label="Modal Logic Lab - Interactive Kripke Models"><span>Modal</span><span>Logic</span><span>Lab</span></h1>
        </div>
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
            <span className="home-destination-copy">
              <strong>{copy.learn}</strong>
              <span>{copy.learnSummary}</span>
              <small className="home-learn-progress"><b>{completed}/{total} {copy.complete}</b><span>{completed === total ? copy.courseComplete : copy.next + ': ' + (nextTitle ?? copy.learn)}</span></small>
            </span>
          </button>

          <button type="button" className="home-destination home-destination--campaigns" aria-label={cs ? "Kampaně: mise a procvičování" : "Campaigns: missions and practice"} onClick={onCampaigns}>
            <span className="home-destination-copy">
              <strong>{copy.campaigns}</strong>
              <span>{copy.campaignsSummary}</span>
            </span>
          </button>

          <button type="button" className="home-destination home-destination--lab" aria-label={cs ? "Laboratoř: experimentování s modely a formulemi" : "Lab: experiment with models and formulas"} onClick={onLab}>
            <span className="home-destination-copy">
              <strong>{copy.lab}</strong>
              <span>{copy.labSummary}</span>
            </span>
          </button>
        </nav>
      </div>
    </div>
  </section>
}
