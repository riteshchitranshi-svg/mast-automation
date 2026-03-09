import { test as base } from '@playwright/test';

// Extend base test with custom fixtures here.
// Example:
// import { LoginPage } from '../pages/LoginPage';
// type MyFixtures = { loginPage: LoginPage };
// export const test = base.extend<MyFixtures>({
//   loginPage: async ({ page }, use) => {
//     await use(new LoginPage(page));
//   },
// });

export const test = base;
export { expect } from '@playwright/test';
