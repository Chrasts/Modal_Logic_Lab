import { expect, test } from '@playwright/test'

const desktopViewports = [
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]

for (const viewport of desktopViewports) {
  test(`Home remains fully reachable at ${viewport.width} x ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.addInitScript(() => localStorage.setItem('logic-game:workspace-tour:v1', 'seen'))
    await page.goto('./')
    const title = page.getByRole('heading', { name: 'Modal Logic Lab - Interactive Kripke Models' })
    await expect(title).toBeVisible()
    const box = await title.boundingBox()
    expect(box?.y).toBeGreaterThanOrEqual(0)
    await expect(page.getByRole('button', { name: 'Start or continue Learn Modal Logic' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Campaigns: longer challenges/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Lab: experiment with models and formulas/ })).toBeVisible()
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth, height: innerHeight, contentHeight: document.documentElement.scrollHeight }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
    if (dimensions.contentHeight > dimensions.height) {
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0)
    }
  })
}

test('Home Continue card resumes a live lesson without clipping its heading', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.addInitScript(() => localStorage.setItem('logic-game:workspace-tour:v1', 'seen'))
  await page.goto('./')
  await page.getByRole('button', { name: 'Start or continue Learn Modal Logic' }).click()
  const skip = page.getByRole('button', { name: 'Skip introduction' })
  if (await skip.isVisible().catch(() => false)) await skip.click()
  const startTask = page.getByRole('button', { name: 'Start task' })
  if (await startTask.isVisible().catch(() => false)) await startTask.click()
  const missionTitle = page.getByRole('region', { name: 'Current lesson' }).locator('strong').first()
  const title = await missionTitle.textContent()
  await page.getByRole('button', { name: 'Home', exact: true }).click()
  await expect(page.getByRole('complementary', { name: 'Continue current session' })).toContainText(title ?? '')
  const homeTitle = page.getByRole('heading', { name: 'Modal Logic Lab - Interactive Kripke Models' })
  expect((await homeTitle.boundingBox())?.y).toBeGreaterThanOrEqual(0)
  await page.getByRole('button', { name: 'Resume lesson' }).click()
  await expect(page.getByRole('region', { name: 'Current lesson' })).toContainText(title ?? '')
})

test.describe('phone-class public use', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('logic-game:workspace-tour:v1', 'seen'))
  })

  test('supports the public home and bottom navigation without horizontal overflow', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: 'Modal Logic Lab - Interactive Kripke Models' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Desktop required' })).toHaveCount(0)
    const navigation = page.getByRole('navigation', { name: 'Global navigation' })
    await expect(navigation).toBeVisible()
    await expect(navigation.getByRole('button')).toHaveCount(4)
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  })

  test('supports Create, Settings, and data management as mobile surfaces', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'More', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Create', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'New custom mission' })).toBeVisible()
    const createTextarea = page.getByRole('textbox', { name: 'Custom content JSON' })
    await expect(createTextarea).toBeVisible()
    expect((await createTextarea.boundingBox())?.width).toBeLessThanOrEqual(370)

    await page.getByRole('button', { name: 'More', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Settings', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible()
    const manageData = page.getByRole('button', { name: 'Manage local data' })
    await expect(manageData).toBeVisible()
    expect((await manageData.boundingBox())?.height).toBeGreaterThanOrEqual(44)
    await manageData.click()

    const dialog = page.getByRole('dialog', { name: 'Data management' })
    await expect(dialog).toBeVisible()
    const dialogBox = await dialog.boundingBox()
    expect(dialogBox?.width).toBeLessThanOrEqual(380)
    expect(dialogBox?.height).toBeLessThanOrEqual(834)
    const close = page.getByRole('button', { name: 'Close data manager' })
    expect((await close.boundingBox())?.height).toBeGreaterThanOrEqual(44)

    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  })

  test('keeps the model visible while formula and result open as workspace sheets', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'Lab', exact: true }).click()
    await page.getByRole('button', { name: 'Open Model Sandbox' }).click()

    const workspace = page.getByLabel('Kripke model editor')
    await expect(workspace).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Visual model' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Global navigation' })).toBeHidden()
    await expect(page.getByRole('tablist', { name: 'Workspace sections' })).toBeVisible()
    await expect(page.getByRole('button', { name: '+ World' })).toBeVisible()

    await page.getByRole('tab', { name: 'formula' }).click()
    await expect(page.getByLabel('Modal formula')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Visual model' })).toBeVisible()

    await page.getByRole('tab', { name: 'result' }).click()
    await expect(page.getByRole('heading', { name: 'Verification' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Visual model' })).toBeVisible()
  })

  test('provides a non-drag relation path from the selected-world inspector', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'Lab', exact: true }).click()
    await page.getByRole('button', { name: 'Open Model Sandbox' }).click()
    await page.getByLabel(/World w1, atoms/).click()
    const connect = page.getByRole('combobox', { name: 'Connect w1 to world' })
    await expect(connect).toBeVisible()
    await connect.selectOption('w0')
    await page.getByRole('button', { name: 'Table', exact: true }).click()
    const rows = page.getByRole('table').locator('tbody tr')
    await expect(rows.nth(1)).toContainText('w0')
    await expect(rows.nth(1)).toContainText('explicit')
  })

  test('keeps guided Learn instructions, hints, and actions usable on a phone', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('logic-game:campaign-progress:v2', JSON.stringify(['tutorial-v2-evaluation-world', 'tutorial-v2-valuation', 'tutorial-v2-draw-edge', 'tutorial-v2-correct-edge', 'tutorial-v2-add-world', 'tutorial-v2-build-model']))
      localStorage.setItem('logic-game:campaign-content-revision:v1', '2')
      localStorage.setItem('logic-game:learn-progress:v1', JSON.stringify({ version: 1, contentRevision: 3, welcomeViewed: true, completedLessonIds: [], completedChapterIds: [], highestStageByLesson: {}, attemptsByLesson: {}, successfulAttemptsByLesson: {}, predictionAnswers: {}, predictionCorrectness: {}, hintsUsed: {}, transferCompletedLessonIds: [], completedAt: {} }))
    })
    await page.goto('./')
    await page.getByRole('button', { name: 'Learn', exact: true }).click()
    const possibilityChapter = page.getByRole('heading', { name: 'Possibility', exact: true }).locator('xpath=ancestor::article')
    await possibilityChapter.getByRole('button', { name: 'Start', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: 'A possible alternative' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Start task' }).click()

    const mission = page.getByRole('region', { name: 'Current lesson' })
    await expect(mission).toBeVisible()
    await expect(page.getByLabel('Kripke model editor')).toBeVisible()
    await expect(page.getByRole('tablist', { name: 'Workspace sections' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Global navigation' })).toBeHidden()

    await mission.getByText('Details & hints').click()
    const revealHint = page.getByRole('button', { name: 'Reveal hint 1' })
    await expect(revealHint).toBeVisible()
    expect((await revealHint.boundingBox())?.height).toBeGreaterThanOrEqual(44)

    const action = mission.locator('.mission-header-actions button').first()
    await expect(action).toBeVisible()
    expect((await action.boundingBox())?.height).toBeGreaterThanOrEqual(44)

    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  })

  test('keeps the workspace operable on a short phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 740, height: 390 })
    await page.goto('./')
    await page.getByRole('button', { name: 'Lab', exact: true }).click()
    await page.getByRole('button', { name: 'Open Model Sandbox' }).click()

    const graph = page.locator('.graph-canvas')
    await expect(graph).toBeVisible()
    const graphBox = await graph.boundingBox()
    expect(graphBox?.height).toBeGreaterThanOrEqual(280)
    expect(graphBox?.height).toBeLessThanOrEqual(320)
    await expect(page.getByRole('tablist', { name: 'Workspace sections' })).toBeVisible()

    await page.getByRole('tab', { name: 'formula' }).click()
    await expect(page.getByLabel('Modal formula')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Visual model' })).toBeVisible()

    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
  })
})
