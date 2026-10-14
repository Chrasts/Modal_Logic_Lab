import type { Dispatch, SetStateAction } from 'react'
import { describe, expect, it } from 'vitest'
import type { GameLevel } from '../campaign'
import { serializeCustomLevel, type ParsedCustomLevelFile, type ReferenceSolution } from '../level-format'
import type { MissionAuditFinding } from '../mission-audit'
import { useAuthoringPublishing } from './useAuthoringPublishing'

const mission: GameLevel = {
  id: 'authoring-publish', chapter: 'Custom', title: 'Authoring publish', concept: 'Possibility', learningObjective: 'Construct a witness.',
  instruction: 'Make diamond p true at w0.', formula: 'diamond p', scope: 'pointed', targetTruth: true, evaluationWorld: 'w0',
  worlds: [{ id: 'w0', atoms: '', position: { x: 0, y: 0 } }, { id: 'w1', atoms: 'p', position: { x: 100, y: 0 } }],
  edges: [], editable: ['edges'],
}
const solution: ReferenceSolution = { worlds: mission.worlds, edges: [{ from: 'w0', to: 'w1' }], evaluationWorld: 'w0' }

describe('authoring publishing controller', () => {
  it('audits a mission before adding its validated package to a campaign', () => {
    let campaign: readonly ParsedCustomLevelFile[] = []
    let findings: readonly MissionAuditFinding[] = []
    let message = ''
    const setCampaign: Dispatch<SetStateAction<readonly ParsedCustomLevelFile[]>> = (next) => { campaign = typeof next === 'function' ? next(campaign) : next }
    const setFindings: Dispatch<SetStateAction<readonly MissionAuditFinding[]>> = (next) => { findings = typeof next === 'function' ? next(findings) : next }
    const setMessage: Dispatch<SetStateAction<string>> = (next) => { message = typeof next === 'function' ? next(message) : next }
    const publishing = useAuthoringPublishing({
      currentMission: () => mission, serializeCurrentMission: () => serializeCustomLevel(mission, solution), referenceSolution: solution, importedMission: null,
      campaignTitle: 'Authoring examples', campaignDescription: '', campaignMissions: campaign, setCampaignMissions: setCampaign,
      setAuditFindings: setFindings, setDataMessage: setMessage, setShareLink: () => undefined, downloadJson: () => undefined,
    })

    publishing.addMissionToCustomCampaign()

    expect(findings.some(({ severity }) => severity === 'error')).toBe(false)
    expect(campaign.map(({ level }) => level.id)).toEqual(['authoring-publish'])
    expect(message).toContain('Added')
  })
})
