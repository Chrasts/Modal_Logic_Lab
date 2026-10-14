import type { Dispatch, SetStateAction } from 'react'
import type { GameLevel } from '../campaign'
import { parseCustomCampaign, serializeCustomCampaign } from '../campaign-format'
import { parseCustomLevelFile, parseCustomLevelPackage, serializeCustomLevel, type ParsedCustomLevelFile, type ReferenceSolution } from '../level-format'
import { auditMission, type MissionAuditFinding } from '../mission-audit'
import { createShareUrl } from '../share-url'

interface AuthoringPublishingOptions {
  readonly currentMission: () => GameLevel
  readonly serializeCurrentMission: () => string
  readonly referenceSolution: ReferenceSolution | null
  readonly importedMission: ParsedCustomLevelFile | null
  readonly campaignTitle: string
  readonly campaignDescription: string
  readonly campaignMissions: readonly ParsedCustomLevelFile[]
  readonly setCampaignMissions: Dispatch<SetStateAction<readonly ParsedCustomLevelFile[]>>
  readonly setAuditFindings: Dispatch<SetStateAction<readonly MissionAuditFinding[]>>
  readonly setDataMessage: Dispatch<SetStateAction<string>>
  readonly setShareLink: Dispatch<SetStateAction<string>>
  readonly downloadJson: (contents: string, filename: string) => void
}

const errorMessage = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback

/** Owns authoring-only validation, package download, and local share-link actions. */
export function useAuthoringPublishing({
  currentMission, serializeCurrentMission, referenceSolution, importedMission,
  campaignTitle, campaignDescription, campaignMissions, setCampaignMissions,
  setAuditFindings, setDataMessage, setShareLink, downloadJson,
}: AuthoringPublishingOptions) {
  const runMissionAudit = (): boolean => {
    try {
      const findings = auditMission(currentMission(), referenceSolution ?? undefined)
      setAuditFindings(findings)
      const errors = findings.filter(({ severity }) => severity === 'error')
      setDataMessage(errors.length ? `Mission audit found ${errors.length} blocking issue(s).` : 'Mission audit passed. Review any warnings before sharing.')
      return errors.length === 0
    } catch (error) {
      setAuditFindings([{ severity: 'error', check: 'Mission configuration', detail: errorMessage(error, 'The mission cannot be audited.') }])
      setDataMessage(errorMessage(error, 'The mission cannot be audited.'))
      return false
    }
  }

  const downloadCustomLevel = () => {
    try {
      if (!runMissionAudit()) return
      const contents = importedMission
        ? serializeCustomLevel(importedMission.level, importedMission.referenceSolution)
        : serializeCurrentMission()
      parseCustomLevelFile(JSON.parse(contents))
      downloadJson(contents, `${currentMission().id}.json`)
      setDataMessage('Custom mission exported.')
    } catch (error) {
      setDataMessage(errorMessage(error, 'Could not export the custom mission.'))
    }
  }

  const addMissionToCustomCampaign = () => {
    try {
      if (!runMissionAudit()) return
      const mission = parseCustomLevelPackage(JSON.parse(serializeCurrentMission()))
      if (campaignMissions.some(({ level }) => level.id === mission.level.id)) throw new Error(`The campaign already contains mission id “${mission.level.id}”. Change the mission title before adding another version.`)
      setCampaignMissions((current) => [...current, mission])
      setDataMessage(`Added “${mission.level.title}” to the custom campaign.`)
    } catch (error) {
      setDataMessage(errorMessage(error, 'Could not add the mission to the campaign.'))
    }
  }

  const downloadCustomCampaign = () => {
    try {
      const contents = serializeCustomCampaign(campaignTitle, campaignDescription, campaignMissions)
      parseCustomCampaign(JSON.parse(contents))
      const filename = `${campaignTitle.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '') || 'custom-campaign'}.json`
      downloadJson(contents, filename)
      setDataMessage('Custom campaign exported.')
    } catch (error) {
      setDataMessage(errorMessage(error, 'Could not export the custom campaign.'))
    }
  }

  const generateMissionShareLink = () => {
    try {
      if (!runMissionAudit()) return
      const contents = serializeCurrentMission()
      parseCustomLevelPackage(JSON.parse(contents))
      setShareLink(createShareUrl(contents))
      setDataMessage('Share link generated. Anyone opening it will start this mission locally in their browser.')
    } catch (error) {
      setDataMessage(errorMessage(error, 'Could not generate the mission link.'))
    }
  }

  const generateCampaignShareLink = () => {
    try {
      const contents = serializeCustomCampaign(campaignTitle, campaignDescription, campaignMissions)
      parseCustomCampaign(JSON.parse(contents))
      setShareLink(createShareUrl(contents))
      setDataMessage('Campaign share link generated.')
    } catch (error) {
      setDataMessage(errorMessage(error, 'Could not generate the campaign link.'))
    }
  }

  return { runMissionAudit, downloadCustomLevel, addMissionToCustomCampaign, downloadCustomCampaign, generateMissionShareLink, generateCampaignShareLink }
}
