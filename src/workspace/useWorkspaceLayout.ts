import { useEffect, useState, type RefObject } from 'react'
import { defaultWorkspaceLayout, normalizeWorkspaceLayout, resizeWorkspaceSide, type WorkspaceLayout } from './workspace-layout'

export const workspaceLayoutKey = 'logic-game:workspace-layout:v1'

const loadWorkspaceLayout = (): WorkspaceLayout => {
  try {
    return normalizeWorkspaceLayout(JSON.parse(localStorage.getItem(workspaceLayoutKey) ?? 'null'))
  } catch {
    return defaultWorkspaceLayout
  }
}

export const clearWorkspaceLayout = (): void => {
  try {
    localStorage.removeItem(workspaceLayoutKey)
  } catch {
    // The in-memory layout has already been reset.
  }
}

export function useWorkspaceLayout(workspaceRef: RefObject<HTMLElement | null>, isWorkspaceActive: boolean) {
  const [workspaceLayout, setWorkspaceLayout] = useState(loadWorkspaceLayout)

  useEffect(() => {
    try {
      localStorage.setItem(workspaceLayoutKey, JSON.stringify(workspaceLayout))
    } catch {
      // Layout remains available for this session.
    }
  }, [workspaceLayout])

  useEffect(() => {
    if (!isWorkspaceActive) return
    const reconcileWorkspaceWidth = () => {
      const width = workspaceRef.current?.clientWidth
      if (!width || width <= 0) return
      setWorkspaceLayout((current) => {
        const next = resizeWorkspaceSide(current, 'left', current.left, Math.max(0, width - 40))
        return next.left === current.left && next.right === current.right ? current : next
      })
    }
    reconcileWorkspaceWidth()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(reconcileWorkspaceWidth)
    if (workspaceRef.current) observer?.observe(workspaceRef.current)
    window.addEventListener('resize', reconcileWorkspaceWidth)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', reconcileWorkspaceWidth)
    }
  }, [workspaceRef, isWorkspaceActive])

  return { workspaceLayout, setWorkspaceLayout }
}
