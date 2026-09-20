import { useState } from 'react'
import { SectionTabs } from './SectionTabs'

type HelpSection = 'workspace' | 'objectives' | 'results' | 'data'
const sections: readonly [HelpSection, string][] = [['workspace', 'Workspace controls'], ['objectives', 'Objectives & constraints'], ['results', 'Results'], ['data', 'Local data']]

export function HelpView({ hasCurrentMission, onReturnToMission, onReplayWelcome, onReplayControls, onReplayTour }: {
  readonly hasCurrentMission: boolean
  readonly onReturnToMission: () => void
  readonly onReplayWelcome: () => void
  readonly onReplayControls: () => void
  readonly onReplayTour: () => void
}) {
  const [section, setSection] = useState<HelpSection>('workspace')
  return <section className="content-screen guide-screen" aria-labelledby="help-title">
    <div className="screen-hero compact"><div><p className="eyebrow">Application manual</p><h1 id="help-title" className="clean-display">Help &amp; Controls</h1><p>Workspace controls, objectives, verification, and local data.</p></div>{hasCurrentMission && <button type="button" onClick={onReturnToMission}>Return to current mission</button>}</div>
    <div className="guide-actions"><button type="button" onClick={onReplayControls}>Replay Learn the Controls</button><button type="button" onClick={onReplayTour}>Replay workspace tour</button><button type="button" onClick={onReplayWelcome}>Replay Welcome</button></div>
    <SectionTabs label="Help sections" sections={sections} value={section} onChange={setSection} />
    <div className="guide-page-grid">
      {section === 'workspace' && <><article><h2>Select and edit worlds</h2><p>Click a world to select it. Edit its name and true atoms with the available controls.</p></article><article><h2>Model editing</h2><p>Use + World to add a world. Drag from a source world to a destination to add a relation. Select a relation to delete it. Use Undo and Redo for recent edits.</p></article><article><h2>Map navigation</h2><p>Drag empty space to pan. Use the mouse wheel or pinch gesture to zoom. Use a two-finger touchpad gesture to pan.</p></article><article><h2>Workspace layout</h2><p>Drag the vertical separators to resize panels. Use arrow keys on a focused separator. Hold Shift for larger steps.</p></article></>}
      {section === 'objectives' && <><article><h2>Current objective</h2><p>Read the highlighted Objective in the mission header.</p></article><article><h2>Constraints</h2><p>Missions can set visible size limits, atom and relation conditions, and frame properties.</p></article><article><h2>Available controls</h2><p>Guided tasks show the editing controls available for the current objective.</p></article></>}
      {section === 'results' && <><article><h2>Check task</h2><p>Select Check task to verify the current answer.</p></article><article><h2>Semantic details</h2><p>Expand Semantic details to inspect truth by world, countervaluations, diagnostics, and the evaluation tree.</p></article><article><h2>More help</h2><p>Use Details &amp; hints for guidance on the current task.</p></article></>}
      {section === 'data' && <><article><h2>Local persistence</h2><p>Model Sandbox, progress, settings, and desktop panel widths are stored locally in this browser.</p></article><article><h2>Import and export</h2><p>The Data area exports or imports versioned model JSON and can reset Model Sandbox or learning progress independently.</p></article></>}
    </div>
  </section>
}
