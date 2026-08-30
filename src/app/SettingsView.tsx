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
    ? { eyebrow: 'Místní předvolby', title: 'Nastavení', intro: 'Tyto předvolby se ukládají pouze v tomto prohlížeči a nemění modální sémantiku ani pravidla misí.', appearance: 'Vzhled', appearanceText: 'Zvolte světlý nebo tmavý režim pro celou aplikaci.', light: 'Světlý', dark: 'Tmavý', language: 'Jazyk', languageText: 'Zvolte jazyk uživatelského rozhraní.', density: 'Hustota pracovního prostoru', densityText: 'Volné rozvržení podporuje čtení. Kompaktní ponechá více ovládacích prvků na obrazovce.', comfortable: 'Volné', compact: 'Kompaktní', map: 'Zobrazení mapy', minimap: 'Zobrazit minimapu', derived: 'Zobrazit odvozené relace', mapText: 'Pouze zobrazení. Vynucené odvozené relace stále ovlivňují ověření, i když jsou skryté.', motion: 'Pohyb', reduceMotion: 'Omezit animace rozhraní', motionText: 'Předvolba omezeného pohybu operačního systému je respektována nezávisle.', sound: 'Zvuk', soundEffects: 'Zvukové efekty', soundText: 'Pouze krátké zvuky při vytváření a ověřování. Zvuk je ve výchozím stavu vypnutý. Hudba na pozadí se nepřehrává.', window: 'Okno', windowText: 'Celá obrazovka je dostupná přímo z globální lišty, pokud ji podporuje prohlížeč a pravidla vložení.', privacy: 'Soukromí', privacyText: 'Modely, formule, nastavení a historie studia zůstávají v tomto prohlížeči. Neodesílají se automaticky nikam. Aplikace nepoužívá analytiku ani sledovací cookies. Exporty a odkazy obsahují pouze data, která se rozhodnete sdílet.', manage: 'Spravovat místní data', reset: 'Obnovit předvolby', resetText: 'Obnoví volné rozvržení, minimapu a odvozené relace, zapne oba panely a vypne zvuk i vlastní omezení pohybu. Data výuky a modelů zůstanou zachována.', resetAction: 'Obnovit nastavení rozhraní' }
    : { eyebrow: 'Local preferences', title: 'Settings', intro: 'These display preferences are stored only in this browser and do not change modal semantics or mission rules.', appearance: 'Appearance', appearanceText: 'Choose a light or dark color scheme for the entire app.', light: 'Light', dark: 'Dark', language: 'Language', languageText: 'Choose the interface language.', density: 'Workspace density', densityText: 'Comfortable spacing favors reading. Compact spacing keeps more controls visible.', comfortable: 'Comfortable', compact: 'Compact', map: 'Map display', minimap: 'Show minimap', derived: 'Show derived relations', mapText: 'Display only. Enforced derived relations still affect verification when hidden.', motion: 'Motion', reduceMotion: 'Reduce interface animation', motionText: 'The operating-system reduced-motion preference is respected independently.', sound: 'Sound', soundEffects: 'Sound effects', soundText: 'Short create and verification cues only. Sound is off by default. There is no background music.', window: 'Window', windowText: 'Fullscreen is available directly from the global toolbar when the browser and embedding policy support it.', privacy: 'Privacy', privacyText: 'Models, formulas, settings, and study history stay in this browser. They are not automatically sent anywhere. This build uses no analytics SDK or tracking cookies. Explicit exports and share links contain only the data you choose to share.', manage: 'Manage local data', reset: 'Reset preferences', resetText: 'Restore comfortable density, minimap and derived relations on, motion override and sound off, and both workspace panels open. Learning and model data are untouched.', resetAction: 'Reset interface preferences' }

  return <section className="content-screen settings-screen" aria-labelledby="settings-title">
    <div className="screen-hero compact"><div><p className="eyebrow">{t.eyebrow}</p><h1 id="settings-title" className="clean-display">{t.title}</h1><p>{t.intro}</p></div></div>
    <div className="settings-grid">
      <article><h2>{t.language}</h2><p>{t.languageText}</p><div className="settings-choice"><button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => onLanguageChange('en')}>English</button><button type="button" className={language === 'cs' ? 'active' : ''} aria-pressed={language === 'cs'} onClick={() => onLanguageChange('cs')}>Čeština</button></div></article>
      <article><h2>{t.density}</h2><p>{t.densityText}</p><div className="settings-choice"><button type="button" className={density === 'comfortable' ? 'active' : ''} aria-pressed={density === 'comfortable'} onClick={() => onDensityChange('comfortable')}>{t.comfortable}</button><button type="button" className={density === 'compact' ? 'active' : ''} aria-pressed={density === 'compact'} onClick={() => onDensityChange('compact')}>{t.compact}</button></div></article>
      <article><h2>{t.map}</h2><label><input type="checkbox" checked={showMinimap} onChange={(event) => onShowMinimapChange(event.target.checked)} /> {t.minimap}</label><label><input type="checkbox" checked={showDerivedRelations} onChange={(event) => onShowDerivedRelationsChange(event.target.checked)} /> {t.derived}</label><p>{t.mapText}</p></article>
      <article><h2>{t.motion}</h2><label><input type="checkbox" checked={reduceMotion} onChange={(event) => onReduceMotionChange(event.target.checked)} /> {t.reduceMotion}</label><p>{t.motionText}</p></article>
      <article><h2>{t.sound}</h2><label><input type="checkbox" checked={soundEffects} onChange={(event) => onSoundEffectsChange(event.target.checked)} /> {t.soundEffects}</label><p>{t.soundText}</p></article>
      <article><h2>{t.window}</h2><p>{t.windowText}</p></article>
      <article><h2>{t.privacy}</h2><p>{t.privacyText}</p><button type="button" className="secondary-button" onClick={onManageData}>{t.manage}</button></article>
      <article><h2>{t.reset}</h2><p>{t.resetText}</p><button type="button" className="secondary-button" onClick={onReset}>{t.resetAction}</button></article>
    </div>
  </section>
}
