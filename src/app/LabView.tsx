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
  return <section className="content-screen lab-screen editorial-screen" aria-labelledby="lab-title">
    <header className="editorial-heading lab-index-heading">
      <div><p className="eyebrow">{cs ? 'Konečné Kripkeho modely' : 'Finite Kripke models'}</p><h1 id="lab-title" className="clean-display">{cs ? 'Laboratoř' : 'Lab'}</h1><p>{cs ? 'Zkoumejte konečné Kripkeho modely a modální formule bez pevně daného cíle mise.' : 'Explore finite Kripke models and modal formulas without a fixed mission objective.'}</p></div>
    </header>
    <section className="lab-instrument" aria-label={cs ? 'Dostupné nástroje laboratoře' : 'Available Lab tools'}>
      <div className="lab-instrument-node" aria-hidden="true"><span>◇</span><small>MODEL</small></div>
      <div className="lab-instrument-copy"><p className="eyebrow">{cs ? 'Nástroj 01' : 'Instrument 01'}</p><h2>{cs ? 'Modelová laboratoř' : 'Model Sandbox'}</h2><p>{cs ? 'Vytvářejte a upravujte konečné Kripkeho modely, vyhodnocujte a porovnávejte formule a zkoumejte vlastnosti Kripkeho rámců.' : 'Build and edit finite Kripke models, evaluate formulas, compare formulas, and explore frame properties.'}</p></div>
      <ol className="lab-capabilities">{(cs ? modelLaboratoryCapabilities : modelSandboxCapabilities).map((capability, index) => <li key={capability}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{capability}</li>)}</ol>
      <button type="button" className="row-action lab-open-action" onClick={onOpenModelSandbox}>{cs ? 'Otevřít modelovou laboratoř' : 'Open Model Sandbox'} <span aria-hidden="true">→</span></button>
    </section>
  </section>
}
