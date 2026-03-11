# GitHub Copilot Instructions — mast-automation

This file describes the project architecture, conventions, and navigation rules for Copilot to follow when assisting with this repository.

---

## Project Purpose

End-to-end test automation suite for the MAST application. Covers:
- **UI tests** using Playwright (direct spec files)
- **UI tests** using Cucumber BDD (feature files + step definitions)
- **API tests** using Playwright's `APIRequestContext`

---

## Directory Map

```
mast-automation/
├── testData/                  ← Environment-specific data only — no test logic here
│   ├── sandbox/               ← All data values for the sandbox environment
│   └── stage/                 ← All data values for the stage environment
│
├── src/                       ← All automation source code
│   ├── ui/                    ← Everything related to UI automation
│   │   ├── pages/             ← Page Object Model classes, one per application page
│   │   │   └── <domain>/      ← Pages grouped by application domain
│   │   └── specs/             ← Playwright UI test specifications
│   │       └── <domain>/      ← Specs grouped by application domain
│   ├── api/                   ← Everything related to API automation
│   │   ├── clients/           ← API client wrappers, one per application domain
│   │   ├── specs/             ← Playwright API test specifications
│   │   │   └── <domain>/      ← Specs grouped by application domain
│   │   └── types/             ← TypeScript interfaces for API request/response shapes
│   ├── constants/             ← Domain-grouped constant files (one file per domain)
│   ├── fixtures/              ← Reusable Playwright test fixtures (setup/teardown)
│   └── utils/                 ← Shared utility functions and environment loaders
│
├── features/                  ← Cucumber BDD layer
│   ├── <domain>/              ← Feature files grouped by application domain
│   ├── step-definitions/      ← Step implementations bound to feature file steps
│   │   └── <domain>/          ← Step files grouped by application domain
│   └── support/               ← Cucumber infrastructure — World, hooks, lifecycle
│
├── docs/                      ← Project documentation and manual test references
├── playwright.config.ts
├── cucumber.js
├── tsconfig.json
└── package.json
```

---

## Core Conventions

### 1. Environment Selection
- Active environment is controlled by `TEST_ENV` env var (`sandbox` | `stage`, default `sandbox`).
- **Never import directly from `testData/sandbox/` or `testData/stage/`.**
- Always use the utility files from `src/utils/`:
  - `env-config.ts` — `loadEnvConfig()` for base URLs and timeouts
  - `user-data.ts` — `getUserByKey(key)` resolves a named user key to `{ email, password }` from the env CSV
  - `page-utils.ts` — Playwright page-level utilities (e.g. `waitForResponse`)
  - `async-utils.ts` — generic async helpers (e.g. `retry`)
- Domain constants (messages, labels, nav items) live in `src/constants/<domain>.constants.ts` — import directly from there.

### 2. Credentials
- Credentials live **only** in `testData/<env>/users.csv`.
- Feature files and step definitions reference user keys (e.g. `"valid_user"`, `"invalid_user"`), never raw email/password strings.
- To add a new test user: add a row to both CSV files, no code changes needed.

### 3. Page Object Model
- Every page interaction lives in a POM class under `src/ui/pages/`.
- New pages extend `BasePage` (`src/ui/pages/BasePage.ts`).
- Locators are defined in the constructor using Playwright's built-in locator strategies (no CSS selectors unless unavoidable).
- Spec files and step definitions call POM methods only — never `page.$()`, `page.fill()`, etc. directly.
- Add new page objects under `src/ui/pages/<domain>/PageName.ts`.

### 4. Playwright Specs
- Import `test` and `expect` from `src/fixtures/index.ts`, not from `@playwright/test` directly.
- Use fixtures (`loginPage`, `forgotPasswordPage`, `loggedInPage`, `authToken`) instead of manually instantiating page objects in specs.
- UI specs go in `src/ui/specs/<domain>/`.
- API specs go in `src/api/specs/<domain>/`.

### 5. Cucumber BDD
- Feature files go in `features/<domain>/`.
- Step definition files go in `features/step-definitions/<domain>/`.
- Steps are bound to `CustomWorld` via `this: CustomWorld` — never use module-level variables for scenario state.
- Pass data between steps using `this.set(key, value)` / `this.get<T>(key)` — the `_store` is reset per scenario automatically.
- Steps only call POM methods. No Playwright API calls (locators, fills, clicks) inside step files.

### 6. API Clients
- `BaseApiClient` wraps `APIRequestContext`. Domain clients extend it.
- New API domains: create `src/api/clients/<Domain>ApiClient.ts` extending `BaseApiClient`.
- Request/response shapes go in `src/api/types/<domain>.types.ts`.

### 7. Code Modularity
- Keep files small and focused — each file should do one thing.
- Methods should be short and single-purpose. If a method grows beyond ~20 lines, extract the logic into a helper.
- Shared logic belongs in a focused utility file under `src/utils/` — never duplicated across spec or step files:
  - `env-config.ts` — environment loading
  - `user-data.ts` — credential resolution
  - `page-utils.ts` — Playwright page-level helpers
  - `async-utils.ts` — generic async helpers
- Domain constants belong in `src/constants/<domain>.constants.ts`.
- If the same pattern appears in more than one place, extract it into the appropriate utility file above.
- Avoid deeply nested logic; prefer early returns and small private methods.

### 8. Adding a New Feature/Domain
When adding tests for a new domain (e.g. `cases`), follow this checklist:
1. Create `src/ui/pages/cases/CasesPage.ts` extending `BasePage`
2. Create `src/ui/specs/cases/cases.spec.ts`
3. Create `src/api/clients/CasesApiClient.ts` extending `BaseApiClient`
4. Create `src/api/specs/cases/cases.api.spec.ts`
5. Create `features/cases/cases.feature`
6. Create `features/step-definitions/cases/cases.steps.ts`
7. Add `src/constants/<domain>.constants.ts` for domain-specific static constants
8. Add `testData/<env>/<domain>.properties` if environment-specific data is needed
9. Register new fixtures in `src/fixtures/index.ts` if needed

---

## Running Tests

```bash
# Playwright UI tests (sandbox)
npx playwright test

# Playwright UI tests (stage)
TEST_ENV=stage npx playwright test

# Specific spec file
npx playwright test src/ui/specs/auth/login.spec.ts

# API tests only
npx playwright test src/api/specs/

# Cucumber BDD (sandbox)
npm run cucumber

# Cucumber BDD headless=false
npm run cucumber:headed

# Cucumber with tags
npm run cucumber:tags -- --tags "@smoke"
npm run cucumber:tags -- --tags "@TC_LOGIN_001"

# Specific env
TEST_ENV=stage npm run cucumber
```

---

## Test Data Keys (Login Domain)

Defined in `testData/<env>/users.csv`:

| key | description |
|---|---|
| `valid_user` | Registered user with correct credentials |
| `invalid_user` | Unregistered email + wrong password |
| `valid_email_wrong_pass` | Registered email, incorrect password |
| `valid_email_no_pass` | Registered email, empty password |
| `no_email_valid_pass` | Empty email, correct password |
| `empty_both` | Both fields empty |

---

## File Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| POM class | `PascalCase.ts` | `LoginPage.ts` |
| Playwright spec | `kebab-case.spec.ts` | `login.spec.ts` |
| API spec | `kebab-case.api.spec.ts` | `login.api.spec.ts` |
| Step definitions | `kebab-case.steps.ts` | `login.steps.ts` |
| Feature files | `kebab-case.feature` | `login.feature` |
| Constants files | `kebab-case.constants.ts` | `auth.constants.ts` |
| Type files | `kebab-case.types.ts` | `auth.types.ts` |
| API clients | `PascalCaseApiClient.ts` | `AuthApiClient.ts` |

---

## Changelog

A `CHANGELOG.md` file must be maintained at the project root. **Every push must include an update to `CHANGELOG.md`.**

### Format

Follow [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions:

```markdown
## [Unreleased]

## [YYYY-MM-DD]
### Added
- New feature or test added

### Changed
- Modification to existing tests, pages, or utilities

### Fixed
- Bug fixes or corrections to test logic

### Removed
- Deleted files or deprecated tests
```

### Rules
- Each entry must be dated (`YYYY-MM-DD`) and grouped under one of: `Added`, `Changed`, `Fixed`, or `Removed`.
- Reference the TC ID (e.g. `TC_LOGIN_001`) and the affected file when applicable.
- Do not leave the `[Unreleased]` section as the only entry when pushing — move its contents under a dated heading.
- Copilot should automatically append a changelog entry whenever it creates, modifies, or deletes test files.

---

## What Copilot Should NOT Do

- Do not create large files — if a file is growing long, split it by responsibility.
- Do not write long methods — extract helper functions instead of stacking logic inside a single method.
- Do not duplicate logic across files — move shared code to the appropriate file in `src/utils/` (`env-config.ts`, `user-data.ts`, `page-utils.ts`, `async-utils.ts`) or `src/constants/<domain>.constants.ts` for static values.
- Do not add `page.fill()`, `page.click()`, `page.locator()` calls inside spec files or step definition files — these belong in POM methods only.
- Do not hardcode `https://tipton.sandbox.usemast.com` or any base URL — always use `loadEnvConfig().baseUrl`.
- Do not hardcode email addresses or passwords — always use `getUserByKey(key)`.
- Do not import from `testData/sandbox/` or `testData/stage/` directly in test code.
- Do not create module-level mutable variables in step definition files for cross-step data sharing — use `this.set()`/`this.get()`.
- Do not import `test` from `@playwright/test` in spec files — always import from `src/fixtures/index.ts`.
