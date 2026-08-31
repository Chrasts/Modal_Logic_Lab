export const mobileVerificationRequestedEvent = 'modal-logic:mobile-verification-requested'

export function announceMobileVerification() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(mobileVerificationRequestedEvent))
}
