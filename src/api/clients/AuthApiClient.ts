import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseApiClient } from './BaseApiClient';

export class AuthApiClient extends BaseApiClient {
  constructor(request: APIRequestContext, baseUrl: string) {
    super(request, baseUrl);
  }

  async signIn(email: string, password: string): Promise<APIResponse> {
    return this.post('/users/sign_in', { user: { email, password } });
  }

  async signOut(token: string): Promise<APIResponse> {
    return this.delete('/users/sign_out', { Authorization: `Bearer ${token}` });
  }

  async requestPasswordReset(email: string): Promise<APIResponse> {
    return this.post('/users/password', { user: { email } });
  }
}
