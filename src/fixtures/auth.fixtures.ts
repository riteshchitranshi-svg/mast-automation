import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../ui/pages/auth/LoginPage';
import { ForgotPasswordPage } from '../ui/pages/auth/ForgotPasswordPage';
import { loadEnvConfig } from '../utils/env-config';
import { getUserByKey } from '../utils/user-data';

type AuthFixtures = {
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  loggedInPage: Page;
  authToken: string;
};

export const authFixtures = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  forgotPasswordPage: async ({ page }, use) => {
    await use(new ForgotPasswordPage(page));
  },

  // Provides a page that is already authenticated via storageState.
  // Performs login once via API/UI and saves session; subsequent tests reuse the snapshot.
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    const { email, password } = getUserByKey('valid_user');
    await loginPage.navigate();
    await loginPage.login(email, password);
    await loginPage.assertLoggedIn();
    await use(page);
  },

  authToken: async ({ request }, use) => {
    const { apiBaseUrl } = loadEnvConfig();
    const { email, password } = getUserByKey('valid_user');
    const response = await request.post(`${apiBaseUrl}/users/sign_in`, {
      data: { user: { email, password } },
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json();
    await use(body.token ?? '');
  },
});
