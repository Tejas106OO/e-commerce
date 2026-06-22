const { test, expect } = require('@playwright/test')

test.describe('Authentication Flow', () => {
  test('should display login form for unauthenticated users', async ({ page }) => {
    await page.goto('/account')
    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(page.locator('#auth-email')).toBeVisible()
    await expect(page.locator('#auth-password')).toBeVisible()
  })

  test('should login with any email and password', async ({ page }) => {
    await page.goto('/account')
    await page.locator('#auth-email').fill('test@example.com')
    await page.locator('#auth-password').fill('password123')
    await page.locator('#auth-submit').click()
    await expect(page.getByText('Profile')).toBeVisible({ timeout: 5000 })
  })

  test('should switch to register tab', async ({ page }) => {
    await page.goto('/account')
    await page.getByText('Register').click()
    await expect(page.locator('#auth-name')).toBeVisible()
    await expect(page.getByText('Create Account')).toBeVisible()
  })

  test('admin user gets admin role', async ({ page }) => {
    await page.goto('/account')
    await page.locator('#auth-email').fill('admin@luxe.com')
    await page.locator('#auth-password').fill('admin123')
    await page.locator('#auth-submit').click()
    // Admin link should appear in navbar
    await expect(page.locator('#nav-admin')).toBeVisible({ timeout: 5000 })
  })
})
