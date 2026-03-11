import { Before, BeforeAll, After, AfterStep, Status, ITestCaseHookParameter } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import * as fs from 'fs';
import * as path from 'path';

Before(async function (this: CustomWorld) {
  await this.init();
});

AfterStep(async function (this: CustomWorld, { result }: ITestCaseHookParameter) {
  if (result?.status === Status.FAILED) {
    const screenshot = await this.page.screenshot({ type: 'png' });
    this.attach(screenshot, 'image/png');
  }
});

After(async function (this: CustomWorld, { result }: ITestCaseHookParameter) {
  if (result?.status === Status.FAILED) {
    // Capture page HTML on failure for debugging
    const html = await this.page.content();
    this.attach(html, 'text/html');<
  }
  await this.teardown();
});

// Ensure reports directory exists before any scenario runs
BeforeAll(async function () {
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
});
