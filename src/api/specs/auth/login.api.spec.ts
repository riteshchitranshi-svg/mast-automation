import { test, expect } from '../../../fixtures';
import { AuthApiClient } from '../../clients/AuthApiClient';
import { loadEnvConfig } from '../../../utils/env-config';
import { getUserByKey } from '../../../utils/user-data';
import { messages } from '../../../constants/auth.constants';

test.describe('Auth API', () => {
  let client: AuthApiClient;

  test.beforeEach(({ request }) => {
    const { apiBaseUrl } = loadEnvConfig();
    client = new AuthApiClient(request, apiBaseUrl);
  });

  // TC_LOGIN_001 (API)
  test('POST /users/sign_in with valid credentials returns 200', async () => {
    const { email, password } = getUserByKey('valid_user');
    const response = await client.signIn(email, password);
    expect(response.status()).toBe(200);
  });

  // TC_LOGIN_003 (API)
  test('POST /users/sign_in with unregistered credentials returns 401', async () => {
    const { email, password } = getUserByKey('invalid_user');
    const response = await client.signIn(email, password);
    expect(response.status()).toBe(401);
  });

  // TC_LOGIN_004 (API)
  test('POST /users/sign_in with wrong password returns 401', async () => {
    const { email, password } = getUserByKey('valid_email_wrong_pass');
    const response = await client.signIn(email, password);
    expect(response.status()).toBe(401);
  });

  // TC_LOGIN_009 (API)
  test('POST /users/password with registered email returns success', async () => {
    const { email } = getUserByKey('valid_user');
    const response = await client.requestPasswordReset(email);
    expect([200, 204]).toContain(response.status());
  });

  // TC_LOGIN_010 (API)
  test('POST /users/password with unregistered email returns generic success', async () => {
    const { email } = getUserByKey('invalid_user');
    const response = await client.requestPasswordReset(email);
    expect([200, 204]).toContain(response.status());
  });

  // TC_LOGIN_012 (API)
  test('DELETE /users/sign_out invalidates the session', async ({ authToken, request }) => {
    const { apiBaseUrl } = loadEnvConfig();
    const response = await client.signOut(authToken);
    expect([200, 204]).toContain(response.status());

    // Subsequent protected request should be rejected
    const protectedResponse = await request.get(`${apiBaseUrl}/cases`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect([401, 302]).toContain(protectedResponse.status());
  });

  // TC_LOGIN_013 (API)
  test('GET /cases without auth header returns 401', async ({ request }) => {
    const { apiBaseUrl } = loadEnvConfig();
    const response = await request.get(`${apiBaseUrl}/cases`);
    expect([401, 302]).toContain(response.status());
  });
});
