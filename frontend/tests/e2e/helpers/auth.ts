/**
 * Authentication helpers for Playwright e2e tests
 */

import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with username and password
   */
  async login(username: string, password: string) {
    await this.page.goto('/login');

    // Fill login form
    await this.page.fill('[data-testid="username"]', username);
    await this.page.fill('[data-testid="password"]', password);

    // Submit form
    await this.page.getByRole('button', { name: /login|anmelden/i }).click();

    // Wait for successful login (adjust based on your success indicator)
    await expect(this.page.getByText(/profile|profil/i)).toBeVisible();
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.getByRole('button', { name: /logout|abmelden/i }).click();

    // Verify logout was successful
    await expect(this.page.getByText(/login|anmelden/i)).toBeVisible();
  }

  /**
   * Check if user is currently logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.page.getByText(/profile|profil/i).isVisible();
  }

  /**
   * Login as test user (convenience method)
   */
  async loginAsTestUser() {
    await this.login('testuser', 'testpassword');
  }

  /**
   * Login as admin user (convenience method)
   */
  async loginAsAdmin() {
    await this.login('admin', 'adminpassword');
  }
}
