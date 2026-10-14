// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { clearInterfaceSettings, defaultInterfaceSettings, interfaceSettingsKey, loadInterfaceSettings, saveInterfaceSettings } from './interface-settings'

afterEach(() => localStorage.clear())

describe('interface settings persistence', () => {
  it('uses the documented defaults when storage is empty or malformed', () => {
    expect(loadInterfaceSettings()).toEqual(defaultInterfaceSettings)

    localStorage.setItem(interfaceSettingsKey, '{not json')
    expect(loadInterfaceSettings()).toEqual(defaultInterfaceSettings)
  })

  it('normalizes persisted preferences and removes them on reset', () => {
    saveInterfaceSettings({
      density: 'compact',
      showMinimap: false,
      showDerivedEdges: false,
      reduceMotion: true,
      soundEffects: true,
      leftPanelOpen: false,
      rightPanelOpen: true,
      language: 'cs',
    })

    expect(loadInterfaceSettings()).toMatchObject({ density: 'compact', showMinimap: false, language: 'cs' })
    clearInterfaceSettings()
    expect(localStorage.getItem(interfaceSettingsKey)).toBeNull()
  })
})
