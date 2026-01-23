'use client';

import { CreateUserRequest, User } from '@/types/subscription';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createContext, useContext } from 'react';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: { email: string; password?: string }) => Promise<void>;
  register: (data: CreateUserRequest & { password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  loginWithFacebook: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.BACKEND_FASTAPI_URL || 'http://localhost:8000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch current session
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) return null;
        // checking 404 just in case backend isn't ready, treat as no session
        if (res.status === 404) return null;
        throw new Error('Failed to fetch session');
      }
      return res.json() as Promise<User>;
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password?: string }) => {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Login failed');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      // UI will handle redirect
    },
    onError: (error: Error) => {
      // UI will handle error display
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: CreateUserRequest & { password?: string }) => {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || 'Registration failed');
      }

      return res.json();
    },
    onSuccess: () => {
      // UI will handle redirect to success view
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      router.push('/login');
      toast.success('Logged out');
    },
  });

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const loginWithFacebook = () => {
    window.location.href = `${API_BASE}/api/auth/facebook`;
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        login: async (data) => await loginMutation.mutateAsync(data),
        register: async (data) => await registerMutation.mutateAsync(data),
        logout: async () => await logoutMutation.mutateAsync(),
        loginWithGoogle,
        loginWithFacebook,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
