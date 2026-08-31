import { expect, test } from '@playwright/test'

test.describe('expanded phone workflows', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('logic-game:workspace-tour:v1', 'seen'))
  })

  test('enters the mission authoring studio without leaving the phone layout', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'More', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create', exact: true }).click()
    await page.getByRole('button', { name: 'New custom mission' }).click()

    await expect(page.getByRole('heading', { name: 'My custom mission', exact: true })).toBeVisible()
    const title = page.getByRole('textbox', { name: 'Custom mission title' })
    await expect(title).toBeVisible()
    const next = page.getByRole('button', { name: 'Next', exact: true })
    await expect(next).toBeVisible()
    expect((await next.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    expect((await title.boundingBox())?.width).toBeLessThanOrEqual(360)

    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  })

  test('routes a mobile verification directly to the Result sheet', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'Lab', exact: true }).click()
    await page.getByRole('button', { name: 'Open Model Sandbox' }).click()

    const toolbar = page.locator('.workspace-toolbar-mobile')
    await toolbar.getByRole('button', { name: 'More model tools' }).click()
    await toolbar.getByRole('button', { name: /Formula · Evaluate/ }).click()
    await expect(toolbar.getByRole('button', { name: 'Verify', exact: true })).toBeVisible()

    await page.getByRole('tab', { name: 'formula' }).click()
    await expect(page.getByLabel('Modal formula')).toBeVisible()
    await expect(toolbar.getByRole('button', { name: 'Verify', exact: true })).toBeHidden()
    const formulaVerify = page.locator('.mobile-formula-verify-fab')
    await expect(formulaVerify).toBeVisible()
    expect((await formulaVerify.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await formulaVerify.click()

    await expect(page.getByRole('tab', { name: 'result' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('heading', { name: 'Verification' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Visual model' })).toBeVisible()
  })

  test('browses Campaigns on a 360px phone without page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('./')
    await page.getByRole('button', { name: 'Campaigns', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Campaigns', exact: true })).toBeVisible()

    await page.getByRole('tab', { name: 'Practice Library' }).click()
    await expect(page.getByRole('heading', { name: 'Practice Library', exact: true })).toBeVisible()
    const collections = page.getByRole('complementary', { name: 'Practice collection list' })
    await expect(collections).toBeVisible()
    await expect(collections.getByRole('button').first()).toBeVisible()

    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  })
})
