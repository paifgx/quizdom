/**
 * Authentication flow e2e tests using Playwright
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth';

test.describe('Authentication Flow', () => {
  test('user can login and logout', async ({ page }) => {
    const auth = new AuthHelper(page);

    // Start from home page
    await page.goto('/');

    // Verify we're not logged in initially
    expect(await auth.isLoggedIn()).toBe(false);

    // Login
    await auth.loginAsTestUser();

    // Verify successful login
    expect(await auth.isLoggedIn()).toBe(true);

    // Logout
    await auth.logout();

    // Verify successful logout
    expect(await auth.isLoggedIn()).toBe(false);
  });

  test('user sees error message for invalid credentials', async ({ page }) => {
    const auth = new AuthHelper(page);

    await page.goto('/login');

    // Try to login with invalid credentials
    await page.fill('[data-testid="username"]', 'invaliduser');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.getByRole('button', { name: /login|anmelden/i }).click();

    // Verify error message is shown
    await expect(page.getByText(/invalid|ungültig|fehler/i)).toBeVisible();

    // Verify we're still on login page
    expect(page.url()).toContain('/login');
  });

  test('protected routes redirect to login when not authenticated', async ({ page }) => {
    // Try to access a protected route without being logged in
    await page.goto('/profile');

    // Should be redirected to login
    await expect(page.url()).toContain('/login');

    // Should see login form
    await expect(page.getByRole('button', { name: /login|anmelden/i })).toBeVisible();
  });

  test('user can access protected routes after login', async ({ page }) => {
    const auth = new AuthHelper(page);

    // Login first
    await auth.loginAsTestUser();

    // Now access protected route
    await page.goto('/profile');

    // Should be able to access the profile page
    await expect(page.getByText(/profile|profil/i)).toBeVisible();
    expect(page.url()).toContain('/profile');
  });
}); 