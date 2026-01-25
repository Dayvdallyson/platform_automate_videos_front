'use client';

import { api } from '@/lib/api';
import { ProcessedVideo, RawVideo, UploadRequest } from '@/types/video';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const queryKeys = {
  videos: ['videos'] as const,
  processedVideos: ['processedVideos'] as const,
};

export function useVideos(userId?: number | null) {
  return useQuery<RawVideo[]>({
    queryKey: userId ? [...queryKeys.videos, userId] : queryKeys.videos,
    queryFn: () => api.listVideos(userId ?? undefined),
    // enabled: !!userId,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, userId }: { url: string; userId?: number }) => api.createVideo(url, userId),
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

export function useProcessedVideos(userId?: number | null) {
  return useQuery<ProcessedVideo[]>({
    queryKey: userId ? [...queryKeys.processedVideos, userId] : queryKeys.processedVideos,
    queryFn: () => api.listProcessedVideos(userId ?? undefined),
    enabled: !!userId,
  });
}

export function useGenerateCuts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, style, userId }: { videoId: number; style: string; userId?: number }) =>
      api.generateCuts(videoId, style, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });
      queryClient.invalidateQueries({ queryKey: queryKeys.processedVideos });
    },
  });
}

export function useUploadToPlatform() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UploadRequest) => api.uploadToPlatform(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.processedVideos });
    },
  });
}
