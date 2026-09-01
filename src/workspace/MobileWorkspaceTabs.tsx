import { useEffect, type KeyboardEvent } from 'react'
import { mobileVerificationRequestedEvent, mobileWorkspaceResetEvent } from './mobile-workspace-events'

export type MobileWorkspaceTab = 'model' | 'formula' | 'result'

type VisibleMobileWorkspaceTab = Exclude<MobileWorkspaceTab, 'model'>

const tabPresentation: Record<VisibleMobileWorkspaceTab, { readonly icon: string; readonly label: string }> = {
  formula: { icon: 'φ', label: 'Formula' },
  result: { icon: '✓', label: 'Result' },
}

export function MobileWorkspaceTabs({ activeTab, showFormula, onChange }: { readonly activeTab: MobileWorkspaceTab; readonly showFormula: boolean; readonly onChange: (tab: MobileWorkspaceTab) => void }) {
  const tabs: readonly VisibleMobileWorkspaceTab[] = showFormula ? ['formula', 'result'] : ['result']

  useEffect(() => {
    const showResult = () => onChange('result')
    const reset = () => onChange('model')
    window.addEventListener(mobileVerificationRequestedEvent, showResult)
    window.addEventListener(mobileWorkspaceResetEvent, reset)
    return () => {
      window.removeEventListener(mobileVerificationRequestedEvent, showResult)
      window.removeEventListener(mobileWorkspaceResetEvent, reset)
    }
  }, [onChange])

  const activate = (tab: VisibleMobileWorkspaceTab) => {
    onChange(activeTab === tab ? 'model' : tab)
  }

  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    onChange(tabs[nextIndex])
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus()
  }

  return <nav className="mobile-workspace-tabs" aria-label="Workspace panels" role="tablist">
    {tabs.map((tab, index) => <button key={tab} type="button" role="tab" aria-label={tab} className={activeTab === tab ? 'active' : ''} aria-selected={activeTab === tab} aria-pressed={activeTab === tab} tabIndex={activeTab === tab || (activeTab === 'model' && index === 0) ? 0 : -1} onClick={() => activate(tab)} onKeyDown={(event) => move(event, index)}><span aria-hidden="true">{tabPresentation[tab].icon}</span><small>{tabPresentation[tab].label}</small></button>)}
  </nav>
}
