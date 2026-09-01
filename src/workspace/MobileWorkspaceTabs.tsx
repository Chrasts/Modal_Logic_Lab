import { useEffect, type KeyboardEvent } from 'react'
import { mobileVerificationRequestedEvent } from './mobile-workspace-events'

export type MobileWorkspaceTab = 'model' | 'formula' | 'result'

const tabPresentation: Record<MobileWorkspaceTab, { readonly icon: string; readonly label: string }> = {
  model: { icon: '◇', label: 'Model' },
  formula: { icon: 'φ', label: 'Formula' },
  result: { icon: '✓', label: 'Result' },
}

export function MobileWorkspaceTabs({ activeTab, showFormula, onChange }: { readonly activeTab: MobileWorkspaceTab; readonly showFormula: boolean; readonly onChange: (tab: MobileWorkspaceTab) => void }) {
  const tabs: readonly MobileWorkspaceTab[] = showFormula ? ['model', 'formula', 'result'] : ['model', 'result']

  useEffect(() => {
    const showResult = () => onChange('result')
    window.addEventListener(mobileVerificationRequestedEvent, showResult)
    return () => window.removeEventListener(mobileVerificationRequestedEvent, showResult)
  }, [onChange])

  const activate = (tab: MobileWorkspaceTab) => {
    if (tab === 'result' && activeTab === 'result') {
      onChange('model')
      return
    }
    onChange(tab)
  }

  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
    onChange(tabs[nextIndex])
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus()
  }
  return <nav className="mobile-workspace-tabs" aria-label="Workspace sections" role="tablist">
    {tabs.map((tab, index) => <button key={tab} type="button" role="tab" aria-label={tab} className={activeTab === tab ? 'active' : ''} aria-selected={activeTab === tab} aria-pressed={tab === 'result' ? activeTab === 'result' : undefined} tabIndex={activeTab === tab ? 0 : -1} onClick={() => activate(tab)} onKeyDown={(event) => move(event, index)}><span aria-hidden="true">{tabPresentation[tab].icon}</span><small>{tabPresentation[tab].label}</small></button>)}
  </nav>
}
