'use client';

import { api } from '@/lib/api';
import { ProcessedVideo, RawVideo, UploadRequest } from '@/types/video';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const queryKeys = {
  videos: ['videos'] as const,
  processedVideos: ['processedVideos'] as const,
};

export function useVideos() {
  return useQuery<RawVideo[]>({
    queryKey: queryKeys.videos,
    queryFn: () => api.listVideos(),
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

export function useProcessedVideos() {
  return useQuery<ProcessedVideo[]>({
    queryKey: queryKeys.processedVideos,
    queryFn: () => api.listProcessedVideos(),
  });
}

export function useGenerateCuts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: number) => api.generateCuts(videoId),
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
