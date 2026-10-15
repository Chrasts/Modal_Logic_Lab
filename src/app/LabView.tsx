const sandboxCapabilities = {
  en: [
    { title: 'Model editor', description: 'Add and rename worlds, edit valuations, draw accessibility relations, and choose an evaluation world.' },
    { title: 'Formula evaluation', description: 'Check truth at a world, throughout a model, or across all valuations on a finite frame.' },
    { title: 'Formula comparison', description: 'Compare two modal formulas within the selected semantic scope.' },
    { title: 'Evaluation Explorer', description: 'Explore subformulas, evaluation traces, and highlighted witnesses or counterexamples.' },
    { title: 'Frame analysis', description: 'Check relation properties such as reflexivity, symmetry, or transitivity, and enforce supported rules.' },
    { title: 'Save and share', description: 'Undo or redo edits, import and export model JSON, or share a Sandbox state by link.' },
  ],
  cs: [
    { title: 'Editor modelů', description: 'Přidávejte a přejmenovávejte světy, upravujte valuace, kreslete relace dostupnosti a vybírejte svět vyhodnocení.' },
    { title: 'Vyhodnocování formulí', description: 'Ověřujte pravdivost ve světě, v celém modelu nebo na konečném rámci přes všechny valuace.' },
    { title: 'Porovnávání formulí', description: 'Porovnejte dvě modální formule ve zvoleném sémantickém rozsahu.' },
    { title: 'Evaluation Explorer', description: 'Zkoumejte podformule, průběh vyhodnocení a zvýrazněné svědky či protipříklady.' },
    { title: 'Analýza rámců', description: 'Kontrolujte reflexivitu, symetrii, tranzitivitu a další vlastnosti relací nebo vynucujte podporovaná pravidla.' },
    { title: 'Ukládání a sdílení', description: 'Vracejte úpravy zpět, importujte a exportujte model v JSON nebo sdílejte stav laboratoře odkazem.' },
  ],
} as const

export function LabView({ language = 'en', onOpenModelSandbox }: { readonly language?: 'en' | 'cs'; readonly onOpenModelSandbox: () => void }) {
  const cs = language === 'cs'
  return <section className="content-screen lab-screen editorial-screen" aria-labelledby="lab-title">
    <header className="lab-heading">
      <div className="lab-heading-copy">
        <h1 id="lab-title">{cs ? 'Laboratoř' : 'Lab'}</h1>
        <p>{cs ? 'Volné experimentování s konečnými Kripkeho modely bez omezení konkrétní misí.' : 'Explore finite Kripke models freely, without mission constraints.'}</p>
      </div>
      <button type="button" className="lab-open-action" aria-label={cs ? 'Otevřít modelovou laboratoř' : 'Open Model Sandbox'} onClick={onOpenModelSandbox}>
        <span className="chapter-diamond-label">{cs ? 'Otevřít' : 'Open Sandbox'}</span>
      </button>
    </header>
    <section className="lab-instrument" aria-label={cs ? 'Dostupné nástroje laboratoře' : 'Available Lab tools'}>
      <div className="lab-instrument-copy">
        <h2>{cs ? 'Modelová laboratoř' : 'Model Sandbox'}</h2>
        <p>{cs ? 'V jednom prostředí můžete sestavovat modely, zkoumat jejich sémantiku a testovat vlastnosti rámců.' : 'Build models, investigate their semantics, and test frame properties in one workspace.'}</p>
      </div>
      <ul className="lab-capabilities">
        {sandboxCapabilities[language].map(({ title, description }) => <li key={title}><strong>{title}</strong><span>{description}</span></li>)}
      </ul>
    </section>
  </section>
}
