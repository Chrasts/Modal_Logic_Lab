import { expect, test } from '@playwright/test'

test.describe('mobile WebKit smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('logic-game:workspace-tour:v1', 'seen'))
  })

  test('keeps the public shell and utility menu usable on an iPhone-class WebKit viewport', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'Modal Logic Lab - Interactive Kripke Models' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Global navigation' })).toBeVisible()

    await page.getByRole('button', { name: 'More', exact: true }).click()
    await expect(page.getByRole('menu')).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  })

  test('keeps Sandbox Formula and verification controls usable in WebKit', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'Lab', exact: true }).click()
    await page.getByRole('button', { name: 'Open Model Sandbox' }).click()

    await expect(page.getByLabel('Kripke model editor')).toBeVisible()
    const toolbar = page.locator('.workspace-toolbar-mobile')
    await toolbar.getByRole('button', { name: 'More model tools' }).click()
    const tools = page.getByRole('dialog', { name: 'Model tools' })
    await expect(tools).toBeVisible()
    await tools.getByRole('button', { name: /Formula · Evaluate/ }).click()
    await page.getByRole('tab', { name: 'formula' }).click()

    const formula = page.getByLabel('Modal formula')
    await expect(formula).toBeVisible()
    await formula.focus()
    await expect(formula).toBeFocused()
    expect(Number.parseFloat(await formula.evaluate((element) => getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)

    const verify = page.locator('.mobile-formula-verify-fab')
    await expect(verify).toBeVisible()
    await verify.click()
    await expect(page.getByRole('tab', { name: 'result' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('heading', { name: 'Verification' })).toBeVisible()
  })
})
