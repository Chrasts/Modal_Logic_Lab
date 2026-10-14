import { useEffect, useRef, useState } from 'react'

export type AppView = 'home' | 'workspace' | 'learn' | 'welcome' | 'campaigns' | 'lab' | 'create' | 'reference' | 'help' | 'profile' | 'settings'

export function useAppNavigation(initialView: AppView) {
  const [appView, setAppView] = useState<AppView>(initialView)
  const appViewHistory = useRef<AppView[]>([])
  const lastAppView = useRef<AppView>(initialView)
  const suppressViewHistory = useRef(false)

  useEffect(() => {
    if (lastAppView.current === appView) return
    if (suppressViewHistory.current) suppressViewHistory.current = false
    else appViewHistory.current.push(lastAppView.current)
    lastAppView.current = appView
  }, [appView])

  const restorePreviousView = () => {
    const previousView = appViewHistory.current.pop() ?? 'home'
    suppressViewHistory.current = true
    setAppView(previousView)
  }

  return { appView, setAppView, restorePreviousView }
}
