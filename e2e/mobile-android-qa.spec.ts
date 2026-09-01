import { expect, test } from '@playwright/test'

test.describe('Android phone QA regressions', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('logic-game:workspace-tour:v1', 'seen'))
  })

  test('locks the browser page to the viewport and keeps language as a setup control', async ({ page }) => {
    await page.goto('./')

    const shell = page.locator('.page-shell')
    const main = page.locator('.main-content')
    await expect(shell).toBeVisible()
    await expect(main).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
      pageWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight,
      scrollY: window.scrollY,
      bodyOverflow: getComputedStyle(document.body).overflow,
    }))
    expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
    expect(dimensions.pageHeight).toBeLessThanOrEqual(dimensions.viewportHeight + 1)
    expect(dimensions.scrollY).toBe(0)
    expect(dimensions.bodyOverflow).toBe('hidden')

    const topbar = page.locator('.topbar')
    const navigation = page.getByRole('navigation', { name: 'Global navigation' })
    const language = page.getByRole('button', { name: 'Interface language' })
    const learnCard = page.getByRole('button', { name: 'Start or continue Learn Modal Logic' })
    const campaignsCard = page.getByRole('button', { name: /Campaigns: longer challenges/ })
    const labCard = page.getByRole('button', { name: /Lab: experiment with models and formulas/ })
    await expect(language).toBeVisible()
    await expect(learnCard).toBeVisible()
    await expect(campaignsCard).toBeVisible()
    await expect(labCard).toBeVisible()

    const [topbarBox, navigationBox, languageBox, learnBox, campaignsBox, labBox] = await Promise.all([
      topbar.boundingBox(), navigation.boundingBox(), language.boundingBox(), learnCard.boundingBox(), campaignsCard.boundingBox(), labCard.boundingBox(),
    ])
    expect(topbarBox).not.toBeNull()
    expect(navigationBox).not.toBeNull()
    expect(languageBox).not.toBeNull()
    expect(navigationBox!.y).toBeGreaterThan(topbarBox!.y + topbarBox!.height)
    expect(languageBox!.y + languageBox!.height).toBeLessThan(navigationBox!.y)
    for (const box of [learnBox, campaignsBox, labBox]) {
      expect(box).not.toBeNull()
      expect(box!.y).toBeGreaterThanOrEqual(0)
      expect(box!.y + box!.height).toBeLessThanOrEqual(navigationBox!.y)
    }

    await page.getByRole('button', { name: 'Learn', exact: true }).click()
    await expect(language).toBeHidden()

    await page.getByRole('button', { name: 'More', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Settings', exact: true }).click()
    await expect(language).toBeVisible()
  })

  test('opens all map tools inside the phone viewport and keeps the table caption visually hidden', async ({ page }) => {
    await page.goto('./')
    await page.getByRole('button', { name: 'Lab', exact: true }).click()
    await page.getByRole('button', { name: 'Open Model Sandbox' }).click()

    const more = page.getByRole('button', { name: 'More model tools' })
    await expect(more).toBeVisible()
    const moreBox = await more.boundingBox()
    expect(moreBox?.x).toBeGreaterThan(300)

    await more.click()
    const tools = page.getByRole('dialog', { name: 'Model tools' })
    await expect(tools).toBeVisible()
    await expect(tools.getByRole('button', { name: 'Zoom in' })).toBeVisible()
    await expect(tools.getByRole('button', { name: 'Zoom out' })).toBeVisible()
    await expect(tools.getByRole('button', { name: 'Tidy model' })).toBeVisible()

    const box = await tools.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    expect(box!.y + box!.height).toBeLessThanOrEqual(844)

    await tools.getByRole('button', { name: 'Close model tools' }).click()
    await page.getByRole('button', { name: 'Table', exact: true }).click()
    await expect(page.getByText('Keyboard-accessible model view. Changes are synchronized with the graph.')).not.toBeVisible()
  })

  test('uses Result as a compact toggle while Model remains implicit', async ({ page }) => {
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
    await dialog.getByRole('button', { name: 'Start task' }).click()

    await expect(page.getByRole('tab', { name: 'model' })).toHaveCount(0)
    const resultTab = page.getByRole('tab', { name: 'result' })
    const resultBox = await resultTab.boundingBox()
    expect(resultBox?.width).toBeLessThan(120)

    const checkTask = page.getByRole('button', { name: 'Check task', exact: true })
    await checkTask.click()

    await expect(resultTab).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('heading', { name: 'Verification' })).toBeVisible()

    await resultTab.click()
    await expect(resultTab).toHaveAttribute('aria-selected', 'false')
    await expect(page.getByRole('heading', { name: 'Verification' })).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Visual model' })).toBeVisible()
  })

  test('shows a successful controls lesson in one compact completion card', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('logic-game:campaign-progress:v2', JSON.stringify(['tutorial-v2-evaluation-world']))
      localStorage.setItem('logic-game:campaign-content-revision:v1', '2')
      localStorage.setItem('logic-game:learn-progress:v1', JSON.stringify({ version: 1, contentRevision: 3, welcomeViewed: true, completedLessonIds: [], completedChapterIds: [], highestStageByLesson: {}, attemptsByLesson: {}, successfulAttemptsByLesson: {}, predictionAnswers: {}, predictionCorrectness: {}, hintsUsed: {}, transferCompletedLessonIds: [], completedAt: {} }))
    })

    await page.goto('./')
    await page.getByRole('button', { name: 'Learn', exact: true }).click()
    const controls = page.getByRole('heading', { name: 'Learn the Controls', exact: true }).locator('xpath=ancestor::article')
    await controls.getByRole('button', { name: 'Continue', exact: true }).click()

    const mission = page.getByRole('region', { name: 'Current lesson' })
    await expect(mission).toContainText('Edit a world valuation')
    await expect(mission).toContainText('Add q to w0.')
    await expect(page.getByRole('button', { name: 'Interface language' })).toBeHidden()

    await page.getByLabel(/World w0, atoms/).click()
    const atoms = page.getByLabel('True atoms')
    await expect(atoms).toBeVisible()
    await atoms.fill('q')
    await page.getByRole('button', { name: 'Check task', exact: true }).click()

    await expect(mission).toHaveClass(/mission-header-completed/)
    await expect(mission).toContainText('Atoms written inside a world are true at that world.')
    await expect(mission.getByRole('button', { name: 'Next lesson', exact: true })).toBeVisible()
    expect((await mission.boundingBox())?.height).toBeLessThanOrEqual(310)

    await expect(page.getByRole('tab', { name: 'result' })).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Verification' })).toBeHidden()
    await expect(page.getByRole('heading', { name: 'Visual model' })).toBeVisible()
  })
})
