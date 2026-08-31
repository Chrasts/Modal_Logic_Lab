// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MobileUnsupportedGuard, phoneClassMediaQuery } from './MobileUnsupportedGuard'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const matchMedia = (matches: boolean) => vi.fn(() => ({ matches, media: phoneClassMediaQuery, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn() }))

describe('MobileUnsupportedGuard', () => {
  it('renders the application for a phone-class media match', () => {
    vi.stubGlobal('matchMedia', matchMedia(true))
    render(<MobileUnsupportedGuard><p>Application</p></MobileUnsupportedGuard>)
    expect(screen.getByText('Application')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Desktop required' })).not.toBeInTheDocument()
  })

  it('renders the application when the phone-class condition does not match', () => {
    vi.stubGlobal('matchMedia', matchMedia(false))
    render(<MobileUnsupportedGuard><p>Application</p></MobileUnsupportedGuard>)
    expect(screen.getByText('Application')).toBeVisible()
  })
})
