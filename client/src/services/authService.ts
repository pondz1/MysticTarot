import { apiClient } from './apiClient';

export interface User {
  id: string;
  device_id: string;
  role: string;
  created_at?: string;
}

export interface AuthStateResponse {
  token?: string;
  user: User;
  credits: number;
}

const DEVICE_ID_KEY = 'mystic_device_id';
const TOKEN_KEY = 'mystic_jwt_token';

export const authService = {
  /**
   * Retrieves existing device ID or generates a unique standard UUID for this browser
   */
  getDeviceId(): string {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = `dev_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
      }
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  /**
   * Performs auto-guest login using deviceId
   */
  async guestLogin(deviceId?: string): Promise<AuthStateResponse> {
    const targetDeviceId = deviceId || this.getDeviceId();

    try {
      const data = await apiClient.post<AuthStateResponse>('/api/auth/guest-login', {
        deviceId: targetDeviceId,
      });

      if (data.token) {
        this.setToken(data.token);
      }

      return {
        token: data.token,
        user: data.user,
        credits: data.credits,
      };
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to authenticate as guest');
    }
  },

  /**
   * Fetches current authenticated user profile
   */
  async fetchMe(): Promise<AuthStateResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No JWT token stored');
    }

    try {
      const data = await apiClient.get<AuthStateResponse>('/api/auth/me');
      return {
        token,
        user: data.user,
        credits: data.credits,
      };
    } catch (err: any) {
      this.clearToken();
      throw new Error(err?.message || 'Session expired or invalid token');
    }
  },

  /**
   * Main startup auth flow: Validates existing token or performs guest login
   */
  async initAuth(): Promise<AuthStateResponse> {
    const token = this.getToken();
    if (token) {
      try {
        return await this.fetchMe();
      } catch (err) {
        console.warn('[AuthService] Token invalid/expired, falling back to guest login:', err);
      }
    }

    const deviceId = this.getDeviceId();
    return await this.guestLogin(deviceId);
  },
};
