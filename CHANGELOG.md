# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [2026-03-11] — GitHub Actions CI, trace config, and .gitignore hardening

### Added
- `.github/workflows/playwright.yml` — GitHub Actions workflow with three parallel jobs: Playwright UI tests, Cucumber BDD tests, and API tests; supports manual `workflow_dispatch` with environment (`sandbox`/`stage`) and browser selection; uploads HTML reports, traces, screenshots, and videos as artifacts retained for 30 days
- `testData/sandbox/users.csv.example` — safe credential template for sandbox (no real passwords)
- `testData/stage/users.csv.example` — safe credential template for stage
- `testData/sandbox/env.properties.example` — safe env config template for sandbox
- `testData/stage/env.properties.example` — safe env config template for stage
- `.vscode/settings.json` — shared Cucumber autocomplete settings for VS Code

### Changed
- `playwright.config.ts` — `trace` changed from `on-first-retry` to `on` so traces are captured for every test run
- `.gitignore` — added rules to exclude `testData/**/users.csv`, `testData/**/env.properties`, `allure-results/`, `allure-report/`, `.DS_Store`, `Thumbs.db`, OS/editor temp files; real credentials are now never committed

---

## [2026-03-10] — Move constants to src/constants/

### Added
- `src/constants/auth.constants.ts` — auth domain constants (`messages`, `navItems`), relocated from `src/utils/constants.ts`

### Changed
- `src/ui/specs/auth/login.spec.ts`, `src/ui/specs/auth/forgot-password.spec.ts`, `src/api/specs/auth/login.api.spec.ts`, `features/step-definitions/auth/login.steps.ts` — updated imports to `src/constants/auth.constants.ts`
- `.github/copilot-instructions.md` — updated Directory Map, conventions, naming table, and new-domain checklist to reflect `src/constants/<domain>.constants.ts` pattern

### Removed
- `src/utils/constants.ts` — replaced by `src/constants/auth.constants.ts`

---

## [2026-03-10] — Split helpers.ts into focused utility files

### Added
- `src/utils/env-config.ts` — `env` constant, `loadEnvConfig()`
- `src/utils/user-data.ts` — `getUserByKey()`
- `src/utils/page-utils.ts` — `waitForResponse()`
- `src/utils/async-utils.ts` — `retry()`

### Changed
- `playwright.config.ts`, `features/support/world.ts`, `src/ui/pages/auth/LoginPage.ts`, `src/ui/pages/auth/ForgotPasswordPage.ts`, `src/fixtures/auth.fixtures.ts`, all spec files and step definition files — updated imports to the new split utility files
- `.github/copilot-instructions.md` — Environment Selection convention updated to reference the four utility files by name

### Removed
- `src/utils/helpers.ts` — replaced by the four focused utility files above

---

## [2026-03-10] — Replace auth.properties with constants.ts

### Added
- `src/utils/constants.ts` — static `messages` and `navItems` constants (previously in `auth.properties`)

### Changed
- `src/utils/helpers.ts` — removed `loadAuthData()`; constants are now imported directly from `src/utils/constants.ts`
- `src/ui/specs/auth/login.spec.ts` — import `messages`, `navItems` from `constants.ts`
- `src/ui/specs/auth/forgot-password.spec.ts` — import `messages` from `constants.ts`
- `src/api/specs/auth/login.api.spec.ts` — import `messages` from `constants.ts`
- `features/step-definitions/auth/login.steps.ts` — import `messages`, `navItems` from `constants.ts`
- `.github/copilot-instructions.md` — updated Environment Selection convention to reflect `constants.ts` for static values

### Removed
- `testData/sandbox/auth.properties`
- `testData/stage/auth.properties`

---

## [2026-03-10] — testData migration to plain .properties files

### Added
- `testData/sandbox/env.properties` — plain key=value file replacing `env.properties.ts`
- `testData/sandbox/auth.properties` — plain key=value file replacing `auth.properties.ts`
- `testData/stage/env.properties` — plain key=value file replacing `env.properties.ts`
- `testData/stage/auth.properties` — plain key=value file replacing `auth.properties.ts`

### Changed
- `src/utils/helpers.ts` — replaced `require()` calls with a `parsePropertiesFile()` parser; `loadEnvConfig()` and `loadAuthData()` now read plain `.properties` files instead of TypeScript modules
- `tsconfig.json` — removed `testData/**/*.ts` from `include` (no TypeScript files remain in `testData/`)
- `.github/copilot-instructions.md` — updated file naming convention and new-domain checklist to reference `.properties` (not `.properties.ts`)

### Removed
- `testData/sandbox/env.properties.ts`
- `testData/sandbox/auth.properties.ts`
- `testData/stage/env.properties.ts`
- `testData/stage/auth.properties.ts`

---

## [2026-03-10]

### Added
- Initial project structure implementing UI + API + BDD test architecture
- `testData/sandbox/` and `testData/stage/` with `env.properties.ts`, `auth.properties.ts`, `users.csv`
- `src/ui/pages/BasePage.ts` — shared page utilities base class
- `src/ui/pages/auth/LoginPage.ts` — POM for `/users/sign_in`
- `src/ui/pages/auth/ForgotPasswordPage.ts` — POM for `/users/password/new`
- `src/utils/helpers.ts` — `loadEnvConfig()`, `loadAuthData()`, `getUserByKey()`, `retry()`, `waitForResponse()`
- `src/api/types/auth.types.ts` — `SignInRequest`, `SignInResponse`, `PasswordResetRequest` interfaces
- `src/api/clients/BaseApiClient.ts` — `APIRequestContext` wrapper with `post`, `get`, `delete`
- `src/api/clients/AuthApiClient.ts` — `signIn()`, `signOut()`, `requestPasswordReset()`
- `src/fixtures/auth.fixtures.ts` — `loginPage`, `forgotPasswordPage`, `loggedInPage`, `authToken` fixtures
- `src/fixtures/index.ts` — re-exports `test` and `expect` for all specs
- `src/ui/specs/auth/login.spec.ts` — TC_LOGIN_001–007, TC_LOGIN_012, TC_LOGIN_013
- `src/ui/specs/auth/forgot-password.spec.ts` — TC_LOGIN_008–011
- `src/api/specs/auth/login.api.spec.ts` — API contract tests for auth endpoints
- `features/auth/login.feature` — BDD scenarios for login domain
- `features/auth/forgot-password.feature` — BDD scenarios for forgot password flow
- `features/step-definitions/auth/login.steps.ts` — login/logout/navigation step definitions
- `features/step-definitions/auth/forgot-password.steps.ts` — forgot password step definitions
- `features/support/world.ts` — `CustomWorld` with `_store`, `set()`, `get()`, `has()` for cross-step state
- `features/support/hooks.ts` — `Before`, `AfterStep`, `After`, `BeforeAll` lifecycle hooks
- `docs/project-structure.md` — full architecture reference document
- `.github/copilot-instructions.md` — Copilot workspace instructions

### Changed
- `playwright.config.ts` — updated `testDir` to `./src`, integrated `loadEnvConfig()` for `baseURL` and `actionTimeout`
- `tsconfig.json` — added path aliases (`@fixtures/*`, `@pages/*`, `@utils/*`, `@api/*`), updated `include` to cover `src/`, `features/`, `testData/`

### Fixed
- Corrected relative import paths in step definition files (3 levels, not 4)
- Corrected relative import paths in UI spec files (3 levels, not 2)
- Replaced `Before({ order: 0 })` with `BeforeAll()` in `hooks.ts` (unsupported option in current Cucumber version)
- Installed `csv-parse` dependency required by `src/utils/helpers.ts`
