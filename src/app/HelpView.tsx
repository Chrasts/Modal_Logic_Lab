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
  return <section className="content-screen help-screen" aria-labelledby="help-title">
    <header className="help-heading"><div><h1 id="help-title">Help &amp; Controls</h1><p>Short guidance for the current workspace and its model controls.</p></div>{hasCurrentMission && <button type="button" className="row-action" onClick={onReturnToMission}>Return to current mission <span aria-hidden="true">→</span></button>}</header>
    <div className="help-layout">
      <nav className="help-sections"><SectionTabs label="Help sections" sections={sections} value={section} onChange={setSection} /><div className="help-replays"><button type="button" onClick={onReplayControls}>Learn the controls</button><button type="button" onClick={onReplayTour}>Workspace tour</button><button type="button" onClick={onReplayWelcome}>Modal logic introduction</button></div></nav>
      <div className="help-content">
        {section === 'workspace' && <><section><h2>Worlds and relations</h2><dl><div><dt>Select a world</dt><dd>Click a world to inspect its identifier and valuation. The selected world is not automatically the evaluation world.</dd></div><div><dt>Edit the model</dt><dd>Use Add world, then draw a relation from a source world to a destination. Select a relation before deleting it.</dd></div><div><dt>Navigate the map</dt><dd>Drag empty canvas to pan. Use the wheel or pinch to zoom. A two-finger trackpad gesture pans the map.</dd></div></dl></section><section><h2>Layout</h2><p>Drag a panel divider to change its width. A focused divider also accepts arrow keys. Hold Shift for larger steps.</p></section></>}
        {section === 'objectives' && <><section><h2>Read the objective first</h2><p>The mission header names the result to construct. Constraints list the worlds, relations, valuations, or frame properties that matter for that mission.</p></section><section><h2>Available editing</h2><p>A guided mission may lock parts of the model. The visible workspace controls reflect what can be changed.</p></section></>}
        {section === 'results' && <><section><h2>Check the model or answer</h2><p>Use Check model after completing the requested construction or answer. A result states whether the current model satisfies the objective.</p></section><section><h2>Inspect semantics</h2><p>Open Semantic details for truth by world, countervaluations, diagnostics, and the evaluation tree. Details &amp; hints offers optional guidance.</p></section></>}
        {section === 'data' && <><section><h2>Stored locally</h2><p>The Model Sandbox, progress, settings, and desktop panel widths stay in this browser.</p></section><section><h2>Import and export</h2><p>Data can export or import versioned model JSON and independently reset the sandbox or learning progress.</p></section></>}
      </div>
    </div>
  </section>
}
