const { test, expect } = require('@playwright/test')

test.describe('Cart & Checkout Flow', () => {
  test('empty cart shows prompt to shop', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText(/cart is empty|start shopping/i)).toBeVisible()
  })

  test('add product to cart and navigate to checkout', async ({ page }) => {
    // Add product from listing
    await page.goto('/product/1')
    await page.locator('#add-to-cart-btn').click()
    // Toast should appear
    await expect(page.locator('[class*="toast"], [class*="Toast"]').first()).toBeVisible({ timeout: 3000 })
    // Navigate to cart
    await page.locator('#nav-cart').click()
    await expect(page.url()).toContain('/cart')
    // Cart should have at least one item
    const cartItems = page.locator('[class*="item"], [class*="CartItem"]')
    await expect(cartItems.first()).toBeVisible()
  })

  test('wishlist toggle works', async ({ page }) => {
    await page.goto('/product/1')
    await page.locator('#wishlist-btn').click()
    await expect(page.locator('#nav-wishlist [class*="Badge"], [class*="navBadge"]')).toBeVisible({ timeout: 3000 })
  })

  test('checkout requires address before payment', async ({ page }) => {
    // Add to cart first
    await page.goto('/product/7')
    await page.locator('#add-to-cart-btn').click()
    await page.goto('/checkout')
    // Pay button should NOT be visible until address is filled
    await expect(page.locator('#pay-now-btn')).not.toBeVisible()
    // Fill address
    await page.locator('#addr-name').fill('John Doe')
    await page.locator('#addr-phone').fill('9876543210')
    await page.locator('#addr-street').fill('42 MG Road')
    await page.locator('#addr-city').fill('Bangalore')
    await page.locator('#addr-state').fill('Karnataka')
    await page.locator('#addr-pincode').fill('560001')
    await page.getByText('Continue to Payment').click()
    await expect(page.locator('#pay-now-btn')).toBeVisible({ timeout: 3000 })
  })

  test('full checkout flow completes successfully', async ({ page }) => {
    await page.goto('/product/7')
    await page.locator('#add-to-cart-btn').click()
    await page.goto('/checkout')
    await page.locator('#addr-name').fill('John Doe')
    await page.locator('#addr-phone').fill('9876543210')
    await page.locator('#addr-street').fill('42 MG Road')
    await page.locator('#addr-city').fill('Bangalore')
    await page.locator('#addr-state').fill('Karnataka')
    await page.locator('#addr-pincode').fill('560001')
    await page.getByText('Continue to Payment').click()
    await page.locator('#pay-now-btn').click()
    // Should redirect to order success
    await expect(page).toHaveURL(/order-success/, { timeout: 10000 })
  })
})
