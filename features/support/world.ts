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
import { LoginPage } from '../../src/ui/pages/auth/LoginPage';
import { ForgotPasswordPage } from '../../src/ui/pages/auth/ForgotPasswordPage';
import { loadEnvConfig } from '../../src/utils/env-config';

export interface ICustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

export class CustomWorld extends World implements ICustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Page object instances — initialised in Given steps, reused across When/Then
  loginPage!: LoginPage;
  forgotPasswordPage!: ForgotPasswordPage;

  // Generic key-value store for all scenario-scoped data.
  // Use set()/get() to pass any value between steps without declaring new properties.
  private _store: Record<string, unknown> = {};

  set<T>(key: string, value: T): void {
    this._store[key] = value;
  }

  get<T>(key: string): T {
    if (!(key in this._store)) {
      throw new Error(`No value stored for key "${key}" in scenario store`);
    }
    return this._store[key] as T;
  }

  has(key: string): boolean {
    return key in this._store;
  }

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

    const { baseUrl } = loadEnvConfig();
    this.context = await this.browser.newContext({
      baseURL: baseUrl,
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
