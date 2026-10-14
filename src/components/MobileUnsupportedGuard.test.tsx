// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MobileUnsupportedGuard, phoneClassMediaQuery } from './MobileUnsupportedGuard'

beforeEach(() => sessionStorage.clear())
afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear() })
const matchMedia = (matches: boolean) => vi.fn(() => ({ matches, media: phoneClassMediaQuery, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() }))

describe('MobileUnsupportedGuard', () => {
  it('shows a phone warning instead of mounting the application until preview is requested', () => {
    vi.stubGlobal('matchMedia', matchMedia(true))
    render(<MobileUnsupportedGuard><p>Application</p></MobileUnsupportedGuard>)
    expect(screen.getByRole('heading', { name: 'Mobile version in development' })).toBeVisible()
    expect(screen.getByText(/desktop or laptop computer/)).toBeVisible()
    expect(screen.queryByText('Application')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continue to mobile preview' }))
    expect(screen.getByText('Application')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Mobile version in development' })).not.toBeInTheDocument()
    expect(sessionStorage.getItem('logic-game:mobile-preview-access')).toBe('accepted')
  })

  it('remembers preview access within a browser tab', () => {
    vi.stubGlobal('matchMedia', matchMedia(true))
    sessionStorage.setItem('logic-game:mobile-preview-access', 'accepted')
    render(<MobileUnsupportedGuard><p>Application</p></MobileUnsupportedGuard>)
    expect(screen.getByText('Application')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Mobile version in development' })).not.toBeInTheDocument()
  })

  it('renders the application immediately when the phone-class condition does not match', () => {
    vi.stubGlobal('matchMedia', matchMedia(false))
    render(<MobileUnsupportedGuard><p>Application</p></MobileUnsupportedGuard>)
    expect(screen.getByText('Application')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Mobile version in development' })).not.toBeInTheDocument()
  })
})
