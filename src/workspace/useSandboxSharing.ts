import type { Dispatch, SetStateAction } from 'react'
import type { ObjectiveScope } from '../logic'
import { createSandboxSharePayload, parseSandboxSharePayload, type SandboxShareFrameRuleMode } from '../sandbox-share'
import { createShareUrl } from '../share-url'

interface SandboxSharingOptions {
  readonly formulaIsValid: boolean
  readonly comparisonFormulaIsInvalid: boolean
  readonly formulaSource: string
  readonly comparisonFormulaSource: string
  readonly worlds: readonly { readonly id: string; readonly atoms: string }[]
  readonly edges: readonly { readonly from: string; readonly to: string }[]
  readonly evaluationWorld: string
  readonly evaluationScope: ObjectiveScope
  readonly targetTruth: boolean
  readonly frameRules: Readonly<Record<string, SandboxShareFrameRuleMode>>
  readonly setShareLink: Dispatch<SetStateAction<string>>
  readonly setSandboxShareMessage: Dispatch<SetStateAction<string>>
}

/** Creates a versioned Sandbox URL only after its mathematical state validates. */
export function useSandboxSharing(options: SandboxSharingOptions) {
  return async () => {
    try {
      if (!options.formulaIsValid) throw new Error('Enter a valid primary formula before sharing the Sandbox.')
      if (options.comparisonFormulaIsInvalid) throw new Error('Fix the comparison formula before sharing the Sandbox.')
      const payload = createSandboxSharePayload({
        worlds: options.worlds.map(({ id, atoms }) => ({ id: id.trim(), atoms: atoms.split(/[\s,]+/u).filter(Boolean) })),
        edges: options.edges.map(({ from, to }) => ({ from, to })),
        evaluationWorld: options.evaluationWorld,
        formula: options.formulaSource,
        comparisonFormula: options.comparisonFormulaSource,
        scope: options.evaluationScope,
        targetTruth: options.targetTruth,
        frameRules: options.frameRules as ReturnType<typeof createSandboxSharePayload>['frameRules'],
      })
      parseSandboxSharePayload(payload)
      const link = createShareUrl(JSON.stringify(payload))
      options.setShareLink(link)
      try {
        await navigator.clipboard.writeText(link)
        options.setSandboxShareMessage('Sandbox link copied to the clipboard.')
      } catch {
        options.setSandboxShareMessage('Clipboard access was unavailable. Copy the visible link manually.')
      }
    } catch (error) {
      options.setSandboxShareMessage(error instanceof Error ? error.message : 'Could not share the Sandbox.')
    }
  }
}
