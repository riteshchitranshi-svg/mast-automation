import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import { loadEnvConfig } from '../../../utils/env-config';

export class ForgotPasswordPage extends BasePage {
  readonly emailInput;
  readonly submitButton;
  readonly backToLoginLink;
  readonly successMessage;

  constructor(page: Page) {
    super(page);
    this.emailInput      = page.getByPlaceholder('Enter email address...');
    this.submitButton    = page.getByRole('button', { name: 'Send me reset password instructions' });
    this.backToLoginLink = page.getByRole('link', { name: 'Back to login' });
    this.successMessage  = page.getByText('If your email address exists in our database');
  }

  async navigate() {
    const { baseUrl } = loadEnvConfig();
    await this.page.goto(`${baseUrl}/users/password/new`);
    await this.waitForPageLoad();
  }

  async submitEmail(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async clickBackToLogin() {
    await this.backToLoginLink.click();
    await this.waitForPageLoad();
  }

  async assertOnForgotPasswordPage() {
    await this.assertUrl('/users/password/new');
    await this.assertHeading('Forgot your password?');
  }

  async assertSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
  }
}
