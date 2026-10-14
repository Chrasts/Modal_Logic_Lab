import { Panel } from '@xyflow/react'
import type { RefObject } from 'react'
import { WorldIdInput } from './WorldIdInput'
import type { EditableWorld } from './model-types'

interface KripkeWorldInspectorProps {
  readonly world: EditableWorld | null
  readonly worlds: readonly EditableWorld[]
  readonly canEditWorlds: boolean
  readonly canEditValuations: boolean
  readonly canEditEdges: boolean
  readonly canEditEvaluation: boolean
  readonly showValuations: boolean
  readonly showEvaluationControl: boolean
  readonly valuationsAllowed: boolean
  readonly evaluationAllowed: boolean
  readonly valuationInputRef: RefObject<HTMLInputElement | null>
  readonly onClose: () => void
  readonly onRename: (key: number, value: string) => string | null
  readonly onUpdateAtoms: (key: number, value: string) => void
  readonly onSaveHistory: () => void
  readonly onSelectEvaluationWorld: (worldId: string) => void
  readonly onRemoveWorld: (key: number) => void
  readonly onConnect: (sourceKey: number, targetKey: number) => void
}

/** Contextual editor for the selected world on the Kripke model canvas. */
export function KripkeWorldInspector({
  world, worlds, canEditWorlds, canEditValuations, canEditEdges, canEditEvaluation, showValuations,
  showEvaluationControl, valuationsAllowed, evaluationAllowed, valuationInputRef, onClose, onRename,
  onUpdateAtoms, onSaveHistory, onSelectEvaluationWorld, onRemoveWorld, onConnect,
}: KripkeWorldInspectorProps) {
  if (!world) return null
  return <Panel position="bottom-left" className="world-inspector">
    <div className="inspector-heading"><strong>{world.id || 'Unnamed world'}</strong><button type="button" onClick={onClose} aria-label="Close world inspector">×</button></div>
    {canEditWorlds && <label><span>Name</span><WorldIdInput value={world.id} ariaLabel={`Name of world ${world.id}`} onCommit={(value) => onRename(world.key, value)} /></label>}
    {showValuations && valuationsAllowed && <label><span>True atoms</span><input ref={valuationInputRef} disabled={!canEditValuations} value={world.atoms} onFocus={onSaveHistory} onChange={(event) => onUpdateAtoms(world.key, event.target.value)} /></label>}
    <div className="inspector-actions">
      {showEvaluationControl && evaluationAllowed && <button type="button" onClick={() => onSelectEvaluationWorld(world.id.trim())} disabled={!world.id.trim() || !canEditEvaluation}>Set as evaluation world</button>}
      {canEditWorlds && <button type="button" className="danger" onClick={() => onRemoveWorld(world.key)}>Delete</button>}
    </div>
    {canEditEdges && <label className="connect-world"><span>Connect to…</span><select aria-label={`Connect ${world.id} to world`} defaultValue="" onChange={(event) => { const target = worlds.find(({ id }) => id.trim() === event.target.value); if (target) onConnect(world.key, target.key); event.currentTarget.value = '' }}><option value="">Choose a world</option>{worlds.filter(({ id }) => id.trim()).map(({ id }) => <option key={id} value={id.trim()}>{id.trim()}</option>)}</select></label>}
  </Panel>
}
