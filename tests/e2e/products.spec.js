const { test, expect } = require('@playwright/test')

test.describe('Product Browsing & Search', () => {
  test('home page loads with hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/LUXE/i)
    await expect(page.locator('#main-navbar')).toBeVisible()
  })

  test('product listing shows products', async ({ page }) => {
    await page.goto('/products')
    // At least one product card should render
    const cards = page.locator('[data-testid="product-card"], .productCard, [class*="card"]')
    await expect(cards.first()).toBeVisible({ timeout: 5000 })
  })

  test('search input has debounce behaviour', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.locator('#search-input')
    await searchInput.fill('Head')
    // Results should appear after debounce delay
    await page.waitForTimeout(400)
    const dropdown = page.locator('[class*="searchDropdown"]')
    await expect(dropdown).toBeVisible()
  })

  test('product detail page loads correctly', async ({ page }) => {
    await page.goto('/product/7')
    await expect(page.locator('#add-to-cart-btn')).toBeVisible()
    await expect(page.locator('#wishlist-btn')).toBeVisible()
  })

  test('review submission requires login', async ({ page }) => {
    await page.goto('/product/7')
    // Click Reviews tab
    await page.getByText('Reviews').click()
    await expect(page.getByText('Sign in')).toBeVisible()
  })
})
