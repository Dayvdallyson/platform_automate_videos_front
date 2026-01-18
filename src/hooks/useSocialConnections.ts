'use client';

import { api } from '@/lib/api';
import { ConnectionStatus } from '@/types/video';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

export const socialConnectionsKey = ['social-connections'] as const;

export function useSocialConnections() {
  return useQuery<ConnectionStatus[]>({
    queryKey: socialConnectionsKey,
    queryFn: () => api.getConnections(),
    staleTime: 30000,
  });
}

export function useConnectPlatform() {
  const queryClient = useQueryClient();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startPolling = useCallback(() => {
    pollIntervalRef.current = setInterval(async () => {
      if (popupRef.current && popupRef.current.closed) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        queryClient.invalidateQueries({ queryKey: socialConnectionsKey });
      }
    }, 2000);
  }, [queryClient]);

  return useMutation({
    mutationFn: async (platform: 'tiktok' | 'instagram') => {
      const data = await api.getConnectUrl(platform);
      return { ...data, platform };
    },
    onSuccess: (data) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      popupRef.current = window.open(
        data.auth_url,
        `Connect ${data.platform}`,
        `width=${width},height=${height},left=${left},top=${top},popup=1`,
      );

      startPolling();
    },
  });
}

export function useDisconnectPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platform: 'tiktok' | 'instagram') => api.disconnectPlatform(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialConnectionsKey });
    },
  });
}

export function isTokenExpiringSoon(expiresAt: string | null, daysThreshold: number = 7): boolean {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays < daysThreshold;
}

export function formatExpiryTime(expiresAt: string | null): string {
  if (!expiresAt) return '';
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return `Expires in ${diffDays} days`;
  if (diffDays === 1) return 'Expires tomorrow';

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 1) return `Expires in ${diffHours} hours`;

  return 'Expires soon';
}
