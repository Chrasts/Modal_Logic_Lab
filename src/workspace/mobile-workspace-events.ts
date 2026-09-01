export const mobileVerificationRequestedEvent = 'modal-logic:mobile-verification-requested'
export const mobileWorkspaceResetEvent = 'modal-logic:mobile-workspace-reset'

export function announceMobileVerification() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(mobileVerificationRequestedEvent))
}

export function resetMobileWorkspaceView() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(mobileWorkspaceResetEvent))
}
