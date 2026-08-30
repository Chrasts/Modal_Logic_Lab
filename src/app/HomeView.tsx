import './HomeView.css'

export interface HomeCurrentSession {
  readonly kind: 'lesson' | 'mission'
  readonly title: string
  readonly context?: string
}

export function HomeView({ completed, total, nextTitle, currentSession, onResume, onLearn, onCampaigns, onLab }: {
  readonly completed: number
  readonly total: number
  readonly nextTitle?: string
  readonly onLearn: () => void
  readonly onCampaigns: () => void
  readonly onLab: () => void
  readonly currentSession?: HomeCurrentSession
  readonly onResume?: () => void
}) {
  return <section className="content-screen home-screen home-screen--redesigned" aria-labelledby="home-title">
    <header className="home-hero">
      <div>
        <p className="eyebrow">Interactive Kripke semantics</p>
        <h1 id="home-title" aria-label="Modal Logic Lab - Interactive Kripke Models">Modal Logic Lab</h1>
        <p>Learn modal logic, solve structured challenges, or build and test Kripke models freely.</p>
      </div>
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
        <span className="home-destination-topline">
          <span className="home-destination-kicker">Guided course</span>
          <span className="home-destination-arrow" aria-hidden="true">→</span>
        </span>
        <span className="home-destination-title">Learn</span>
        <span className="home-destination-copy" id="home-learn-description">
          <span className="home-destination-summary">Modal logic step by step.</span>
          <span className="home-destination-detail">Move from possible worlds and accessibility to modal operators, countermodels, and frame properties.</span>
        </span>
        <span className="home-learn-progress">
          <strong>{completed}/{total} complete</strong>
          <span>{completed === total ? 'Course complete' : `Next: ${nextTitle ?? 'Learn overview'}`}</span>
        </span>
        <button
          type="button"
          className="home-destination-hitbox"
          aria-label="Start or continue Learn Modal Logic"
          aria-describedby="home-learn-description"
          onClick={onLearn}
        >LEARN</button>
      </article>

      <article className="home-destination">
        <span className="home-destination-topline">
          <span className="home-destination-kicker">Challenges</span>
          <span className="home-destination-arrow" aria-hidden="true">→</span>
        </span>
        <span className="home-destination-title">Campaigns</span>
        <span className="home-destination-copy" id="home-campaigns-description">
          <span className="home-destination-summary">Structured mission sequences.</span>
          <span className="home-destination-detail">Apply modal semantics across longer challenges that combine several skills.</span>
        </span>
        <button
          type="button"
          className="home-destination-hitbox"
          aria-label="Campaigns: longer challenges and focused practice"
          aria-describedby="home-campaigns-description"
          onClick={onCampaigns}
        >Open Campaigns</button>
      </article>

      <article className="home-destination">
        <span className="home-destination-topline">
          <span className="home-destination-kicker">Free exploration</span>
          <span className="home-destination-arrow" aria-hidden="true">→</span>
        </span>
        <span className="home-destination-title">Lab</span>
        <span className="home-destination-copy" id="home-lab-description">
          <span className="home-destination-summary">Experiment without a fixed objective.</span>
          <span className="home-destination-detail">Build models, test formulas, compare truth conditions, and inspect frame properties.</span>
        </span>
        <button
          type="button"
          className="home-destination-hitbox"
          aria-label="Lab: experiment with models and formulas"
          aria-describedby="home-lab-description"
          onClick={onLab}
        >Open Lab</button>
      </article>
    </nav>
  </section>
}
