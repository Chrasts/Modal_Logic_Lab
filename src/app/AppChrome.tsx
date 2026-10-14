import { useEffect, useRef, useState } from 'react'

type NavigationArea = 'home' | 'learn' | 'campaigns' | 'lab'

export interface AppChromeLabels {
  readonly home: string
  readonly learn: string
  readonly campaigns: string
  readonly lab: string
  readonly more: string
  readonly create: string
  readonly reference: string
  readonly help: string
  readonly profile: string
  readonly data: string
  readonly settings: string
  readonly language: string
  readonly light: string
  readonly dark: string
  readonly skip: string
}

interface AppChromeProps {
  readonly activeArea?: NavigationArea
  readonly showBack: boolean
  readonly backLabel: string
  readonly labels: AppChromeLabels
  readonly language: 'en' | 'cs'
  readonly showResume: boolean
  readonly resumeLabel: string
  readonly showWorkspaceReset: boolean
  readonly workspaceResetLabel: string
  readonly showQuickHelp: boolean
  readonly fullscreenEnabled: boolean
  readonly isFullscreen: boolean
  readonly showWorkspaceTour: boolean
  readonly compactWorkspaceNavigation: boolean
  readonly onNavigate: (area: NavigationArea) => void
  readonly onBack: () => void
  readonly onLanguageChange: (language: 'en' | 'cs') => void
  readonly onResume: () => void
  readonly onResetWorkspace: () => void
  readonly onOpenQuickHelp: () => void
  readonly onToggleFullscreen: () => void
  readonly onOpenWorkspaceTour: () => void
  readonly onOpenCreate: () => void
  readonly onOpenReference: () => void
  readonly onOpenHelp: () => void
  readonly onOpenProfile: () => void
  readonly onOpenData: () => void
  readonly onOpenSettings: () => void
}

const moveMenuFocus = (event: React.KeyboardEvent<HTMLDivElement>, role: 'menuitem' | 'menuitemradio', onEscape: () => void) => {
  const items = [...event.currentTarget.querySelectorAll<HTMLElement>(`[role="${role}"]`)]
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (event.key === 'Escape') {
    event.preventDefault()
    onEscape()
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
  event.preventDefault()
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length
  items[next]?.focus()
}

export function AppChrome({ activeArea, showBack, backLabel, labels, language, showResume, resumeLabel, showWorkspaceReset, workspaceResetLabel, showQuickHelp, fullscreenEnabled, isFullscreen, showWorkspaceTour, compactWorkspaceNavigation, onNavigate, onBack, onLanguageChange, onResume, onResetWorkspace, onOpenQuickHelp, onToggleFullscreen, onOpenWorkspaceTour, onOpenCreate, onOpenReference, onOpenHelp, onOpenProfile, onOpenData, onOpenSettings }: AppChromeProps) {
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const utilityMenuRef = useRef<HTMLDivElement>(null)
  const utilityMenuButtonRef = useRef<HTMLButtonElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!utilityMenuOpen) return
    utilityMenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [utilityMenuOpen])

  useEffect(() => {
    if (!languageMenuOpen) return
    languageMenuRef.current?.querySelector<HTMLElement>('[role="menuitemradio"]')?.focus()
  }, [languageMenuOpen])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (utilityMenuRef.current && !utilityMenuRef.current.contains(event.target as Node)) setUtilityMenuOpen(false)
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) setLanguageMenuOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (utilityMenuOpen) {
        setUtilityMenuOpen(false)
        utilityMenuButtonRef.current?.focus()
      }
      if (languageMenuOpen) {
        setLanguageMenuOpen(false)
        languageMenuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [utilityMenuOpen, languageMenuOpen])

  const closeAndOpen = (action: () => void) => {
    setUtilityMenuOpen(false)
    action()
  }

  return <>
    <a className="skip-link" href="#main-content">{labels.skip}</a>
    <header className="topbar">
      <div className="brand">
        {showBack && <button className="back-button" type="button" onClick={onBack} aria-label={backLabel === 'Back' ? 'Go back' : backLabel}>← <span>{backLabel}</span></button>}
        <strong>Modal Logic Lab</strong>
        {!compactWorkspaceNavigation && <nav className="product-nav" aria-label="Global navigation">
          {(['home', 'learn', 'campaigns', 'lab'] as const).map((area) => <button key={area} className={activeArea === area ? 'active' : ''} type="button" onClick={() => onNavigate(area)}>{labels[area]}</button>)}
        </nav>}
      </div>
      <div className="topbar-actions">
        <div className="language-picker" ref={languageMenuRef}>
          <button ref={languageMenuButtonRef} type="button" className="language-picker-button" aria-label={labels.language} aria-haspopup="menu" aria-controls="language-menu" aria-expanded={languageMenuOpen} onClick={() => setLanguageMenuOpen((open) => !open)}>{language === 'cs' ? 'CZ' : 'EN'}</button>
          {languageMenuOpen && <div id="language-menu" className="language-menu-popover" role="menu" aria-label={labels.language} onKeyDown={(event) => moveMenuFocus(event, 'menuitemradio', () => { setLanguageMenuOpen(false); languageMenuButtonRef.current?.focus() })}>
            <button type="button" role="menuitemradio" aria-checked={language === 'en'} onClick={() => { onLanguageChange('en'); setLanguageMenuOpen(false); languageMenuButtonRef.current?.focus() }}><span>EN</span> English</button>
            <button type="button" role="menuitemradio" aria-checked={language === 'cs'} onClick={() => { onLanguageChange('cs'); setLanguageMenuOpen(false); languageMenuButtonRef.current?.focus() }}><span>CZ</span> Čeština</button>
          </div>}
        </div>
        {showResume && <button type="button" className="topbar-resume" onClick={onResume}>{resumeLabel}</button>}
        {showWorkspaceReset && <button type="button" className="text-button" onClick={onResetWorkspace}>{workspaceResetLabel}</button>}
        {showQuickHelp && <button type="button" className="help-button" aria-label="Open workspace quick help" onClick={onOpenQuickHelp}>Quick help</button>}
        {fullscreenEnabled && <button type="button" className="icon-button fullscreen-button" aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} aria-pressed={isFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={onToggleFullscreen}>⛶</button>}
        <div className="utility-menu" ref={utilityMenuRef}>
          <button ref={utilityMenuButtonRef} type="button" className="text-button" aria-haspopup="menu" aria-controls="utility-menu" aria-expanded={utilityMenuOpen} onClick={() => setUtilityMenuOpen((open) => !open)}>{labels.more}</button>
          {utilityMenuOpen && <div id="utility-menu" role="menu" className="utility-menu-popover" onKeyDown={(event) => moveMenuFocus(event, 'menuitem', () => { setUtilityMenuOpen(false); requestAnimationFrame(() => utilityMenuButtonRef.current?.focus()) })}>
            {showWorkspaceTour && <button type="button" role="menuitem" onClick={() => closeAndOpen(onOpenWorkspaceTour)}>Workspace tour</button>}
            {compactWorkspaceNavigation && <>
              <span className="utility-menu-section" aria-hidden="true">Navigate</span>
              {(['home', 'learn', 'campaigns', 'lab'] as const).map((area) => <button key={area} type="button" role="menuitem" aria-current={activeArea === area ? 'page' : undefined} onClick={() => closeAndOpen(() => onNavigate(area))}>{labels[area]}</button>)}
            </>}
            <button type="button" role="menuitem" onClick={() => closeAndOpen(onOpenCreate)}>{labels.create}</button>
            <button type="button" role="menuitem" onClick={() => closeAndOpen(onOpenReference)}>{labels.reference}</button>
            <button type="button" role="menuitem" onClick={() => closeAndOpen(onOpenHelp)}>{labels.help}</button>
            <button type="button" role="menuitem" onClick={() => closeAndOpen(onOpenProfile)}>{labels.profile}</button>
            <button type="button" role="menuitem" onClick={() => closeAndOpen(onOpenData)}>{labels.data}</button>
            <button type="button" role="menuitem" onClick={() => closeAndOpen(onOpenSettings)}>{labels.settings}</button>
            <a role="menuitem" href="https://github.com/Chrasts/Modal_Logic_Lab" target="_blank" rel="noreferrer">GitHub</a>
          </div>}
        </div>
      </div>
    </header>
  </>
}
