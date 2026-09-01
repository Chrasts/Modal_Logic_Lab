export const mobileVerificationRequestedEvent = 'modal-logic:mobile-verification-requested'
export const mobileWorkspaceResetEvent = 'modal-logic:mobile-workspace-reset'

const phoneWorkspaceActive = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches

export function announceMobileVerification() {
  if (!phoneWorkspaceActive()) return
  window.dispatchEvent(new Event(mobileVerificationRequestedEvent))
}

export function resetMobileWorkspaceView() {
  if (!phoneWorkspaceActive()) return
  window.dispatchEvent(new Event(mobileWorkspaceResetEvent))
}
