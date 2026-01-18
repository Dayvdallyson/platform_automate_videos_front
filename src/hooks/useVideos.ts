'use client';

import { api } from '@/lib/api';
import { ProcessedVideo, RawVideo, UploadRequest } from '@/types/video';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for cache management
export const queryKeys = {
  videos: ['videos'] as const,
  processedVideos: ['processedVideos'] as const,
};

// ============ Videos Hooks ============

export function useVideos() {
  return useQuery<RawVideo[]>({
    queryKey: queryKeys.videos,
    queryFn: () => api.listVideos(),
    // refetchInterval: 5000, // Poll every 5s to update statuses
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => api.createVideo(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => api.deleteVideo(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });
    },
  });
}

// ============ Processing Hooks ============

export function useProcessedVideos() {
  return useQuery<ProcessedVideo[]>({
    queryKey: queryKeys.processedVideos,
    queryFn: () => api.listProcessedVideos(),
    // refetchInterval: 5000, // Poll every 5s
  });
}

export function useGenerateCuts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => api.generateCuts(videoId),
    onSuccess: () => {
      // Invalidate both queries as processing affects both
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });
      queryClient.invalidateQueries({ queryKey: queryKeys.processedVideos });
    },
  });
}

// ============ Upload Hooks ============

export function useUploadToPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UploadRequest) => api.uploadToPlatform(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.processedVideos });
    },
  });
}
