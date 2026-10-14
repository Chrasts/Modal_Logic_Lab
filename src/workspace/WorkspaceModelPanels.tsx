import type { ChangeEvent } from 'react'
import { WorldIdInput } from './WorldIdInput'
import type { EditableEdge, EditableWorld, EdgeDraft } from './model-types'

interface WorkspaceModelPanelsProps {
  readonly showWorldPanel: boolean
  readonly showEdgePanel: boolean
  readonly worlds: readonly EditableWorld[]
  readonly edges: readonly EditableEdge[]
  readonly canShowWorldAdd: boolean
  readonly tutorialAllows: (area: 'worlds' | 'valuations') => boolean
  readonly canEditWorlds: boolean
  readonly canEditValuations: boolean
  readonly canEditEdges: boolean
  readonly showValuations: boolean
  readonly howToPlay: boolean
  readonly usableWorldIds: readonly string[]
  readonly edgeEditErrors: Readonly<Record<number, string>>
  readonly edgeDraft: EdgeDraft | null
  readonly derivedRelationCount: number
  readonly showDerivedEdges: boolean
  readonly onSelectWorld: (key: number) => void
  readonly onRenameWorld: (key: number, value: string) => string | null
  readonly onUpdateWorldAtoms: (key: number, value: string) => void
  readonly onSaveHistory: () => void
  readonly onRemoveWorld: (key: number) => void
  readonly onAddWorld: () => void
  readonly onSelectEdge: (key: number) => void
  readonly onReplaceEdgeEndpoint: (key: number, endpoint: 'from' | 'to', value: string) => void
  readonly onDeleteEdge: (key: number) => void
  readonly onEdgeDraftChange: (draft: EdgeDraft) => void
  readonly onCommitEdgeDraft: () => void
  readonly onCancelEdgeDraft: () => void
  readonly onAddEdge: () => void
}

/** Synchronized editors for worlds, valuations and explicit accessibility relations. */
export function WorkspaceModelPanels({
  showWorldPanel, showEdgePanel, worlds, edges, canShowWorldAdd, tutorialAllows, canEditWorlds,
  canEditValuations, canEditEdges, showValuations, howToPlay, usableWorldIds, edgeEditErrors,
  edgeDraft, derivedRelationCount, showDerivedEdges, onSelectWorld, onRenameWorld, onUpdateWorldAtoms,
  onSaveHistory, onRemoveWorld, onAddWorld, onSelectEdge, onReplaceEdgeEndpoint, onDeleteEdge,
  onEdgeDraftChange, onCommitEdgeDraft, onCancelEdgeDraft, onAddEdge,
}: WorkspaceModelPanelsProps) {
  const updateAtoms = (world: EditableWorld, event: ChangeEvent<HTMLInputElement>) => {
    onUpdateWorldAtoms(world.key, event.target.value)
  }

  return <>
    {showWorldPanel && <div className="panel model-panel" data-tour-target="editing-controls">
      <div className="panel-heading">
        <div><h2>Worlds and valuations</h2><p>Separate atoms with spaces or commas</p></div>
      </div>
      <div className="world-list">
        {worlds.length === 0 && <div className="empty-card"><strong>No worlds yet</strong><span>Add a world to start building a model.</span></div>}
        {worlds.map((world, index) => (
          <div className="world-row" key={world.key} onClick={() => onSelectWorld(world.key)}>
            <span className="world-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {canEditWorlds || !howToPlay ? <label><span>World</span><WorldIdInput ariaLabel={`World ${world.id || index + 1}`} disabled={!canEditWorlds} value={world.id} onCommit={(value) => onRenameWorld(world.key, value)} /></label> : <span className="readonly-world"><small>World</small>{world.id}</span>}
            {showValuations && tutorialAllows('valuations') && <label className="atoms-field"><span>True atoms</span><input disabled={!canEditValuations} value={world.atoms} placeholder={howToPlay ? 'p' : 'p, q'} onFocus={onSaveHistory} onChange={(event) => updateAtoms(world, event)} /></label>}
            {canEditWorlds && <button type="button" className="remove-button" onClick={() => onRemoveWorld(world.key)} aria-label={`Delete world ${world.id}`}>×</button>}
          </div>
        ))}
      </div>
      {canShowWorldAdd && tutorialAllows('worlds') && <button type="button" className="secondary-button" onClick={onAddWorld} disabled={!canEditWorlds}>+ Add world</button>}
    </div>}

    {showEdgePanel && <div className="panel edge-panel">
      <div className="panel-heading"><div><h2>Accessibility</h2></div></div>
      <div className="edge-list">
        {edges.length === 0 && <p className="empty-state">The model has no explicit relations.</p>}
        {edges.map((edge) => (
          <div className="edge-row" key={edge.key} onClick={() => onSelectEdge(edge.key)}>
            <span className="edge-mark" aria-hidden="true">R</span>
            <select disabled={!canEditEdges} aria-label="Relation source world" value={edge.from} onChange={(event) => onReplaceEdgeEndpoint(edge.key, 'from', event.target.value)}>
              {usableWorldIds.map((id) => <option key={id}>{id}</option>)}
            </select>
            <span className="relation-arrow" aria-hidden="true">→</span>
            <select disabled={!canEditEdges} aria-label="Relation target world" value={edge.to} onChange={(event) => onReplaceEdgeEndpoint(edge.key, 'to', event.target.value)}>
              {usableWorldIds.map((id) => <option key={id}>{id}</option>)}
            </select>
            <button type="button" className="remove-button" disabled={!canEditEdges} onClick={() => onDeleteEdge(edge.key)} aria-label="Delete relation">×</button>
            {edgeEditErrors[edge.key] && <small className="field-error" role="alert">{edgeEditErrors[edge.key]}</small>}
          </div>
        ))}
        {edgeDraft && <div className="edge-row edge-draft-row">
          <span className="edge-mark" aria-hidden="true">R</span>
          <select aria-label="New relation source world" value={edgeDraft.from} onChange={(event) => onEdgeDraftChange({ from: event.target.value, to: edgeDraft.to })}><option value="">Choose source</option>{usableWorldIds.map((id) => <option key={id}>{id}</option>)}</select>
          <span className="relation-arrow" aria-hidden="true">→</span>
          <select aria-label="New relation target world" value={edgeDraft.to} onChange={(event) => onEdgeDraftChange({ from: edgeDraft.from, to: event.target.value })}><option value="">Choose destination</option>{usableWorldIds.map((id) => <option key={id}>{id}</option>)}</select>
          <button type="button" className="secondary-button" disabled={!edgeDraft.from || !edgeDraft.to} onClick={onCommitEdgeDraft}>Add relation</button>
          <button type="button" className="text-button" onClick={onCancelEdgeDraft}>Cancel</button>
          {edgeDraft.error && <small className="field-error" role="alert">{edgeDraft.error}</small>}
        </div>}
      </div>
      {derivedRelationCount > 0 && <p className="derived-summary">+ {derivedRelationCount} relation{derivedRelationCount === 1 ? '' : 's'} derived from frame properties. {showDerivedEdges ? 'Shown' : 'Hidden'} for display only. Verification always uses enforced relations.</p>}
      <button type="button" className="secondary-button" onClick={onAddEdge} disabled={worlds.length === 0 || !canEditEdges || edgeDraft !== null}>+ Add relation</button>
    </div>}
  </>
}
