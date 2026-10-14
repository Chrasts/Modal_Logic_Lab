import { useEffect, useState, type ReactNode } from 'react'

export const phoneClassMediaQuery = '(max-width: 760px) and (pointer: coarse)'

const previewAccessKey = 'logic-game:mobile-preview-access'

function phoneViewportMatches(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(phoneClassMediaQuery).matches
}

function previewAccepted(): boolean {
  try {
    return sessionStorage.getItem(previewAccessKey) === 'accepted'
  } catch {
    return false
  }
}

/**
 * The phone layout remains available for testing, but the desktop experience
 * is recommended while the mobile UI is being refined.
 */
export function MobileUnsupportedGuard({ children }: { readonly children: ReactNode }) {
  const [isPhoneViewport, setIsPhoneViewport] = useState(phoneViewportMatches)
  const [hasPreviewAccess, setHasPreviewAccess] = useState(previewAccepted)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(phoneClassMediaQuery)
    const onChange = (event: MediaQueryListEvent) => setIsPhoneViewport(event.matches)
    setIsPhoneViewport(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  if (!isPhoneViewport || hasPreviewAccess) return children

  const enterPreview = () => {
    try {
      sessionStorage.setItem(previewAccessKey, 'accepted')
    } catch {
      // Testing remains available when browser storage is restricted.
    }
    setHasPreviewAccess(true)
  }

  return <main className="mobile-preview-gate" aria-labelledby="mobile-preview-title">
    <div className="mobile-preview-content">
      <span className="mobile-preview-eyebrow">Modal Logic Lab</span>
      <h1 id="mobile-preview-title">Mobile version in development</h1>
      <p>The mobile experience is still under development and some features may be incomplete or difficult to use.</p>
      <p>For the best experience, please open Modal Logic Lab on a desktop or laptop computer.</p>
      <button type="button" className="mobile-preview-enter" onClick={enterPreview}>Continue to mobile preview</button>
      <small>For testing and development use.</small>
    </div>
  </main>
}
