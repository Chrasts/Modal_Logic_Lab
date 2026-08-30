const modelSandboxCapabilities = [
  'Build finite Kripke models',
  'Evaluate modal formulas',
  'Compare formulas',
  'Explore frame properties',
  'Inspect evaluation traces',
] as const

const modelLaboratoryCapabilities = [
  'Vytváření konečných Kripkeho modelů',
  'Vyhodnocování modálních formulí',
  'Porovnávání formulí',
  'Práce s vlastnostmi Kripkeho rámců',
  'Prohlížení stop vyhodnocení',
] as const

export function LabView({ language = 'en', onOpenModelSandbox }: { readonly language?: 'en' | 'cs'; readonly onOpenModelSandbox: () => void }) {
  const cs = language === 'cs'
  return <section className="content-screen lab-screen" aria-labelledby="lab-title">
    <div className="screen-hero compact"><div><p className="eyebrow">{cs ? 'Volné experimentování' : 'Experiment freely'}</p><h1 id="lab-title" className="clean-display">{cs ? 'Laboratoř' : 'Lab'}</h1><p>{cs ? 'Zkoumejte konečné Kripkeho modely a modální formule bez pevně daného cíle mise. Nástroje laboratoře používají stejný pracovní prostor modelu jako zbytek aplikace.' : 'Explore finite Kripke models and modal formulas without a fixed mission objective. Lab tools share the same deterministic model workspace used throughout the game.'}</p></div></div>
    <div className="lab-tool-grid" aria-label={cs ? 'Dostupné nástroje laboratoře' : 'Available Lab tools'}>
      <article className="lab-tool-card active"><div><p className="eyebrow">{cs ? 'K dispozici nyní' : 'Available now'}</p><h2>{cs ? 'Modelová laboratoř' : 'Model Sandbox'}</h2><p>{cs ? 'Vytvářejte a upravujte konečné Kripkeho modely, vyhodnocujte a porovnávejte formule a zkoumejte vlastnosti Kripkeho rámců.' : 'Build and edit finite Kripke models, evaluate formulas, compare formulas, and explore frame properties.'}</p></div><ul>{(cs ? modelLaboratoryCapabilities : modelSandboxCapabilities).map((capability) => <li key={capability}>{capability}</li>)}</ul><button type="button" className="primary-action" onClick={onOpenModelSandbox}>{cs ? 'Otevřít modelovou laboratoř' : 'Open Model Sandbox'}</button></article>
    </div>
  </section>
}
