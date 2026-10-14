interface SettingsViewProps {
  readonly language: 'en' | 'cs'
  readonly density: 'comfortable' | 'compact'
  readonly showMinimap: boolean
  readonly showDerivedRelations: boolean
  readonly reduceMotion: boolean
  readonly soundEffects: boolean
  readonly onLanguageChange: (language: 'en' | 'cs') => void
  readonly onDensityChange: (density: 'comfortable' | 'compact') => void
  readonly onShowMinimapChange: (show: boolean) => void
  readonly onShowDerivedRelationsChange: (show: boolean) => void
  readonly onReduceMotionChange: (reduce: boolean) => void
  readonly onSoundEffectsChange: (enabled: boolean) => void
  readonly onManageData: () => void
  readonly onReset: () => void
}

export function SettingsView({ language, density, showMinimap, showDerivedRelations, reduceMotion, soundEffects, onLanguageChange, onDensityChange, onShowMinimapChange, onShowDerivedRelationsChange, onReduceMotionChange, onSoundEffectsChange, onManageData, onReset }: SettingsViewProps) {
  const cs = language === 'cs'
  const t = cs
    ? { title: 'Nastavení', intro: 'Předvolby uložené pouze v tomto prohlížeči.', language: 'Jazyk', languageText: 'Jazyk uživatelského rozhraní.', density: 'Pracovní prostor', densityText: 'Volné rozvržení ponechává místo pro čtení. Kompaktní zobrazuje více ovládacích prvků.', comfortable: 'Volné', compact: 'Kompaktní', map: 'Zobrazení modelu', minimap: 'Zobrazit minimapu', derived: 'Zobrazit odvozené relace', mapText: 'Odvozené relace mohou zůstat vynucené i tehdy, když je skryjete.', motion: 'Pohyb', reduceMotion: 'Omezit animace rozhraní', motionText: 'Systémová předvolba omezeného pohybu se respektuje nezávisle.', sound: 'Zvuk', soundEffects: 'Zvukové efekty', soundText: 'Krátké zvuky při konstrukci a ověřování.', privacy: 'Místní data', privacyText: 'Modely, formule, nastavení a studijní historie zůstávají v tomto prohlížeči. Sdílení je vždy výslovný export nebo odkaz s vybranými daty.', manage: 'Spravovat místní data', reset: 'Obnovit předvolby', resetText: 'Vrátí výchozí hustotu, minimapu, odvozené relace, panely, zvuk a vlastní omezení pohybu.', resetAction: 'Obnovit nastavení rozhraní' }
    : { title: 'Settings', intro: 'Preferences stored only in this browser.', language: 'Language', languageText: 'The interface language.', density: 'Workspace', densityText: 'Comfortable spacing leaves room for reading. Compact keeps more controls visible.', comfortable: 'Comfortable', compact: 'Compact', map: 'Model display', minimap: 'Show minimap', derived: 'Show derived relations', mapText: 'Derived relations can remain enforced when they are hidden.', motion: 'Motion', reduceMotion: 'Reduce interface animation', motionText: 'The operating-system reduced-motion preference is respected independently.', sound: 'Sound', soundEffects: 'Sound effects', soundText: 'Brief cues for construction and verification.', privacy: 'Local data', privacyText: 'Models, formulas, settings, and learning history remain in this browser. Sharing is always an explicit export or a link containing chosen data.', manage: 'Manage local data', reset: 'Reset preferences', resetText: 'Restore default density, minimap, derived relations, panels, sound, and custom reduced motion.', resetAction: 'Reset interface preferences' }

  return <section className="content-screen settings-screen" aria-labelledby="settings-title">
    <header className="settings-heading"><h1 id="settings-title">{t.title}</h1><p>{t.intro}</p></header>
    <div className="settings-grid">
      <article><h2>{t.language}</h2><p>{t.languageText}</p><div className="settings-choice"><button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => onLanguageChange('en')}>English</button><button type="button" className={language === 'cs' ? 'active' : ''} aria-pressed={language === 'cs'} onClick={() => onLanguageChange('cs')}>Čeština</button></div></article>
      <article><h2>{t.density}</h2><p>{t.densityText}</p><div className="settings-choice"><button type="button" className={density === 'comfortable' ? 'active' : ''} aria-pressed={density === 'comfortable'} onClick={() => onDensityChange('comfortable')}>{t.comfortable}</button><button type="button" className={density === 'compact' ? 'active' : ''} aria-pressed={density === 'compact'} onClick={() => onDensityChange('compact')}>{t.compact}</button></div></article>
      <article><h2>{t.map}</h2><label><input type="checkbox" checked={showMinimap} onChange={(event) => onShowMinimapChange(event.target.checked)} /> {t.minimap}</label><label><input type="checkbox" checked={showDerivedRelations} onChange={(event) => onShowDerivedRelationsChange(event.target.checked)} /> {t.derived}</label><p>{t.mapText}</p></article>
      <article><h2>{t.motion}</h2><label><input type="checkbox" checked={reduceMotion} onChange={(event) => onReduceMotionChange(event.target.checked)} /> {t.reduceMotion}</label><p>{t.motionText}</p></article>
      <article><h2>{t.sound}</h2><label><input type="checkbox" checked={soundEffects} onChange={(event) => onSoundEffectsChange(event.target.checked)} /> {t.soundEffects}</label><p>{t.soundText}</p></article>
      <article><h2>{t.privacy}</h2><p>{t.privacyText}</p><button type="button" className="secondary-button" onClick={onManageData}>{t.manage}</button></article>
      <article><h2>{t.reset}</h2><p>{t.resetText}</p><button type="button" className="secondary-button" onClick={onReset}>{t.resetAction}</button></article>
    </div>
  </section>
}
