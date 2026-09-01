// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mobileVerificationRequestedEvent } from '../workspace/mobile-workspace-events'
import { WorkspaceToolbar } from './WorkspaceToolbar'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const mockMobileMedia = () => vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
  matches: query === '(max-width: 760px)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(() => false),
}))

const renderToolbar = (overrides: Partial<Parameters<typeof WorkspaceToolbar>[0]> = {}) => {
  const actions = {
    onApplyPreset: vi.fn(), onAddWorld: vi.fn(), onDeleteRelation: vi.fn(),
    onToggleEvaluationPanel: vi.fn(), onToggleModelPanel: vi.fn(), onUndo: vi.fn(),
    onRedo: vi.fn(), onTidy: vi.fn(), onToggleDerived: vi.fn(),
    onOpenFrameRules: vi.fn(), onVerify: vi.fn(),
  }
  const view = render(<WorkspaceToolbar sandbox editorMode="edit" rightPanelOpen showWorldPanel showEdgePanel leftPanelOpen canAddWorld canEditWorlds canEditRelations canUseHistory canRepositionWorlds selectedRelation undoAvailable redoAvailable worldCount={2} focusedIntro={false} showDerivedRelations derivedRelationCount={2} frameRuleCount={1} flowInstance={null} {...actions} {...overrides} />)
  return { actions, ...view }
}

describe('WorkspaceToolbar', () => {
  it('groups model, history, viewport and analysis actions', () => {
    renderToolbar()
    expect(screen.getByLabelText('Model actions')).toBeInTheDocument()
    expect(screen.getByLabelText('Panels and history')).toBeInTheDocument()
    expect(screen.getByLabelText('Viewport actions')).toBeInTheDocument()
    expect(screen.getByLabelText('Analysis actions')).toBeInTheDocument()
  })

  it('keeps presets sandbox-only and exposes contextual relation deletion', () => {
    const { actions } = renderToolbar({ sandbox: false, selectedRelation: true })
    expect(screen.queryByLabelText('Workspace presets')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete relation' }))
    expect(actions.onDeleteRelation).toHaveBeenCalledOnce()
  })

  it('renders only the compact toolbar shell at the phone breakpoint', () => {
    mockMobileMedia()
    const { container } = renderToolbar()
    expect(container.querySelector('.workspace-toolbar-mobile')).toBeInTheDocument()
    expect(container.querySelector('.workspace-toolbar-desktop')).not.toBeInTheDocument()
    expect(screen.getAllByLabelText('Model actions')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'More model tools' })).toBeInTheDocument()
  })

  it('opens mobile secondary controls in a root-level dialog', () => {
    mockMobileMedia()
    renderToolbar()
    fireEvent.click(screen.getByRole('button', { name: 'More model tools' }))
    const dialog = screen.getByRole('dialog', { name: 'Model tools' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Zoom in' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Tidy model' })).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close model tools' }))
    expect(screen.queryByRole('dialog', { name: 'Model tools' })).not.toBeInTheDocument()
  })

  it('announces a result transition when mobile verification runs', () => {
    mockMobileMedia()
    const verificationRequested = vi.fn()
    window.addEventListener(mobileVerificationRequestedEvent, verificationRequested)
    const { actions, container } = renderToolbar({ editorMode: 'evaluate' })
    const mobileToolbar = container.querySelector('.workspace-toolbar-mobile')
    expect(mobileToolbar).not.toBeNull()
    fireEvent.click(within(mobileToolbar as HTMLElement).getByRole('button', { name: 'Verify' }))
    expect(actions.onVerify).toHaveBeenCalledOnce()
    expect(verificationRequested).toHaveBeenCalledOnce()
    window.removeEventListener(mobileVerificationRequestedEvent, verificationRequested)
  })
})
