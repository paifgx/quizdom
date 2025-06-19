/**
 * End-to-end test for quiz completion flow using Playwright
 * Tests complete user journeys in a real browser environment
 */

import { test, expect } from '@playwright/test';

test.describe('Quiz Completion E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test environment
    // Navigate to the application
    await page.goto('/');
  });

  test('user can navigate to quiz selection', async ({ page }) => {
    // Test basic navigation and page loading
    await expect(page).toHaveTitle(/Quizdom/i);

    // Check if main navigation is visible
    await expect(page.getByText('QUIZDOM')).toBeVisible();

    // Navigate to quizzes page (adjust based on your actual routes)
    await page.getByRole('link', { name: /quizzes|quiz/i }).click();

    // Verify we're on the right page
    await expect(page.url()).toContain('/quiz');
  });

  test('user can complete authentication flow', async ({ page }) => {
    // Navigate to login page
    await page.getByRole('link', { name: /login|anmelden/i }).click();

    // Fill in login form (adjust selectors based on your actual form)
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpassword');

    // Submit form
    await page.getByRole('button', { name: /login|anmelden/i }).click();

    // Verify successful login (check for user-specific content)
    await expect(page.getByText(/profile|profil/i)).toBeVisible();
  });

  test('user can start a quiz journey', async ({ page }) => {
    // This test assumes user is logged in or can access quizzes

    // Navigate to quiz selection
    await page.goto('/quizzes');

    // Wait for quiz list to load
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Select a quiz (adjust based on your actual quiz cards/buttons)
    await page
      .getByRole('button', { name: /start|begin/i })
      .first()
      .click();

    // Verify quiz has started
    await expect(page.getByText(/question|frage/i)).toBeVisible();

    // Answer a question (example - adjust based on your quiz interface)
    await page
      .getByRole('button', { name: /answer|antwort/i })
      .first()
      .click();

    // Continue to next question or finish
    await page
      .getByRole('button', { name: /next|weiter|finish|beenden/i })
      .click();

    // Verify progress or completion
    await expect(page).toHaveURL(/.*quiz.*/);
  });

  test('user can view quiz results', async ({ page }) => {
    // Navigate to completed quiz or results page
    await page.goto('/progress'); // Adjust based on your routes

    // Verify results are displayed
    await expect(page.getByText(/score|ergebnis|punkte/i)).toBeVisible();

    // Check for score display
    await expect(page.locator('[data-testid="score"]')).toBeVisible();

    // Verify feedback message
    await expect(page.getByText(/excellent|good|great|super/i)).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check mobile navigation
    const mobileMenu = page.getByRole('button', { name: /menu/i });
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }

    // Verify content is responsive
    await expect(page.getByText('QUIZDOM')).toBeVisible();
  });
});
