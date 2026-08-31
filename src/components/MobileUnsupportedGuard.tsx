import type { ReactNode } from 'react'

export const phoneClassMediaQuery = '(max-width: 760px) and (pointer: coarse)'

/**
 * Mobile is now a supported presentation mode. Keep this compatibility wrapper
 * so App does not need a second rendering path and older imports remain stable.
 */
export function MobileUnsupportedGuard({ children }: { readonly children: ReactNode }) {
  return children
}
