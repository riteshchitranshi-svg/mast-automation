# Project Structure — UI & API Test Architecture

This document defines the recommended modular project structure for the `mast-automation` test suite, covering both **UI (Playwright + Cucumber BDD)** and **API** tests, built around the **Page Object Model (POM)**.

The initial scope maps to all login-related test cases: `TC_LOGIN_001` through `TC_LOGIN_013`.

---

## Guiding Principles

1. **POM everywhere** — No selectors or page interactions in spec/step files.
2. **Single Responsibility** — Each page object owns one page. Each API client owns one domain.
3. **DRY test data** — All credentials and URLs live in one place; never hardcoded in tests.
4. **Layer separation** — UI tests, API tests, BDD step definitions, and support code never bleed into each other.
5. **Reusable fixtures** — Playwright fixtures provide pre-authenticated contexts so tests don't repeat login steps.

---

## Proposed Directory Tree

```
mast-automation/
│
├── testData/                          # All environment-specific data files
│   ├── sandbox/                       # Values for sandbox environment
│   │   ├── env.properties.ts          # Base URLs, timeouts, feature flags
│   │   ├── auth.properties.ts         # Non-credential data: messages, nav items
│   │   └── users.csv                  # Credential matrix keyed by user type
│   │
│   └── stage/                         # Same files, stage-specific values
│       ├── env.properties.ts
│       ├── auth.properties.ts
│       └── users.csv
│
├── src/
│   │
│   ├── ui/
│   │   ├── pages/
│   │   │   ├── BasePage.ts                  # Shared page utilities (goto, wait, etc.)
│   │   │   └── auth/
│   │   │       ├── LoginPage.ts             # Selectors + actions for /users/sign_in
│   │   │       └── ForgotPasswordPage.ts    # Selectors + actions for /users/password/new
│   │   │
│   │   └── specs/
│   │       └── auth/
│   │           ├── login.spec.ts            # TC_LOGIN_001–006, 007, 012, 013
│   │           └── forgot-password.spec.ts  # TC_LOGIN_008–011
│   │
│   ├── api/
│   │   ├── clients/
│   │   │   ├── BaseApiClient.ts             # Axios/fetch wrapper, base URL, auth header
│   │   │   └── AuthApiClient.ts             # POST /users/sign_in, DELETE /users/sign_out
│   │   │
│   │   ├── specs/
│   │   │   └── auth/
│   │   │       └── login.api.spec.ts        # API-layer login/logout/session tests
│   │   │
│   │   └── types/
│   │       └── auth.types.ts                # Request/response type interfaces
│   │
│   ├── fixtures/
│   │   ├── index.ts                         # Extends Playwright base with all custom fixtures
│   │   └── auth.fixtures.ts                 # Logged-in page fixture, auth token fixture
│   │
│   └── utils/
│       └── helpers.ts                       # Generic utilities (random strings, date helpers)
│
├── features/                      # Cucumber BDD layer (mirrors test cases 1:1)
│   ├── auth/
│   │   ├── login.feature                    # Scenarios for TC_LOGIN_001–007, 012, 013
│   │   └── forgot-password.feature          # Scenarios for TC_LOGIN_008–011
│   │
│   ├── step-definitions/
│   │   └── auth/
│   │       ├── login.steps.ts               # Steps reuse LoginPage POM
│   │       └── forgot-password.steps.ts     # Steps reuse ForgotPasswordPage POM
│   │
│   └── support/
│       ├── world.ts                         # CustomWorld: browser/page/apiContext + shared scenario state
│       └── hooks.ts                         # Before/After with screenshot on failure
│
├── docs/
│   ├── login.md                   # Manual test cases (source of truth)
│   └── project-structure.md       # This file
│
├── playwright.config.ts
├── cucumber.js
├── tsconfig.json
└── package.json
```

---

## Layer Breakdown

### 1. Environment Properties Files — `testData/<env>/`

Each environment has its own folder containing the same set of files with environment-specific values. The active environment is selected at runtime via the `TEST_ENV` environment variable (defaults to `sandbox`).

A thin loader resolves the correct folder at runtime — no test file ever hard-codes an environment name.

#### Loader — `src/utils/helpers.ts` (env resolution + CSV credential lookup)

```ts
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const env = (process.env.TEST_ENV ?? 'sandbox') as 'sandbox' | 'stage';
export { env };

export function loadEnvConfig() {
  return require(`../../testData/${env}/env.properties`);
}

export function loadAuthData() {
  return require(`../../testData/${env}/auth.properties`);
}

// Resolves a user key (e.g. 'valid_user') to { email, password } from the env CSV.
export function getUserByKey(key: string): { email: string; password: string } {
  const csvPath = path.resolve(__dirname, `../../testData/${env}/users.csv`);
  const rows: Array<{ key: string; email: string; password: string }> =
    parse(fs.readFileSync(csvPath), { columns: true, skip_empty_lines: true });
  const user = rows.find(r => r.key === key);
  if (!user) throw new Error(`No user found for key "${key}" in ${env}/users.csv`);
  return { email: user.email, password: user.password };
}
```

Running against a specific environment:
```bash
TEST_ENV=stage npx playwright test
TEST_ENV=sandbox cucumber-js
```

#### `testData/sandbox/env.properties.ts`

```ts
export const envConfig = {
  baseUrl:    'https://tipton.sandbox.usemast.com',
  apiBaseUrl: 'https://tipton.sandbox.usemast.com',
  timeout:    30_000,
};
```

#### `testData/stage/env.properties.ts`

```ts
export const envConfig = {
  baseUrl:    'https://tipton.stage.usemast.com',
  apiBaseUrl: 'https://tipton.stage.usemast.com',
  timeout:    45_000,
};
```

#### `testData/sandbox/users.csv`

Each row is a named user type. The `key` column is what feature files and step definitions reference — credentials never appear in test code.

```csv
key,email,password
valid_user,sandbox-user@usemast.com,SandboxP@ss1
invalid_user,notauser@example.com,wrongpassword
valid_email_wrong_pass,sandbox-user@usemast.com,wrongpassword
```

#### `testData/stage/users.csv`

Same columns, stage-specific credential values.

```csv
key,email,password
valid_user,stage-user@usemast.com,StageP@ss1
invalid_user,notauser@example.com,wrongpassword
valid_email_wrong_pass,stage-user@usemast.com,wrongpassword
```

#### `testData/sandbox/auth.properties.ts`

Holds only non-credential, env-specific data (messages, nav items). No usernames or passwords here.

```ts
export const messages = {
  invalidCredentials: 'Invalid Email or password.',
  signedOut:          'Signed out successfully.',
  passwordResetSent:  'If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.',
};

export const navItems = ['Cases', 'Tasks', 'Dashboard', 'Product Engine', 'Policy Engine'];
```

#### `testData/stage/auth.properties.ts`

Same shape as sandbox; update any message copy that differs in the stage environment.

> **Rule:** Credentials are always resolved at runtime via `getUserByKey(key)`. Feature files and step definitions reference only the key name — never an email address or password directly.

---

### 2. Page Objects — `src/ui/pages/`

#### `BasePage.ts`
Already exists. Extended with common assertions (e.g., `assertUrl`, `assertHeading`).

#### `auth/LoginPage.ts`

Owns all selectors and user-facing actions for `/users/sign_in`.

```ts
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput    // "Enter email address..."
  readonly passwordInput // "Enter password..."
  readonly signInButton  // "Sign in"
  readonly rememberMe    // "Remember me" checkbox
  readonly forgotPasswordLink
  readonly errorMessage  // "Invalid Email or password."

  // Actions
  async navigate()
  async login(email: string, password: string)
  async loginWithRememberMe(email: string, password: string)
  async clickForgotPassword()
  async getErrorMessage(): Promise<string>
  async assertLoggedIn()      // checks nav bar items
  async assertOnLoginPage()   // checks heading + URL
}
```

#### `auth/ForgotPasswordPage.ts`

Owns all selectors and actions for `/users/password/new`.

```ts
export class ForgotPasswordPage extends BasePage {
  // Locators
  readonly emailInput
  readonly submitButton     // "Send me reset password instructions"
  readonly backToLoginLink

  // Actions
  async navigate()
  async submitEmail(email: string)
  async clickBackToLogin()
  async assertOnForgotPasswordPage()  // checks heading + URL
  async assertSuccessMessage()
}
```

---

### 3. Test Data — `testData/<env>/auth.properties.ts`

Test data no longer lives inside `tests/`. It lives in `testData/<env>/auth.properties.ts` and is loaded at runtime via `loadAuthData()`. See **Section 1** above for the full structure and example content.

---

### 4. Fixtures — `src/fixtures/`

#### `auth.fixtures.ts`

```ts
// Provides a `loginPage` fixture and a pre-authenticated `loggedInPage` fixture.
// Tests that need a fresh login use `loginPage`.
// Tests that need to start already logged in use `loggedInPage`.

export const authFixtures = test.extend<{
  loginPage: LoginPage;
  forgotPasswordPage: ForgotPasswordPage;
  loggedInPage: Page;          // page already authenticated via API/storageState
  authToken: string;           // raw bearer token for API tests
}>({ ... });
```

> Using `storageState` (Playwright's session storage snapshot) avoids repeating UI login in every test that requires an authenticated state (e.g., TC_LOGIN_012, TC_LOGIN_013).

---

### 5. UI Specs — `src/ui/specs/auth/`

#### `login.spec.ts`

| Test Case | `test()` name |
|---|---|
| TC_LOGIN_001 | `successful login with valid credentials` |
| TC_LOGIN_002 | `login with empty email and empty password shows error` |
| TC_LOGIN_003 | `login with unregistered email and wrong password shows error` |
| TC_LOGIN_004 | `login with valid email but incorrect password shows error` |
| TC_LOGIN_005 | `login with valid email but empty password shows error` |
| TC_LOGIN_006 | `login with empty email but valid password shows error` |
| TC_LOGIN_007 | `login with Remember Me keeps session after browser restart` |
| TC_LOGIN_012 | `successful logout redirects to login with success message` |
| TC_LOGIN_013 | `accessing protected page when not logged in redirects to login` |

TC_LOGIN_002 through TC_LOGIN_006 share the same assertion (`assertOnLoginPage` + `getErrorMessage`), so they can be driven by a `test.each` data table using `CREDENTIALS` from `auth.data.ts`.

#### `forgot-password.spec.ts`

| Test Case | `test()` name |
|---|---|
| TC_LOGIN_008 | `clicking Forgot Password link navigates to forgot password page` |
| TC_LOGIN_009 | `submitting registered email shows password reset success message` |
| TC_LOGIN_010 | `submitting unregistered email shows generic success message` |
| TC_LOGIN_011 | `Back to login link redirects to login page` |

---

### 6. API Client — `src/api/clients/`

#### `BaseApiClient.ts`

```ts
// Wraps Playwright's APIRequestContext.
// Handles: base URL injection, default headers, response error throwing.
export class BaseApiClient {
  constructor(protected request: APIRequestContext) {}
  protected async post(path: string, body: object): Promise<APIResponse>
  protected async delete(path: string): Promise<APIResponse>
  protected async get(path: string): Promise<APIResponse>
}
```

#### `AuthApiClient.ts`

```ts
export class AuthApiClient extends BaseApiClient {
  async signIn(email: string, password: string): Promise<APIResponse>
  async signOut(token: string): Promise<APIResponse>
  async requestPasswordReset(email: string): Promise<APIResponse>
}
```

---

### 7. API Specs — `src/api/specs/auth/login.api.spec.ts`

| Test Case (API angle) | What is verified |
|---|---|
| TC_LOGIN_001 (API) | `POST /users/sign_in` with valid creds returns `200` + session token |
| TC_LOGIN_003 (API) | `POST /users/sign_in` with bad creds returns `401` + error payload |
| TC_LOGIN_004 (API) | `POST /users/sign_in` with wrong password returns `401` |
| TC_LOGIN_009 (API) | `POST /users/password` with registered email returns `200`/`204` |
| TC_LOGIN_012 (API) | `DELETE /users/sign_out` returns `200`; subsequent protected request returns `401` |
| TC_LOGIN_013 (API) | `GET /cases` without auth header returns `401`/redirect |

---

### 8. BDD Feature Files — `features/auth/`

#### Passing Data Between Steps — World as Shared State

The `CustomWorld` instance (`this`) is created fresh for each scenario and shared across every step in that scenario. Any value set on `this` in one step is available in all subsequent steps — this is the correct mechanism for passing data without global variables or closures.

**Extended `features/support/world.ts`:**

```ts
export class CustomWorld extends World implements ICustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  // Page object instances — set in a Given step, reused across When/Then
  loginPage!: LoginPage;
  forgotPasswordPage!: ForgotPasswordPage;

  // Generic key-value store for all scenario-scoped data.
  // Steps set and retrieve any value by an arbitrary string key.
  // No property needs to be declared in advance.
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
}
```

Any step, in any file, can now stash and retrieve values without pre-declaring a typed property on the World.

**Example — user credentials stored and read across steps:**

```ts
// login.steps.ts
When('I login as {string}', async function (this: CustomWorld, userKey: string) {
  const user = getUserByKey(userKey);
  this.set('currentUser', user);                              // store under any key
  await this.loginPage.login(user.email, user.password);
});

// common.steps.ts — completely separate file, same scenario instance
Then('the welcome message should contain my email', async function (this: CustomWorld) {
  const user = this.get<{ email: string; password: string }>('currentUser'); // retrieve
  await this.loginPage.assertWelcomeEmail(user.email);
});
```

**Example — API response stored and asserted across steps:**

```ts
// api.steps.ts
When('I call the sign-in API as {string}', async function (this: CustomWorld, userKey: string) {
  const { email, password } = getUserByKey(userKey);
  const response = await this.authApiClient.signIn(email, password);
  this.set('lastResponse', response);                         // any key name works
});

// assertions can live in a shared assertions.steps.ts
Then('the response status should be {int}', async function (this: CustomWorld, status: number) {
  const response = this.get<APIResponse>('lastResponse');
  expect(response.status()).toBe(status);
});

Then('the response body should contain a session token', async function (this: CustomWorld) {
  const body = await this.get<APIResponse>('lastResponse').json();
  expect(body.token).toBeDefined();
});
```

**Example — storing any arbitrary value mid-scenario:**

```ts
// A step generates a reset token and stores it; a later step uses it
When('I request a password reset for {string}', async function (this: CustomWorld, userKey: string) {
  const { email } = getUserByKey(userKey);
  const { resetToken } = await this.authApiClient.requestPasswordReset(email);
  this.set('resetToken', resetToken);       // string key, any value type
  this.set('resetEmail', email);
});

Then('I complete the reset using the token', async function (this: CustomWorld) {
  const token = this.get<string>('resetToken');
  const email  = this.get<string>('resetEmail');
  await this.loginPage.submitPasswordReset(token, email);
});
```

> **Rule:** Scenario-scoped data lives in `this.set(key, value)` / `this.get(key)`. Never use module-level variables or closures for cross-step state — those leak between scenarios and cause flaky tests. The private `_store` is reset automatically because a new World instance is created per scenario.

> **Cross-file sharing:** This works even when steps are spread across multiple `.ts` files (e.g., `login.steps.ts`, `forgot-password.steps.ts`, `common.steps.ts`). Cucumber loads all step definition files and binds every step to the **same** `CustomWorld` instance for the duration of a scenario. A value set via `this.set()` in one step file is immediately readable via `this.get()` in any other step file — as long as both steps run in the same scenario.

---

#### `login.feature` (excerpt)

```gherkin
Feature: Login

  Background:
    Given I am on the login page

  Scenario: TC_LOGIN_001 — Successful login with valid credentials
    When I login as "valid_user"
    Then I should be redirected to the home page
    And the navigation bar should be visible

  Scenario Outline: TC_LOGIN_002–006 — Login with invalid or empty credentials
    When I login as "<user_key>"
    Then I should see the error "Invalid Email or password."
    And I should remain on the login page

    Examples:
      | user_key                  |
      | empty_both                |
      | invalid_both              |
      | valid_email_wrong_pass    |
      | valid_email_no_pass       |
      | no_email_valid_pass       |
```

The `user_key` values (`empty_both`, `valid_email_wrong_pass`, etc.) are rows in `users.csv`. No email or password ever appears in a feature file.

#### `forgot-password.feature` (excerpt)

```gherkin
Feature: Forgot Password

  Scenario: TC_LOGIN_008 — Navigate to Forgot Password page
    Given I am on the login page
    When I click the "Forgot password" link
    Then I should be on the forgot password page

  Scenario: TC_LOGIN_009 — Submit with registered email
    Given I am on the forgot password page
    When I enter a registered email and submit
    Then I should see the password reset confirmation message
```

#### Step Definitions (`features/step-definitions/auth/login.steps.ts`)

Each step delegates entirely to the **LoginPage** POM. The user key from the feature file is resolved to real credentials via `getUserByKey` — step files never contain email addresses or passwords.

```ts
When('I login as {string}', async function (this: CustomWorld, userKey: string) {
  const { email, password } = getUserByKey(userKey);
  await this.loginPage.login(email, password);
});
```

---

## Test Case → File Map (Quick Reference)

| TC ID | Layer | File |
|---|---|---|
| TC_LOGIN_001 | UI + API | `login.spec.ts`, `login.api.spec.ts`, `login.feature` |
| TC_LOGIN_002 | UI | `login.spec.ts`, `login.feature` |
| TC_LOGIN_003 | UI + API | `login.spec.ts`, `login.api.spec.ts`, `login.feature` |
| TC_LOGIN_004 | UI + API | `login.spec.ts`, `login.api.spec.ts`, `login.feature` |
| TC_LOGIN_005 | UI | `login.spec.ts`, `login.feature` |
| TC_LOGIN_006 | UI | `login.spec.ts`, `login.feature` |
| TC_LOGIN_007 | UI only | `login.spec.ts` |
| TC_LOGIN_008 | UI | `forgot-password.spec.ts`, `forgot-password.feature` |
| TC_LOGIN_009 | UI + API | `forgot-password.spec.ts`, `login.api.spec.ts`, `forgot-password.feature` |
| TC_LOGIN_010 | UI + API | `forgot-password.spec.ts`, `login.api.spec.ts`, `forgot-password.feature` |
| TC_LOGIN_011 | UI | `forgot-password.spec.ts`, `forgot-password.feature` |
| TC_LOGIN_012 | UI + API | `login.spec.ts`, `login.api.spec.ts`, `login.feature` |
| TC_LOGIN_013 | UI + API | `login.spec.ts`, `login.api.spec.ts`, `login.feature` |

---

## Why Some Tests Are UI-Only vs. UI + API

- **UI only** (TC_LOGIN_005, 006, 007, 008, 011): These validate browser-level behaviour (empty field submission handled client-side, checkbox state, page navigation) that has no meaningful direct API equivalent.
- **UI + API** (TC_LOGIN_001, 003, 004, 009, 010, 012, 013): These involve server-side authentication decisions. The API test validates the contract (status codes, response body), while the UI test validates the user-visible experience.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Credentials in env-specific `users.csv`, not in `.ts` files | CSV is easy to update without touching code, can be excluded from source control (`.gitignore`) if needed, and is readable by non-engineers |
| Feature files reference a `user_key`, not email/password | Keeps credentials out of test logic entirely; switching environments only requires pointing to a different CSV row |
| `getUserByKey(key)` resolves credentials at runtime | One lookup function for the whole suite; adding a new user type means a new CSV row, not a code change |
| Env-specific `testData/<env>/` folders instead of a single config file | Each environment has a self-contained set of files; adding a new env (e.g., `prod`) means adding one folder with no changes to test code |
| Same file names across env folders | `env.properties.ts`, `auth.properties.ts`, and `users.csv` exist in every env folder, keeping the shape predictable and diffs reviewable |
| `TEST_ENV` env var + loader helper | All environment selection is in one place (`loadEnvConfig` / `loadAuthData` / `getUserByKey`); tests never hard-code environment paths |
| Page objects extend `BasePage` | Avoids duplicating `goto`, `waitForLoadState`, common assertion helpers |
| `storageState` fixture for pre-auth | Eliminates UI login setup in every test needing an authenticated state, faster CI runs |
| `test.each` for TC_LOGIN_002–006 | All five cases share identical steps and the same expected outcome — a data-driven table is cleaner than five near-identical `test()` blocks |
| BDD step files import POM, not vice versa | POM is framework-agnostic; BDD and Playwright specs both reuse the same page objects |
| API client wraps `APIRequestContext` | Keeps raw Playwright API out of test files; easy to swap transport later |
