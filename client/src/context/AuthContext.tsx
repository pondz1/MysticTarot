import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, type User } from '../services/authService';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  user: User | null;
  credits: number | null;
  token: string | null;
  deviceId: string;
  isLoading: boolean;
  refillCredits: (amount?: number) => Promise<number | undefined>;
  refreshCredits: () => Promise<number | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [deviceId] = useState<string>(() => authService.getDeviceId());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize credits when custom event triggers
  useEffect(() => {
    const handleCreditsEvent = (e: CustomEvent<number>) => {
      if (typeof e.detail === 'number') {
        setCredits(e.detail);
      }
    };

    window.addEventListener('user_credits_updated', handleCreditsEvent as EventListener);
    return () => {
      window.removeEventListener('user_credits_updated', handleCreditsEvent as EventListener);
    };
  }, []);

  const refreshCredits = useCallback(async (): Promise<number | undefined> => {
    try {
      const data = await apiClient.get<{ credits?: number }>('/api/user/credits');
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
        return data.credits;
      }
    } catch (e) {
      console.warn('Failed to refresh credits:', e);
    }
    return undefined;
  }, []);

  const refillCredits = useCallback(
    async (amount: number = 10): Promise<number | undefined> => {
      try {
        const data = await apiClient.post<{ credits?: number }>('/api/user/refill', { amount });
        if (typeof data.credits === 'number') {
          setCredits(data.credits);
          window.dispatchEvent(new CustomEvent('user_credits_updated', { detail: data.credits }));
          return data.credits;
        }
      } catch (e) {
        console.warn('Failed to refill credits:', e);
      }
      return undefined;
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        setIsLoading(true);
        const authData = await authService.initAuth();
        if (isMounted) {
          setUser(authData.user);
          setCredits(authData.credits);
          setToken(authService.getToken());
        }
      } catch (err) {
        console.error('[AuthContext] Initialization failed:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        token,
        deviceId,
        isLoading,
        refillCredits,
        refreshCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
