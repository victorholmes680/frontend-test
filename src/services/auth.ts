class AuthTokenService {
  private static instance: AuthTokenService;
  private token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InpoYW9saXUiLCJleHAiOjE3NTgyNDc3MjB9.YNHxbmb_fWIxjVwm2tkJjI_P5SnEVZKESKxqATry9VQ';

  private constructor() {}

  static getInstance(): AuthTokenService {
    if (!AuthTokenService.instance) {
      AuthTokenService.instance = new AuthTokenService();
    }
    return AuthTokenService.instance;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('tenant_token', token);
  }

  getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('tenant_token') || '';
    }
    return this.token;
  }

  hasToken(): boolean {
    return this.getToken().length > 0;
  }

  clearToken(): void {
    this.token = '';
    localStorage.removeItem('tenant_token');
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'token': token } : {};
  }
}

export const authService = AuthTokenService.getInstance();