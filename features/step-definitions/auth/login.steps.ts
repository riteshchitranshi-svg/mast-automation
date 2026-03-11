import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../support/world';
import { LoginPage } from '../../../src/ui/pages/auth/LoginPage';
import { loadEnvConfig } from '../../../src/utils/env-config';
import { getUserByKey } from '../../../src/utils/user-data';
import { messages, navItems } from '../../../src/constants/auth.constants';

Given('I am on the login page', async function (this: CustomWorld) {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.navigate();
});

Given('I am logged in as {string}', async function (this: CustomWorld, userKey: string) {
  this.loginPage = new LoginPage(this.page);
  const { email, password } = getUserByKey(userKey);
  await this.loginPage.navigate();
  await this.loginPage.login(email, password);
  await this.loginPage.assertLoggedIn();
});

When('I login as {string}', async function (this: CustomWorld, userKey: string) {
  const user = getUserByKey(userKey);
  this.set('currentUser', user);
  await this.loginPage.login(user.email, user.password);
});

When('I login with remember me as {string}', async function (this: CustomWorld, userKey: string) {
  const user = getUserByKey(userKey);
  this.set('currentUser', user);
  await this.loginPage.loginWithRememberMe(user.email, user.password);
});

When('I click the Account button', async function (this: CustomWorld) {
  await this.page.getByRole('button', { name: 'Account' }).click();
});

When('I click Log out', async function (this: CustomWorld) {
  await this.page.getByRole('button', { name: 'Log out' }).click();
  await this.page.waitForLoadState('networkidle');
});

When('I navigate directly to the cases page', async function (this: CustomWorld) {
  const { baseUrl } = loadEnvConfig();
  await this.page.goto(`${baseUrl}/cases`);
  await this.page.waitForLoadState('networkidle');
});

Then('I should be redirected to the home page', async function (this: CustomWorld) {
  await this.loginPage.assertLoggedIn();
});

Then('the navigation bar should be visible', async function (this: CustomWorld) {
  for (const item of navItems) {
    await expect(this.page.getByRole('link', { name: item })).toBeVisible();
  }
});

Then('I should see the invalid credentials error', async function (this: CustomWorld) {
  await this.loginPage.assertErrorVisible();
  expect(await this.loginPage.getErrorMessage()).toContain(messages.invalidCredentials);
});

Then('I should remain on the login page', async function (this: CustomWorld) {
  await this.loginPage.assertOnLoginPage();
});

Then('I should be redirected to the login page', async function (this: CustomWorld) {
  await this.loginPage.assertOnLoginPage();
});

Then('I should see the signed out success message', async function (this: CustomWorld) {
  await expect(this.page.getByText(messages.signedOut)).toBeVisible();
});
