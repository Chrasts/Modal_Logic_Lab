import type { WorldPosition } from './world-placement'
import type { FramePropertyName } from '../logic'

export interface EditableWorld {
  readonly key: number
  id: string
  atoms: string
  position: WorldPosition
}

export interface EditableEdge {
  readonly key: number
  from: string
  to: string
}

export interface EdgeDraft {
  readonly from: string
  readonly to: string
  readonly error?: string
}

export type FrameRuleMode = 'off' | 'validate' | 'enforce'
export type FrameRules = Record<FramePropertyName, FrameRuleMode>

/** Semantic editor state shared by history, authoring, and workspace transitions. */
export interface ModelSnapshot {
  readonly worlds: EditableWorld[]
  readonly edges: EditableEdge[]
  readonly evaluationWorld: string
  readonly frameRules: FrameRules
}
