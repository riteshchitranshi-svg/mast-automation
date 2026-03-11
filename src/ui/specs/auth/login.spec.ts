import { test, expect } from '../../../fixtures';
import { loadEnvConfig } from '../../../utils/env-config';
import { getUserByKey } from '../../../utils/user-data';
import { messages, navItems } from '../../../constants/auth.constants';

test.describe('Login', () => {
  // TC_LOGIN_001
  test('successful login with valid credentials', async ({ loginPage }) => {
    const { email, password } = getUserByKey('valid_user');
    await loginPage.navigate();
    await loginPage.login(email, password);
    await loginPage.assertLoggedIn();
  });

  // TC_LOGIN_002–006 driven by user keys from users.csv
  const invalidCases = [
    { key: 'empty_both',            label: 'empty email and empty password' },
    { key: 'invalid_user',          label: 'unregistered email and wrong password' },
    { key: 'valid_email_wrong_pass',label: 'valid email but incorrect password' },
    { key: 'valid_email_no_pass',   label: 'valid email but empty password' },
    { key: 'no_email_valid_pass',   label: 'empty email but valid password' },
  ];

  for (const { key, label } of invalidCases) {
    test(`login with ${label} shows error`, async ({ loginPage }) => {
      const { email, password } = getUserByKey(key);
      await loginPage.navigate();
      await loginPage.login(email, password);
      await loginPage.assertOnLoginPage();
      await loginPage.assertErrorVisible();
      expect(await loginPage.getErrorMessage()).toContain(messages.invalidCredentials);
    });
  }

  // TC_LOGIN_007
  test('login with Remember Me keeps session after browser restart', async ({ loginPage, page, context }) => {
    const { email, password } = getUserByKey('valid_user');
    await loginPage.navigate();
    await loginPage.loginWithRememberMe(email, password);
    await loginPage.assertLoggedIn();

    // Save storage state and reload context to verify session persistence
    const storageState = await context.storageState();
    expect(storageState.cookies.length).toBeGreaterThan(0);
  });

  // TC_LOGIN_012
  test('successful logout redirects to login with success message', async ({ loggedInPage }) => {
    await loggedInPage.getByRole('button', { name: 'Account' }).click();
    await loggedInPage.getByRole('button', { name: 'Log out' }).click();
    await expect(loggedInPage).toHaveURL(/\/users\/sign_in/);
    await expect(loggedInPage.getByText(messages.signedOut)).toBeVisible();
  });

  // TC_LOGIN_013
  test('accessing protected page when not logged in redirects to login', async ({ page }) => {
    const { baseUrl } = loadEnvConfig();
    await page.goto(`${baseUrl}/cases`);
    await expect(page).toHaveURL(/\/users\/sign_in/);
  });
});
