import { WorldIdInput } from './WorldIdInput'
import type { AccessibilityEdge } from '../logic/model'
import type { EditableWorld } from './model-types'

interface WorkspaceModelTableProps {
  readonly worlds: readonly EditableWorld[]
  readonly effectiveEdges: readonly AccessibilityEdge[]
  readonly explicitEdgePairKeys: ReadonlyMap<string, number>
  readonly activeTraceWorldId?: string
  readonly canEditWorlds: boolean
  readonly canEditValuations: boolean
  readonly canEditEvaluation: boolean
  readonly questionWorldChoice: boolean
  readonly predictionAnswer: string
  readonly onRenameWorld: (key: number, value: string) => string | null
  readonly onUpdateWorldAtoms: (key: number, value: string) => void
  readonly onSaveHistory: () => void
  readonly onChooseWorld: (worldId: string) => void
  readonly onSelectEvaluationWorld: (worldId: string) => void
  readonly onRemoveWorld: (key: number) => void
  readonly onAddWorld: () => void
}

/** Keyboard-first representation of the same finite model shown on the graph canvas. */
export function WorkspaceModelTable({
  worlds, effectiveEdges, explicitEdgePairKeys, activeTraceWorldId, canEditWorlds, canEditValuations,
  canEditEvaluation, questionWorldChoice, predictionAnswer, onRenameWorld, onUpdateWorldAtoms,
  onSaveHistory, onChooseWorld, onSelectEvaluationWorld, onRemoveWorld, onAddWorld,
}: WorkspaceModelTableProps) {
  return <div className="model-table-wrap">
    <table className="model-table">
      <caption>Keyboard-accessible model view. Changes are synchronized with the graph.</caption>
      <thead><tr><th>World</th><th>Atoms</th><th>Accessible worlds</th><th>Actions</th></tr></thead>
      <tbody>{worlds.map((world) => {
        const worldId = world.id.trim()
        const successors = effectiveEdges.filter(({ from }) => from === worldId)
        return <tr key={world.key} className={worldId === activeTraceWorldId ? 'current' : ''}>
          <td><WorldIdInput ariaLabel={`Table world ${world.id || world.key}`} disabled={!canEditWorlds} value={world.id} onCommit={(value) => onRenameWorld(world.key, value)} /></td>
          <td><input aria-label={`Atoms at ${world.id || world.key}`} disabled={!canEditValuations} value={world.atoms} placeholder="none" onFocus={onSaveHistory} onChange={(event) => onUpdateWorldAtoms(world.key, event.target.value)} /></td>
          <td><div className="successor-chips">{successors.map(({ from, to }) => {
            const derived = !explicitEdgePairKeys.has(`${from}\u0000${to}`)
            return <span key={`${from}:${to}`} className={derived ? 'derived' : 'explicit'} aria-label={`${to}, ${derived ? 'derived' : 'explicit'}`}>{to}<small>{derived ? 'derived' : 'explicit'}</small></span>
          })}{successors.length === 0 && 'none'}</div></td>
          <td>{questionWorldChoice ? <button type="button" className={predictionAnswer === worldId ? 'active' : ''} aria-pressed={predictionAnswer === worldId} onClick={() => onChooseWorld(worldId)}>Choose world</button> : <button type="button" onClick={() => onSelectEvaluationWorld(worldId)} disabled={!worldId || !canEditEvaluation}>Evaluate here</button>}{canEditWorlds && <button type="button" className="danger" onClick={() => onRemoveWorld(world.key)}>Delete</button>}</td>
        </tr>
      })}</tbody>
    </table>
    {worlds.length === 0 && <div className="empty-card"><strong>No worlds yet</strong><span>Add the first world to populate both views.</span><button type="button" onClick={onAddWorld} disabled={!canEditWorlds}>Add first world</button></div>}
  </div>
}
