import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';
import { loadEnvConfig } from '../../../utils/env-config';

export class LoginPage extends BasePage {
  readonly emailInput;
  readonly passwordInput;
  readonly signInButton;
  readonly rememberMeCheckbox;
  readonly forgotPasswordLink;
  readonly errorMessage;

  constructor(page: Page) {
    super(page);
    this.emailInput       = page.getByPlaceholder('Enter email address...');
    this.passwordInput    = page.getByPlaceholder('Enter password...');
    this.signInButton     = page.getByRole('button', { name: 'Sign in' });
    this.rememberMeCheckbox = page.getByLabel('Remember me');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password' });
    this.errorMessage     = page.getByText('Invalid Email or password.');
  }

  async navigate() {
    const { baseUrl } = loadEnvConfig();
    await this.page.goto(`${baseUrl}/users/sign_in`);
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.waitForPageLoad();
  }

  async loginWithRememberMe(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.signInButton.click();
    await this.waitForPageLoad();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.waitForPageLoad();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? '';
  }

  async assertLoggedIn() {
    const { baseUrl } = loadEnvConfig();
    await expect(this.page).toHaveURL(baseUrl + '/');
    for (const item of ['Cases', 'Tasks', 'Dashboard']) {
      await expect(this.page.getByRole('link', { name: item })).toBeVisible();
    }
  }

  async assertOnLoginPage() {
    await this.assertUrl('/users/sign_in');
    await this.assertHeading("Welcome back, let's sign in!");
  }

  async assertErrorVisible() {
    await expect(this.errorMessage).toBeVisible();
  }
}
