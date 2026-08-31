import { expect, test } from '@playwright/test'

test.describe('guided mobile layout diagnostics', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

  test('keeps the guided workspace inside the document viewport', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('logic-game:workspace-tour:v1', 'seen')
      localStorage.setItem('logic-game:campaign-progress:v2', JSON.stringify(['tutorial-v2-evaluation-world', 'tutorial-v2-valuation', 'tutorial-v2-draw-edge', 'tutorial-v2-correct-edge', 'tutorial-v2-add-world', 'tutorial-v2-build-model']))
      localStorage.setItem('logic-game:campaign-content-revision:v1', '2')
      localStorage.setItem('logic-game:learn-progress:v1', JSON.stringify({ version: 1, contentRevision: 3, welcomeViewed: true, completedLessonIds: [], completedChapterIds: [], highestStageByLesson: {}, attemptsByLesson: {}, successfulAttemptsByLesson: {}, predictionAnswers: {}, predictionCorrectness: {}, hintsUsed: {}, transferCompletedLessonIds: [], completedAt: {} }))
    })

    await page.goto('./')
    await page.getByRole('button', { name: 'Learn', exact: true }).click()
    const possibilityChapter = page.getByRole('heading', { name: 'Possibility', exact: true }).locator('xpath=ancestor::article')
    await possibilityChapter.getByRole('button', { name: 'Start', exact: true }).click()
    await page.getByRole('dialog', { name: 'A possible alternative' }).getByRole('button', { name: 'Start task' }).click()
    await page.getByRole('region', { name: 'Current lesson' }).getByText('Details & hints').click()
    await expect(page.getByRole('button', { name: 'Reveal hint 1' })).toBeVisible()

    const diagnostic = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth
      const content = document.documentElement.scrollWidth
      const elements = [...document.querySelectorAll<HTMLElement>('body *')]
        .map((element) => {
          const rect = element.getBoundingClientRect()
          const className = typeof element.className === 'string' ? element.className.trim().replace(/\s+/g, '.') : ''
          return {
            selector: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${className ? `.${className}` : ''}`,
            left: Math.round(rect.left * 10) / 10,
            right: Math.round(rect.right * 10) / 10,
            width: Math.round(rect.width * 10) / 10,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
            overflowX: getComputedStyle(element).overflowX,
            position: getComputedStyle(element).position,
          }
        })
        .filter((entry) => entry.right > viewport + 0.5 || entry.left < -0.5 || entry.scrollWidth > entry.clientWidth + 1)
        .sort((a, b) => Math.max(b.right - viewport, b.scrollWidth - b.clientWidth) - Math.max(a.right - viewport, a.scrollWidth - a.clientWidth))
        .slice(0, 25)
      return { viewport, content, elements }
    })

    expect(diagnostic.content, JSON.stringify(diagnostic, null, 2)).toBeLessThanOrEqual(diagnostic.viewport)
  })
})
