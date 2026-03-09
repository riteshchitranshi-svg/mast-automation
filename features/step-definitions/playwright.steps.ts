import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

Given('I navigate to the Playwright homepage', async function (this: CustomWorld) {
  await this.page.goto('https://playwright.dev/');
});

Then('the page title should contain {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page).toHaveTitle(new RegExp(text));
});

When('I click the {string} link', async function (this: CustomWorld, linkText: string) {
  await this.page.getByRole('link', { name: linkText }).click();
});

Then('I should see the heading {string}', async function (this: CustomWorld, heading: string) {
  await expect(this.page.getByRole('heading', { name: heading })).toBeVisible();
});
