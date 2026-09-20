interface WorkspaceQuickHelpProps {
  readonly onClose: () => void
  readonly onOpenHelp: () => void
  readonly onReplayTour: () => void
}

const quickHelpSections = [
  ['Edit the model', 'Use + World to add worlds. Drag from a source world to a destination to add a relation. Select a world to edit its name or true atoms.'],
  ['Navigate the map', 'Drag empty space to pan. Use the mouse wheel or pinch gesture to zoom. Use a two-finger touchpad gesture to pan.'],
  ['Answer questions', 'Choose a world on the graph or in Table view when asked. Use the answer control shown for other questions.'],
  ['Verify', 'Select Check task after completing the requested edit or answer. Open Semantic details for more information.'],
  ['Keyboard', 'Use Tab to move through controls. Enter or Space selects a focused world. Delete removes a selected editable item. Ctrl+Z and Ctrl+Y undo and redo.'],
] as const

export function WorkspaceQuickHelp({ onClose, onOpenHelp, onReplayTour }: WorkspaceQuickHelpProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="help-dialog workspace-quick-help" role="dialog" aria-modal="true" aria-labelledby="quick-help-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-heading"><div><p className="eyebrow">Workspace reference</p><h2 id="quick-help-title">Quick help</h2></div><button type="button" className="dialog-close" onClick={onClose} aria-label="Close quick help">×</button></div>
        <div className="quick-help-grid">{quickHelpSections.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
        <div className="quick-help-actions"><button type="button" className="primary-action" onClick={onOpenHelp}>Open full Help</button><button type="button" className="secondary-button" onClick={onReplayTour}>Replay workspace tour</button></div>
      </section>
    </div>
  )
}
