export function LabView({ language = 'en', onOpenModelSandbox }: { readonly language?: 'en' | 'cs'; readonly onOpenModelSandbox: () => void }) {
  const cs = language === 'cs'
  return <section className="content-screen lab-screen editorial-screen" aria-labelledby="lab-title">
    <header className="lab-heading">
      <h1 id="lab-title">{cs ? 'Laboratoř' : 'Lab'}</h1><p>{cs ? 'Volné prostředí pro experimenty s Kripkeho sémantikou.' : 'A free workspace for Kripke semantics.'}</p>
    </header>
    <section className="lab-instrument" aria-label={cs ? 'Dostupné nástroje laboratoře' : 'Available Lab tools'}>
      <div className="lab-instrument-copy"><h2>{cs ? 'Modelová laboratoř' : 'Model Sandbox'}</h2><p>{cs ? 'Vytvářejte konečné Kripkeho modely, vyhodnocujte a porovnávejte formule a zkoumejte vlastnosti rámců i sémantické stopy.' : 'Build finite Kripke models, evaluate or compare formulas, and inspect frame properties and semantic traces.'}</p></div>
      <button type="button" className="lab-open-action" aria-label={cs ? 'Otevřít modelovou laboratoř' : 'Open Model Sandbox'} onClick={onOpenModelSandbox}><span className="chapter-diamond-label">{cs ? 'Otevřít' : 'Open Sandbox'}</span></button>
    </section>
  </section>
}
