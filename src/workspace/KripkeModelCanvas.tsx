import type { ReactNode, RefObject } from 'react'

interface KripkeModelCanvasProps {
  readonly modelView: 'graph' | 'table'
  readonly onModelViewChange: (view: 'graph' | 'table') => void
  readonly graphCanvasRef: RefObject<HTMLDivElement | null>
  readonly table: ReactNode
  readonly children: ReactNode
}

/** Shared shell for the graphical and keyboard-first representations of one finite model. */
export function KripkeModelCanvas({ modelView, onModelViewChange, graphCanvasRef, table, children }: KripkeModelCanvasProps) {
  return <div className="panel graph-panel">
    <div className="panel-heading">
      <div><h2>Visual model</h2></div>
      <div className="model-view-switch" role="group" aria-label="Model view">
        <button type="button" className={modelView === 'graph' ? 'active' : ''} aria-pressed={modelView === 'graph'} onClick={() => onModelViewChange('graph')}>Graph</button>
        <button type="button" className={modelView === 'table' ? 'active' : ''} aria-pressed={modelView === 'table'} onClick={() => onModelViewChange('table')}>Table</button>
      </div>
    </div>
    <div className="graph-canvas" ref={graphCanvasRef} data-tour-target="model-map">{modelView === 'graph' ? children : table}</div>
  </div>
}
