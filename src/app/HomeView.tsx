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
        intro: 'Sestavujte konečné Kripkeho modely a zkoumejte pravdivost modálních formulí ve vybraném světě, v celém modelu i jejich platnost na daném rámci.',
        choose: 'Hlavní části aplikace',
        learn: 'Výuka',
        learnSummary: 'Postupná výuka od sémantiky možných světů po vlastnosti rámců a protimodely.',
        campaigns: 'Kampaně',
        campaignsSummary: 'Tematické úlohy s protimodely, formulemi a vlastnostmi rámců.',
        lab: 'Laboratoř',
        labSummary: 'Volné experimentování s modely, formulemi a jejich vyhodnocováním.',
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
          <h1 id="home-title" aria-label={cs ? 'Modal Logic Lab – interaktivní Kripkeho modely' : 'Modal Logic Lab - Interactive Kripke Models'}><span>Modal</span><span>Logic</span><span>Lab</span></h1>
        </div>
        <p className="home-deck">{copy.intro}</p>

        {currentSession && onResume && <aside className="home-resume-region" aria-label={cs ? 'Pokračovat v rozpracované úloze' : 'Continue current session'}>
          <button
            type="button"
            className="home-resume-link"
            aria-label={(cs ? 'Pokračovat v ' + (currentSession.kind === 'lesson' ? 'lekci' : 'misi') : 'Resume ' + currentSession.kind) + ': ' + currentSession.title}
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
        <nav className="home-destinations" aria-label={cs ? 'Hlavní části aplikace' : 'Main activities'}>
          <button type="button" className="home-destination home-destination--learn" aria-label={cs ? "Začít nebo pokračovat ve výuce modální logiky" : "Start or continue Learn Modal Logic"} onClick={onLearn}>
            <span className="home-destination-copy">
              <strong>{copy.learn}</strong>
              <span>{copy.learnSummary}</span>
              <small className="home-learn-progress"><b>{cs ? `Splněno ${completed} z ${total}` : `${completed}/${total} ${copy.complete}`}</b><span>{completed === total ? copy.courseComplete : copy.next + ': ' + (nextTitle ?? copy.learn)}</span></small>
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
