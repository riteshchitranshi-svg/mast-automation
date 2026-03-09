import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import {
  Browser,
  BrowserContext,
  Page,
  chromium,
  firefox,
  webkit,
  LaunchOptions,
} from '@playwright/test';

export interface ICustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export class CustomWorld extends World implements ICustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(browserName: string = process.env.BROWSER || 'chromium') {
    const launchOptions: LaunchOptions = {
      headless: process.env.HEADLESS !== 'false',
    };

    if (browserName === 'firefox') {
      this.browser = await firefox.launch(launchOptions);
    } else if (browserName === 'webkit') {
      this.browser = await webkit.launch(launchOptions);
    } else {
      this.browser = await chromium.launch(launchOptions);
    }

    this.context = await this.browser.newContext({
      baseURL: process.env.BASE_URL || 'https://example.com',
      viewport: { width: 1280, height: 720 },
    });

    this.page = await this.context.newPage();
  }

  async teardown() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
