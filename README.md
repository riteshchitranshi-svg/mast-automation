# MAST Automation

End-to-end test automation suite for the MAST application. Covers UI tests (Playwright specs) and API tests using Playwright's `APIRequestContext`.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later (bundled with Node.js)
- Git

---

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd mast-automation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install
```

> To install only the browsers you need:
> ```bash
> npx playwright install chromium
> npx playwright install firefox
> npx playwright install webkit
> ```

### 4. Configure test data

Credentials and environment URLs are already pre-configured in `testData/`. No additional setup is required for the default `sandbox` environment.

To point at a different environment, set `TEST_ENV` before running tests:

```bash
export TEST_ENV=stage   # macOS / Linux
$env:TEST_ENV="stage"   # Windows PowerShell
```

### 5. Verify the setup

```bash
npx playwright test --project=chromium src/ui/specs/auth/login.spec.ts
```

A passing run confirms that browsers, dependencies, and test data are all wired up correctly.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Playwright](https://playwright.dev) | ^1.58 | Browser automation, API testing, test runner |
| TypeScript | ^5.9 | Language |
| csv-parse | ^6.1 | Loading test credentials from CSV |
| ts-node | ^10.9 | Running TypeScript without a build step |

---

## Project Structure

```
mast-automation/
├── testData/                  ← Environment-specific data only — no test logic here
│   ├── sandbox/
│   │   ├── env.properties     ← baseUrl, apiBaseUrl, timeout for sandbox
│   │   └── users.csv          ← Named credential rows for sandbox
│   └── stage/
│       ├── env.properties
│       └── users.csv
│
├── src/                       ← All automation source code
│   ├── ui/
│   │   ├── pages/             ← Page Object Model (POM) classes
│   │   │   ├── BasePage.ts    ← Shared page actions (goto, assert URL/heading…)
│   │   │   └── auth/
│   │   │       ├── LoginPage.ts
│   │   │       └── ForgotPasswordPage.ts
│   │   └── specs/             ← Playwright UI test specifications
│   │       └── auth/
│   │           ├── login.spec.ts
│   │           └── forgot-password.spec.ts
│   │
│   ├── api/
│   │   ├── clients/           ← API client wrappers
│   │   │   ├── BaseApiClient.ts   ← Shared HTTP helpers (get/post/delete)
│   │   │   └── AuthApiClient.ts
│   │   ├── specs/             ← Playwright API test specifications
│   │   │   └── auth/
│   │   │       └── login.api.spec.ts
│   │   └── types/             ← TypeScript interfaces for request/response shapes
│   │       └── auth.types.ts
│   │
│   ├── constants/             ← Static domain-specific values
│   │   └── auth.constants.ts  ← UI messages, nav items
│   │
│   ├── fixtures/              ← Reusable Playwright test fixtures
│   │   ├── auth.fixtures.ts   ← loginPage, forgotPasswordPage, loggedInPage, authToken
│   │   └── index.ts           ← Re-exports combined `test` and `expect`
│   │
│   └── utils/                 ← Shared utility functions
│       ├── env-config.ts      ← loadEnvConfig() — reads env.properties per TEST_ENV
│       ├── user-data.ts       ← getUserByKey() — resolves a key to {email, password}
│       ├── page-utils.ts      ← Playwright page-level helpers (e.g. waitForResponse)
│       └── async-utils.ts     ← Generic async helpers (e.g. retry)
│
├── docs/                      ← Project documentation and manual test references
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Architecture Overview

The suite is divided into two layers that share the same infrastructure:

```
┌────────────────────────────────────────────────┐
│                  Test Layers                   │
│                                                │
│  ┌───────────────────────┐  ┌──────────────┐  │
│  │       UI Specs        │  │  API Specs   │  │
│  │     (Playwright)      │  │ (Playwright) │  │
│  └──────────┬────────────┘  └──────┬───────┘  │
│             │                      │          │
│  ┌──────────▼──────────────────┐   │          │
│  │     Page Object Model       │   │          │
│  │  (src/ui/pages/<domain>/)   │   │          │
│  └─────────────────────────────┘   │          │
│                                    │          │
│  ┌─────────────────────────────────▼───────┐  │
│  │           API Clients                   │  │
│  │  (src/api/clients/<Domain>ApiClient.ts) │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌───────────────────────────────────────┐    │
│  │         Shared Infrastructure         │    │
│  │  fixtures/  constants/  utils/        │    │
│  │  testData/                            │    │
│  └───────────────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

### UI Layer — Page Object Model

Every UI interaction is encapsulated in a POM class under `src/ui/pages/`. All page classes extend `BasePage`, which provides shared helpers (`goto`, `waitForPageLoad`, `assertUrl`, `assertHeading`).

- Spec files call **POM methods only**.
- Locators are defined in the constructor using Playwright's semantic locator strategies (`getByRole`, `getByLabel`, `getByPlaceholder`).

```
BasePage
  └── LoginPage          → navigate(), login(), assertLoggedIn(), …
  └── ForgotPasswordPage → navigate(), submitEmail(), assertConfirmation(), …
```

### API Layer — Client Hierarchy

All API calls go through a domain client that extends `BaseApiClient`. The base class wraps Playwright's `APIRequestContext` and exposes typed `get`, `post`, and `delete` helpers.

```
BaseApiClient
  └── AuthApiClient  → signIn(), signOut(), requestPasswordReset()
```

Request/response TypeScript types live in `src/api/types/<domain>.types.ts`.

### Fixtures

Fixtures (`src/fixtures/`) compose Playwright's `test.extend` to inject page objects and auth state into tests automatically. All spec files import `test` and `expect` from `src/fixtures/index.ts` — never from `@playwright/test` directly.

| Fixture | Type | Description |
|---------|------|-------------|
| `loginPage` | `LoginPage` | Fresh `LoginPage` instance |
| `forgotPasswordPage` | `ForgotPasswordPage` | Fresh `ForgotPasswordPage` instance |
| `loggedInPage` | `Page` | Page pre-authenticated as `valid_user` |
| `authToken` | `string` | JWT obtained for `valid_user` via API |

---

## Environment Configuration

The active environment is controlled by the `TEST_ENV` environment variable (default: `sandbox`).

```
TEST_ENV=sandbox   # default
TEST_ENV=stage
```

`loadEnvConfig()` reads the matching `testData/<env>/env.properties` file:

```properties
baseUrl=https://tipton.sandbox.usemast.com
apiBaseUrl=https://tipton.sandbox.usemast.com
timeout=30000
```

> **Never** hardcode base URLs in test or page files. Always use `loadEnvConfig().baseUrl`.

---

## Test Data

### Credentials

Credentials are stored exclusively in `testData/<env>/users.csv` and accessed via `getUserByKey(key)`.

| Key | Description |
|-----|-------------|
| `valid_user` | Registered user with correct credentials |
| `invalid_user` | Unregistered email + wrong password |
| `valid_email_wrong_pass` | Registered email, incorrect password |
| `valid_email_no_pass` | Registered email, empty password |
| `no_email_valid_pass` | Empty email, correct password |
| `empty_both` | Both fields empty |

To add a new test user, add a row to both `testData/sandbox/users.csv` and `testData/stage/users.csv`. No code changes needed.

### Domain Data

Extra environment-specific values (IDs, slugs, etc.) go in `testData/<env>/<domain>.properties`, loaded via `loadEnvConfig()` or a dedicated utility.

---

## Running Tests

### Playwright UI Tests

```bash
# All UI tests (sandbox, headless)
npx playwright test

# Headed mode
npm run test:headed

# Specific spec file
npx playwright test src/ui/specs/auth/login.spec.ts

# Single browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Stage environment
TEST_ENV=stage npx playwright test

# Open interactive UI mode
npm run test:ui

# Debug mode
npm run test:debug
```

### Playwright API Tests

```bash
npx playwright test src/api/specs/
```

### Reports

```bash
# Open the last HTML report
npm run report
```

---

## Adding a New Domain

When adding tests for a new domain (e.g. `cases`), follow this checklist:

1. `src/ui/pages/cases/CasesPage.ts` — extend `BasePage`
2. `src/ui/specs/cases/cases.spec.ts` — import `test` from `src/fixtures/index.ts`
3. `src/api/clients/CasesApiClient.ts` — extend `BaseApiClient`
4. `src/api/specs/cases/cases.api.spec.ts`
5. `src/api/types/cases.types.ts` — request/response interfaces
6. `src/constants/cases.constants.ts` — static messages and labels
7. `testData/<env>/cases.properties` — if env-specific data is needed
8. Register new fixtures in `src/fixtures/auth.fixtures.ts` (or a new fixture file) and re-export from `src/fixtures/index.ts`

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| POM class | `PascalCase.ts` | `LoginPage.ts` |
| Playwright UI spec | `kebab-case.spec.ts` | `login.spec.ts` |
| Playwright API spec | `kebab-case.api.spec.ts` | `login.api.spec.ts` |
| Constants files | `kebab-case.constants.ts` | `auth.constants.ts` |
| Type files | `kebab-case.types.ts` | `auth.types.ts` |
| API clients | `PascalCaseApiClient.ts` | `AuthApiClient.ts` |

---

## Key Rules

- Import `test` and `expect` from `src/fixtures/index.ts`, **not** `@playwright/test`.
- All page interactions (`fill`, `click`, `locator`) belong in POM methods — never in spec or step files.
- Credentials are always resolved via `getUserByKey(key)` — never hardcoded.
- Shared logic lives in `src/utils/` and `src/constants/` — never duplicated across files.

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a full history of changes.
