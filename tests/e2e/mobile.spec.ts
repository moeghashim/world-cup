import { expect, test, type Locator, type Page } from '@playwright/test'

const pages = ['/', '/pickem', '/brackets', '/hosts', '/profile', '/h/does-not-exist'] as const
const widths = [360, 390] as const
const navLabels = ['Home', "Pick'em", 'Public brackets', 'Prizes', 'Hosts', 'Sponsorship', 'Profile']

async function viewportWidth(page: Page) {
  return page.evaluate(() => window.innerWidth)
}

async function expectWithinViewport(page: Page, locator: Locator) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  const width = await viewportWidth(page)
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
}

async function expectNoHorizontalScroll(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1)
}

for (const width of widths) {
  test.describe(`mobile header at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } })

    for (const route of pages) {
      test(`${route} has no horizontal scroll and a usable menu`, async ({ page }) => {
        await page.goto(route)
        await expect(page.locator('.site-header')).toBeVisible()
        await expectNoHorizontalScroll(page)

        const burger = page.locator('.burger')
        await expect(burger).toBeVisible()
        await expectWithinViewport(page, burger)

        await burger.tap()

        const menu = page.locator('.navlinks.open')
        await expect(menu).toBeVisible()
        await expectWithinViewport(page, menu)

        for (const label of navLabels) {
          const link = menu.getByRole('link', { name: label, exact: true })
          await expect(link).toBeVisible()
          await expectWithinViewport(page, link)
        }

        const menuCta = menu.locator('.mobile-menu-cta')
        await expect(menuCta).toBeVisible()
        await expectWithinViewport(page, menuCta)

        const destination = route === '/' ? '/pickem' : '/'
        const navLink = menu.locator(`a[href="${destination}"]`).first()
        await navLink.tap()
        await page.waitForURL(`**${destination === '/' ? '/' : destination}`)
        await expect(menu).not.toBeVisible()
        await expectNoHorizontalScroll(page)
      })
    }
  })
}
