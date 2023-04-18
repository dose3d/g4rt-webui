export interface BearerToken {
  email: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: 'access' | 'refresh';
  user_id: number;
  username: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
}
