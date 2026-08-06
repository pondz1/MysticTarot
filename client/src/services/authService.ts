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

    const response = await fetch('/api/auth/guest-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId: targetDeviceId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to authenticate as guest');
    }

    const data: AuthStateResponse = await response.json();
    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  },

  /**
   * Fetches current authenticated user profile
   */
  async fetchMe(): Promise<AuthStateResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No JWT token stored');
    }

    const response = await fetch('/api/auth/me', {
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      this.clearToken();
      throw new Error('Session expired or invalid token');
    }

    const data = await response.json();
    return {
      token,
      user: data.user,
      credits: data.credits,
    };
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
