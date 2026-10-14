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
    <header className="lab-heading">
      <h1 id="lab-title">{cs ? 'Laboratoř' : 'Lab'}</h1><p>{cs ? 'Pracovní prostor pro konečné Kripkeho modely. Žádná mise neurčuje, co má model dokazovat.' : 'A working space for finite Kripke models. No mission determines what the model must show.'}</p>
    </header>
    <section className="lab-instrument" aria-label={cs ? 'Dostupné nástroje laboratoře' : 'Available Lab tools'}>
      <div className="lab-instrument-copy"><h2>{cs ? 'Modelový sandbox' : 'Model Sandbox'}</h2><p>{cs ? 'Přidávejte světy a relace, nastavte valuaci a zvolte evaluační svět. Potom vyhodnoťte jednu formuli nebo porovnejte dvě.' : 'Add worlds and relations, set valuations, and choose an evaluation world. Then evaluate one formula or compare two.'}</p></div>
      <ol className="lab-capabilities">{(cs ? modelLaboratoryCapabilities : modelSandboxCapabilities).map((capability, index) => <li key={capability}><span>{String(index + 1).padStart(2, '0')}</span>{capability}</li>)}</ol>
      <button type="button" className="row-action lab-open-action" onClick={onOpenModelSandbox}>{cs ? 'Otevřít modelovou laboratoř' : 'Open Model Sandbox'} <span aria-hidden="true">→</span></button>
    </section>
  </section>
}
