import { useEffect, useState } from 'react'
import type { ReactFlowInstance } from '@xyflow/react'

interface WorkspaceToolbarProps {
  readonly sandbox: boolean
  readonly editorMode: 'edit' | 'evaluate'
  readonly rightPanelOpen: boolean
  readonly showWorldPanel: boolean
  readonly showEdgePanel: boolean
  readonly leftPanelOpen: boolean
  readonly canAddWorld: boolean
  readonly canEditWorlds: boolean
  readonly canEditRelations: boolean
  readonly canUseHistory: boolean
  readonly canRepositionWorlds: boolean
  readonly selectedRelation: boolean
  readonly undoAvailable: boolean
  readonly redoAvailable: boolean
  readonly worldCount: number
  readonly focusedIntro: boolean
  readonly showDerivedRelations: boolean
  readonly derivedRelationCount: number
  readonly frameRuleCount: number
  readonly flowInstance: ReactFlowInstance | null
  readonly onApplyPreset: (preset: 'build' | 'evaluate' | 'frame') => void
  readonly onAddWorld: () => void
  readonly onDeleteRelation: () => void
  readonly onToggleEvaluationPanel: () => void
  readonly onToggleModelPanel: () => void
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onTidy: () => void
  readonly onToggleDerived: () => void
  readonly onOpenFrameRules: () => void
  readonly onVerify: () => void
}

const mobileToolbarMediaQuery = '(max-width: 760px)'

function useMobileToolbar() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(mobileToolbarMediaQuery).matches)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia(mobileToolbarMediaQuery)
    const sync = () => setMobile(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return mobile
}

export function WorkspaceToolbar(props: WorkspaceToolbarProps) {
  const {
    sandbox, editorMode, rightPanelOpen, showWorldPanel, showEdgePanel, leftPanelOpen,
    canAddWorld, canEditWorlds, canEditRelations, canUseHistory, canRepositionWorlds,
    selectedRelation, undoAvailable, redoAvailable, worldCount, focusedIntro,
    showDerivedRelations, derivedRelationCount, frameRuleCount, flowInstance,
    onApplyPreset, onAddWorld, onDeleteRelation, onToggleEvaluationPanel,
    onToggleModelPanel, onUndo, onRedo, onTidy, onToggleDerived,
    onOpenFrameRules, onVerify,
  } = props
  const mobileToolbar = useMobileToolbar()
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const runSecondary = (action: () => void) => {
    action()
    setMobileMoreOpen(false)
  }

  const derivedLabel = `${showDerivedRelations ? 'Hide' : 'Show'} derived`

  return <div className="workspace-toolbar-content" data-tour-target="map-toolbar">
    {!mobileToolbar ? <div className="workspace-toolbar-desktop">
      {sandbox && <div className="workspace-presets" aria-label="Workspace presets"><button type="button" className={editorMode === 'edit' && rightPanelOpen ? 'active' : ''} onClick={() => onApplyPreset('build')}>◇ Model · Build</button><button type="button" className={editorMode === 'evaluate' ? 'active' : ''} onClick={() => onApplyPreset('evaluate')}>φ Formula · Evaluate</button><button type="button" onClick={() => onApplyPreset('frame')}>R Frame rules</button></div>}
      <div className="map-toolbar-group" aria-label="Model actions">
        {canAddWorld && <button type="button" onClick={onAddWorld} disabled={!canEditWorlds}>+ World</button>}
        {selectedRelation && <button type="button" className="delete-edge-button" disabled={!canEditRelations} onClick={onDeleteRelation}>Delete relation</button>}
      </div>
      <div className="map-toolbar-group" aria-label="Panels and history">
        <button type="button" className={!leftPanelOpen ? 'panel-toggle active' : 'panel-toggle'} onClick={onToggleEvaluationPanel} aria-label="Toggle Evaluation panel" aria-pressed={leftPanelOpen} title="Toggle Evaluation panel">◧ Evaluation</button>
        {(showWorldPanel || showEdgePanel) && <button type="button" className={!rightPanelOpen ? 'panel-toggle active' : 'panel-toggle'} onClick={onToggleModelPanel} aria-label="Toggle Model panel" aria-pressed={rightPanelOpen} title="Toggle Model panel">◨ Model</button>}
        {canUseHistory && <><button type="button" onClick={onUndo} disabled={!undoAvailable} aria-label="Undo" title="Undo">↶</button><button type="button" onClick={onRedo} disabled={!redoAvailable} aria-label="Redo" title="Redo">↷</button></>}
      </div>
      <div className="map-toolbar-group" aria-label="Viewport actions">
        <button type="button" onClick={() => void flowInstance?.zoomIn()} disabled={!flowInstance} aria-label="Zoom in" title="Zoom in">+</button>
        <button type="button" onClick={() => void flowInstance?.zoomOut()} disabled={!flowInstance} aria-label="Zoom out" title="Zoom out">−</button>
        <button type="button" onClick={() => void flowInstance?.fitView({ padding: 0.25 })} disabled={!flowInstance || worldCount === 0}>Fit model</button>
        <button type="button" onClick={onTidy} disabled={worldCount < 2 || (!sandbox && !canRepositionWorlds)}>Tidy model</button>
      </div>
      <div className="map-toolbar-group" aria-label="Analysis actions">
        {!focusedIntro && <button type="button" aria-label={derivedLabel} className={!showDerivedRelations ? 'muted' : ''} onClick={onToggleDerived}>{derivedLabel} ({derivedRelationCount})</button>}
        {!focusedIntro && <button type="button" className="frame-rules-button" onClick={onOpenFrameRules}>Frame rules{frameRuleCount ? ` (${frameRuleCount})` : ''}</button>}
        {editorMode === 'evaluate' && <button type="button" className="toolbar-verify" onClick={onVerify}>Verify</button>}
      </div>
    </div> : <div className="workspace-toolbar-mobile">
      <div className="map-toolbar-group toolbar-primary-actions" aria-label="Model actions">
        {canAddWorld && <button type="button" onClick={onAddWorld} disabled={!canEditWorlds}>+ World</button>}
        {selectedRelation && <button type="button" className="delete-edge-button" disabled={!canEditRelations} onClick={onDeleteRelation}>Delete relation</button>}
      </div>
      {canUseHistory && <div className="map-toolbar-group toolbar-primary-history" aria-label="Undo action"><button type="button" onClick={onUndo} disabled={!undoAvailable} aria-label="Undo" title="Undo">↶</button></div>}
      {editorMode === 'evaluate' && <button type="button" className="toolbar-verify workspace-primary-verify" onClick={onVerify}>Verify</button>}
      <button type="button" className="mobile-toolbar-more-button" aria-label="More model tools" aria-expanded={mobileMoreOpen} onClick={() => setMobileMoreOpen((open) => !open)}>•••</button>

      <div className={`workspace-toolbar-secondary ${mobileMoreOpen ? 'open' : ''}`}>
        {sandbox && <div className="workspace-presets" aria-label="Workspace presets"><button type="button" className={editorMode === 'edit' && rightPanelOpen ? 'active' : ''} onClick={() => runSecondary(() => onApplyPreset('build'))}>◇ Model · Build</button><button type="button" className={editorMode === 'evaluate' ? 'active' : ''} onClick={() => runSecondary(() => onApplyPreset('evaluate'))}>φ Formula · Evaluate</button><button type="button" onClick={() => runSecondary(() => onApplyPreset('frame'))}>R Frame rules</button></div>}
        <div className="map-toolbar-group" aria-label="Panels and history">
          <button type="button" className={!leftPanelOpen ? 'panel-toggle active' : 'panel-toggle'} onClick={() => runSecondary(onToggleEvaluationPanel)} aria-label="Toggle Evaluation panel" aria-pressed={leftPanelOpen} title="Toggle Evaluation panel">◧ Evaluation</button>
          {(showWorldPanel || showEdgePanel) && <button type="button" className={!rightPanelOpen ? 'panel-toggle active' : 'panel-toggle'} onClick={() => runSecondary(onToggleModelPanel)} aria-label="Toggle Model panel" aria-pressed={rightPanelOpen} title="Toggle Model panel">◨ Model</button>}
          {canUseHistory && <button type="button" onClick={() => runSecondary(onRedo)} disabled={!redoAvailable} aria-label="Redo" title="Redo">↷ Redo</button>}
        </div>
        <div className="map-toolbar-group" aria-label="Viewport actions">
          <button type="button" onClick={() => runSecondary(() => { void flowInstance?.zoomIn() })} disabled={!flowInstance} aria-label="Zoom in" title="Zoom in">+ Zoom</button>
          <button type="button" onClick={() => runSecondary(() => { void flowInstance?.zoomOut() })} disabled={!flowInstance} aria-label="Zoom out" title="Zoom out">− Zoom</button>
          <button type="button" onClick={() => runSecondary(() => { void flowInstance?.fitView({ padding: 0.25 }) })} disabled={!flowInstance || worldCount === 0}>Fit model</button>
          <button type="button" onClick={() => runSecondary(onTidy)} disabled={worldCount < 2 || (!sandbox && !canRepositionWorlds)}>Tidy model</button>
        </div>
        <div className="map-toolbar-group" aria-label="Analysis actions">
          {!focusedIntro && <button type="button" aria-label={derivedLabel} className={!showDerivedRelations ? 'muted' : ''} onClick={() => runSecondary(onToggleDerived)}>{derivedLabel} ({derivedRelationCount})</button>}
          {!focusedIntro && <button type="button" className="frame-rules-button" onClick={() => runSecondary(onOpenFrameRules)}>Frame rules{frameRuleCount ? ` (${frameRuleCount})` : ''}</button>}
        </div>
      </div>
    </div>}
  </div>
}
