export function LabView({ language = 'en', onOpenModelSandbox }: { readonly language?: 'en' | 'cs'; readonly onOpenModelSandbox: () => void }) {
  const cs = language === 'cs'
  return <section className="content-screen lab-screen editorial-screen" aria-labelledby="lab-title">
    <header className="lab-heading">
      <h1 id="lab-title">{cs ? 'Laboratoř' : 'Lab'}</h1><p>{cs ? 'Prostor pro volné experimentování s konečnými Kripkeho modely bez zadání konkrétní mise.' : 'A working space for finite Kripke models. No mission determines what the model must show.'}</p>
    </header>
    <section className="lab-instrument" aria-label={cs ? 'Dostupné nástroje laboratoře' : 'Available Lab tools'}>
      <div className="lab-instrument-copy"><h2>{cs ? 'Modelová laboratoř' : 'Model Sandbox'}</h2><p>{cs ? 'Přidávejte světy a relace dostupnosti, určujte pravdivost atomických formulí a vyberte svět vyhodnocení. Pak vyhodnoťte jednu formuli nebo porovnejte dvě.' : 'Add worlds and relations, set valuations, and choose an evaluation world. Then evaluate one formula or compare two.'}</p></div>
      <button type="button" className="row-action lab-open-action" onClick={onOpenModelSandbox}>{cs ? 'Otevřít modelovou laboratoř' : 'Open Model Sandbox'} <span aria-hidden="true">→</span></button>
    </section>
  </section>
}
