import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { ForgotPasswordPage } from '../../../src/ui/pages/auth/ForgotPasswordPage';
import { LoginPage } from '../../../src/ui/pages/auth/LoginPage';
import { getUserByKey } from '../../../src/utils/user-data';

Given('I am on the forgot password page', async function (this: CustomWorld) {
  this.forgotPasswordPage = new ForgotPasswordPage(this.page);
  await this.forgotPasswordPage.navigate();
});

When('I click the Forgot password link', async function (this: CustomWorld) {
  this.forgotPasswordPage = new ForgotPasswordPage(this.page);
  await this.loginPage.clickForgotPassword();
});

When('I submit a password reset for {string}', async function (this: CustomWorld, userKey: string) {
  const { email } = getUserByKey(userKey);
  this.set('resetEmail', email);
  await this.forgotPasswordPage.submitEmail(email);
});

When('I click the Back to login link', async function (this: CustomWorld) {
  await this.forgotPasswordPage.clickBackToLogin();
});

Then('I should be on the forgot password page', async function (this: CustomWorld) {
  await this.forgotPasswordPage.assertOnForgotPasswordPage();
});

Then('the reset form elements should be visible', async function (this: CustomWorld) {
  await expect(this.forgotPasswordPage.emailInput).toBeVisible();
  await expect(this.forgotPasswordPage.submitButton).toBeVisible();
  await expect(this.forgotPasswordPage.backToLoginLink).toBeVisible();
});

Then('I should see the password reset confirmation message', async function (this: CustomWorld) {
  await this.forgotPasswordPage.assertSuccessMessage();
});

Then('I should be on the login page', async function (this: CustomWorld) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.page);
  }
  await this.loginPage.assertOnLoginPage();
});
