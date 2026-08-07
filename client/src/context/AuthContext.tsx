import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService, type User } from '../services/authService';
import { apiClient } from '../services/apiClient';
import { publishCredits, subscribeCredits } from '../services/creditEvents';

export interface CreditFeatures {
  topupSimulator: boolean;
  omisePayments?: boolean;
  omisePublicKey?: string | null;
  paidTopup?: boolean;
  fastRefill: boolean;
  isProduction: boolean;
}

interface AuthContextType {
  user: User | null;
  credits: number | null;
  token: string | null;
  deviceId: string;
  isLoading: boolean;
  features: CreditFeatures | null;
  /** Optimistically set local credit balance and notify subscribers */
  updateCredits: (credits: number) => void;
  refillCredits: (amount?: number) => Promise<number | undefined>;
  refreshCredits: () => Promise<number | undefined>;
  refreshFeatures: () => Promise<CreditFeatures | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_FEATURES: CreditFeatures = {
  topupSimulator: !import.meta.env.PROD,
  omisePayments: false,
  omisePublicKey: null,
  paidTopup: !import.meta.env.PROD,
  fastRefill: !import.meta.env.PROD,
  isProduction: Boolean(import.meta.env.PROD),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [deviceId] = useState<string>(() => authService.getDeviceId());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [features, setFeatures] = useState<CreditFeatures | null>(null);

  const updateCredits = useCallback((next: number) => {
    const safe = Math.max(0, Math.floor(Number(next) || 0));
    setCredits(safe);
    publishCredits(safe);
  }, []);

  // Synchronize credits from the typed bus (AI client, other modules)
  useEffect(() => {
    return subscribeCredits((next) => {
      setCredits(next);
    });
  }, []);

  const refreshFeatures = useCallback(async (): Promise<CreditFeatures | undefined> => {
    try {
      const data = await apiClient.get<{ features?: CreditFeatures }>('/api/user/features');
      if (data.features) {
        setFeatures(data.features);
        return data.features;
      }
    } catch {
      // fall through to defaults
    }
    setFeatures(DEFAULT_FEATURES);
    return DEFAULT_FEATURES;
  }, []);

  const refreshCredits = useCallback(async (): Promise<number | undefined> => {
    try {
      const data = await apiClient.get<{ credits?: number; features?: CreditFeatures }>(
        '/api/user/credits'
      );
      if (data.features) {
        setFeatures(data.features);
      }
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
          updateCredits(data.credits);
          return data.credits;
        }
      } catch (e) {
        console.warn('Failed to refill credits:', e);
        throw e;
      }
      return undefined;
    },
    [updateCredits]
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
        // Load feature flags after auth so session headers are ready
        if (isMounted) {
          await refreshFeatures();
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
  }, [refreshFeatures]);

  return (
    <AuthContext.Provider
      value={{
        user,
        credits,
        token,
        deviceId,
        isLoading,
        features,
        updateCredits,
        refillCredits,
        refreshCredits,
        refreshFeatures,
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
