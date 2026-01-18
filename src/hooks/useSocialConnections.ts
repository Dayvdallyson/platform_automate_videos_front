'use client';

import { api } from '@/lib/api';
import { ConnectionStatus } from '@/types/video';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

// Query key for social connections
export const socialConnectionsKey = ['social-connections'] as const;

/**
 * Hook to fetch social media connection status
 */
export function useSocialConnections() {
  return useQuery<ConnectionStatus[]>({
    queryKey: socialConnectionsKey,
    queryFn: () => api.getConnections(),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to connect a social platform via OAuth
 * Opens OAuth URL in a popup window and polls for completion
 */
export function useConnectPlatform() {
  const queryClient = useQueryClient();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  // Stop polling when component unmounts
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startPolling = useCallback(() => {
    // Poll every 2 seconds to check if OAuth completed
    pollIntervalRef.current = setInterval(async () => {
      // Check if popup was closed
      if (popupRef.current && popupRef.current.closed) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        // Refresh connections after popup closes
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
      // Open OAuth in popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      popupRef.current = window.open(
        data.auth_url,
        `Connect ${data.platform}`,
        `width=${width},height=${height},left=${left},top=${top},popup=1`,
      );

      // Start polling for completion
      startPolling();
    },
  });
}

/**
 * Hook to disconnect a social platform
 */
export function useDisconnectPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (platform: 'tiktok' | 'instagram') => api.disconnectPlatform(platform),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialConnectionsKey });
    },
  });
}

/**
 * Helper to check if token expires soon (within N days)
 */
export function isTokenExpiringSoon(expiresAt: string | null, daysThreshold: number = 7): boolean {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > 0 && diffDays < daysThreshold;
}

/**
 * Helper to format relative time for token expiry
 */
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
