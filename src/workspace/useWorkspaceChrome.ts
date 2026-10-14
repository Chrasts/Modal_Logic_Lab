import { useEffect, useState } from 'react'

interface WorkspaceChromeOptions {
  readonly initialWorkspace: boolean
  readonly workspaceActive: boolean
  readonly authoringActive: boolean
  readonly conceptOpen: boolean
  readonly tourStorageKey: string
}

const tourWasSeen = (key: string) => localStorage.getItem(key) === 'seen'

export function useWorkspaceChrome({ initialWorkspace, workspaceActive, authoringActive, conceptOpen, tourStorageKey }: WorkspaceChromeOptions) {
  const [showWorkspaceTour, setShowWorkspaceTour] = useState(() => initialWorkspace && !tourWasSeen(tourStorageKey))
  const [workspaceTourStep, setWorkspaceTourStep] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))

  useEffect(() => {
    if (workspaceActive && !authoringActive && !conceptOpen && !tourWasSeen(tourStorageKey)) {
      setWorkspaceTourStep(0)
      setShowWorkspaceTour(true)
    }
  }, [workspaceActive, authoringActive, conceptOpen, tourStorageKey])

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', updateFullscreenState)
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState)
  }, [])

  const openWorkspaceTour = () => {
    setWorkspaceTourStep(0)
    setShowWorkspaceTour(true)
  }

  const dismissWorkspaceTour = () => {
    try { localStorage.setItem(tourStorageKey, 'seen') } catch { /* Tour may repeat when storage is unavailable. */ }
    setShowWorkspaceTour(false)
    setWorkspaceTourStep(0)
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      // Browsers may reject fullscreen when it is blocked by policy or embedding.
    }
  }

  return {
    showWorkspaceTour,
    workspaceTourStep,
    setWorkspaceTourStep,
    isFullscreen,
    openWorkspaceTour,
    dismissWorkspaceTour,
    toggleFullscreen,
  }
}
