import { APIRequestContext, APIResponse } from '@playwright/test';

export class BaseApiClient {
  constructor(protected request: APIRequestContext, protected baseUrl: string) {}

  protected async post(path: string, body: object): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${path}`, {
      data: body,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  protected async delete(path: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}${path}`, { headers });
  }

  protected async get(path: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}${path}`, { headers });
  }
}
