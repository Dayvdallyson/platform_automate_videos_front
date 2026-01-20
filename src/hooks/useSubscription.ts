'use client';

import { api } from '@/lib/api';
import { CreateUserRequest, PlanInfo, PlanType, UsageSummary, User } from '@/types/subscription';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const subscriptionQueryKeys = {
  plans: ['subscription', 'plans'] as const,
  usage: (userId: number) => ['subscription', 'usage', userId] as const,
  currentPlan: (userId: number) => ['subscription', 'currentPlan', userId] as const,
  user: (userId: number) => ['user', userId] as const,
};

// ==================== PLANS ====================

export function usePlans() {
  return useQuery<PlanInfo[]>({
    queryKey: subscriptionQueryKeys.plans,
    queryFn: () => api.getPlans(),
    staleTime: 1000 * 60 * 60, // 1 hour - plans don't change often
  });
}

// ==================== USAGE ====================

export function useUsage(userId: number | null) {
  return useQuery<UsageSummary>({
    queryKey: subscriptionQueryKeys.usage(userId!),
    queryFn: () => api.getUsage(userId!),
    enabled: !!userId,
    refetchInterval: 1000 * 30, // Refresh every 30 seconds
  });
}

// ==================== CURRENT PLAN ====================

export function useCurrentPlan(userId: number | null) {
  return useQuery<PlanInfo>({
    queryKey: subscriptionQueryKeys.currentPlan(userId!),
    queryFn: () => api.getCurrentPlan(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ==================== UPGRADE PLAN ====================

export function useUpgradePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newPlan }: { userId: number; newPlan: PlanType }) =>
      api.upgradePlan(userId, newPlan),
    onSuccess: (_, { userId }) => {
      // Invalidate usage and plan queries after upgrade
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.usage(userId) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKeys.currentPlan(userId) });
    },
  });
}

// ==================== QUOTA CHECKS ====================

export function useCanProcessVideo(userId: number | null, videoDurationMinutes: number) {
  return useQuery({
    queryKey: ['subscription', 'canProcess', userId, videoDurationMinutes],
    queryFn: () => api.canProcessVideo(userId!, videoDurationMinutes),
    enabled: !!userId && videoDurationMinutes > 0,
  });
}

export function useCanGenerateCuts(userId: number | null, cutsRequested: number) {
  return useQuery({
    queryKey: ['subscription', 'canGenerate', userId, cutsRequested],
    queryFn: () => api.canGenerateCuts(userId!, cutsRequested),
    enabled: !!userId && cutsRequested > 0,
  });
}

// ==================== USER MANAGEMENT ====================

export function useUser(userId: number | null) {
  return useQuery<User>({
    queryKey: subscriptionQueryKeys.user(userId!),
    queryFn: () => api.getUserById(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => api.createUser(data),
    onSuccess: (user) => {
      queryClient.setQueryData(subscriptionQueryKeys.user(user.id), user);
    },
  });
}

// ==================== USER ID STORAGE ====================

const USER_ID_KEY = 'clipforge_user_id';

export function getStoredUserId(): number | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_ID_KEY);
  return stored ? parseInt(stored, 10) : null;
}

export function setStoredUserId(userId: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_ID_KEY, userId.toString());
}

export function clearStoredUserId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_ID_KEY);
}
