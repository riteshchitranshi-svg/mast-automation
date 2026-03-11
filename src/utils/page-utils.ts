import { Page } from '@playwright/test';

export async function waitForResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(urlPattern);
}
