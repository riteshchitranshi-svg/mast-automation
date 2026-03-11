import { authFixtures } from './auth.fixtures';
export { expect } from '@playwright/test';

// Combine all fixture sets here as more are added.
// Import this `test` in all spec files instead of @playwright/test directly.
export const test = authFixtures;
