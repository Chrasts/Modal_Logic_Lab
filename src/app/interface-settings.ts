export type InterfaceDensity = 'comfortable' | 'compact'
export type InterfaceLanguage = 'en' | 'cs'

export interface InterfaceSettings {
  readonly density: InterfaceDensity
  readonly showMinimap: boolean
  readonly showDerivedEdges: boolean
  readonly reduceMotion: boolean
  readonly soundEffects: boolean
  readonly leftPanelOpen: boolean
  readonly rightPanelOpen: boolean
  readonly language: InterfaceLanguage
}

export const interfaceSettingsKey = 'logic-game:interface-settings:v1'

export const defaultInterfaceSettings: InterfaceSettings = {
  density: 'comfortable',
  showMinimap: true,
  showDerivedEdges: true,
  reduceMotion: false,
  soundEffects: false,
  leftPanelOpen: true,
  rightPanelOpen: true,
  language: 'en',
}

export const loadInterfaceSettings = (): InterfaceSettings => {
  try {
    const stored = JSON.parse(localStorage.getItem(interfaceSettingsKey) ?? 'null') as Partial<InterfaceSettings> | null
    return stored ? {
      density: stored.density === 'compact' ? 'compact' : 'comfortable',
      showMinimap: stored.showMinimap !== false,
      showDerivedEdges: stored.showDerivedEdges !== false,
      reduceMotion: stored.reduceMotion === true,
      soundEffects: stored.soundEffects === true,
      leftPanelOpen: stored.leftPanelOpen !== false,
      rightPanelOpen: stored.rightPanelOpen !== false,
      language: stored.language === 'cs' ? 'cs' : 'en',
    } : defaultInterfaceSettings
  } catch {
    return defaultInterfaceSettings
  }
}

export const saveInterfaceSettings = (settings: InterfaceSettings): void => {
  try {
    localStorage.setItem(interfaceSettingsKey, JSON.stringify(settings))
  } catch {
    // Preferences remain available for this session.
  }
}

export const clearInterfaceSettings = (): void => {
  try {
    localStorage.removeItem(interfaceSettingsKey)
  } catch {
    // Reset preferences remain available for this session.
  }
}

export function useInterfacePreferences() {
  const [initialSettings] = useState(loadInterfaceSettings)
  const [showDerivedEdges, setShowDerivedEdges] = useState(initialSettings.showDerivedEdges)
  const [showMinimap, setShowMinimap] = useState(initialSettings.showMinimap)
  const [interfaceDensity, setInterfaceDensity] = useState<InterfaceDensity>(initialSettings.density)
  const [reduceMotion, setReduceMotion] = useState(initialSettings.reduceMotion)
  const [soundEffects, setSoundEffects] = useState(initialSettings.soundEffects)
  const [leftPanelOpen, setLeftPanelOpen] = useState(initialSettings.leftPanelOpen)
  const [rightPanelOpen, setRightPanelOpen] = useState(initialSettings.rightPanelOpen)
  const [interfaceLanguage, setInterfaceLanguage] = useState<InterfaceLanguage>(initialSettings.language)

  useEffect(() => {
    saveInterfaceSettings({ density: interfaceDensity, showMinimap, showDerivedEdges, reduceMotion, soundEffects, leftPanelOpen, rightPanelOpen, language: interfaceLanguage })
  }, [interfaceDensity, showMinimap, showDerivedEdges, reduceMotion, soundEffects, leftPanelOpen, rightPanelOpen, interfaceLanguage])

  const resetInterfacePreferences = () => {
    setInterfaceDensity(defaultInterfaceSettings.density)
    setShowMinimap(defaultInterfaceSettings.showMinimap)
    setShowDerivedEdges(defaultInterfaceSettings.showDerivedEdges)
    setReduceMotion(defaultInterfaceSettings.reduceMotion)
    setSoundEffects(defaultInterfaceSettings.soundEffects)
    setLeftPanelOpen(defaultInterfaceSettings.leftPanelOpen)
    setRightPanelOpen(defaultInterfaceSettings.rightPanelOpen)
    setInterfaceLanguage(defaultInterfaceSettings.language)
    clearInterfaceSettings()
  }

  return {
    showDerivedEdges, setShowDerivedEdges,
    showMinimap, setShowMinimap,
    interfaceDensity, setInterfaceDensity,
    reduceMotion, setReduceMotion,
    soundEffects, setSoundEffects,
    leftPanelOpen, setLeftPanelOpen,
    rightPanelOpen, setRightPanelOpen,
    interfaceLanguage, setInterfaceLanguage,
    resetInterfacePreferences,
  }
}
import { useEffect, useState } from 'react'
