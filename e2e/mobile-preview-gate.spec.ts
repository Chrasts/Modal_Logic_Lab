import { expect, test } from '@playwright/test'

test.describe('mobile preview entry', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('does not mount the app until the visitor explicitly enters the preview', async ({ page }) => {
    await page.goto('./')

    await expect(page.getByRole('heading', { name: 'Mobile version in development' })).toBeVisible()
    await expect(page.locator('.page-shell')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Continue to mobile preview' })).toBeVisible()

    await page.getByRole('button', { name: 'Continue to mobile preview' }).click()

    await expect(page.locator('.page-shell')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mobile version in development' })).toHaveCount(0)

    await page.reload()
    await expect(page.locator('.page-shell')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Mobile version in development' })).toHaveCount(0)
  })
})
