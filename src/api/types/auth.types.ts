export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  token?: string;
  error?: string;
}

export interface PasswordResetRequest {
  email: string;
}
