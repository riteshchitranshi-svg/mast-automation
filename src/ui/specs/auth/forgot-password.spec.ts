import { test, expect } from '../../../fixtures';
import { getUserByKey } from '../../../utils/user-data';
import { messages } from '../../../constants/auth.constants';

test.describe('Forgot Password', () => {
  // TC_LOGIN_008
  test('clicking Forgot Password link navigates to forgot password page', async ({ loginPage, forgotPasswordPage }) => {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    await forgotPasswordPage.assertOnForgotPasswordPage();
    await expect(forgotPasswordPage.submitButton).toBeVisible();
    await expect(forgotPasswordPage.backToLoginLink).toBeVisible();
  });

  // TC_LOGIN_009
  test('submitting registered email shows password reset success message', async ({ forgotPasswordPage, page }) => {
    const { email } = getUserByKey('valid_user');
    await forgotPasswordPage.navigate();
    await forgotPasswordPage.submitEmail(email);
    await expect(page).toHaveURL(/\/users\/sign_in/);
    await forgotPasswordPage.assertSuccessMessage();
  });

  // TC_LOGIN_010
  test('submitting unregistered email shows generic success message', async ({ forgotPasswordPage, page }) => {
    const { email } = getUserByKey('invalid_user');
    await forgotPasswordPage.navigate();
    await forgotPasswordPage.submitEmail(email);
    await expect(page).toHaveURL(/\/users\/sign_in/);
    await forgotPasswordPage.assertSuccessMessage();
  });

  // TC_LOGIN_011
  test('Back to login link redirects to login page', async ({ forgotPasswordPage, loginPage }) => {
    await forgotPasswordPage.navigate();
    await forgotPasswordPage.clickBackToLogin();
    await loginPage.assertOnLoginPage();
  });
});
