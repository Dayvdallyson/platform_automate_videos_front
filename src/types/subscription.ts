export type PlanType = 'basic' | 'pro' | 'business';
export type PlanPriority = 'normal' | 'medium' | 'high';

export interface UsageSummary {
  plan_type: PlanType;
  plan_name: string;
  videos_processed: number;
  max_videos: number;
  cuts_generated: number;
  max_cuts: number;
  max_video_duration_minutes: number;
  cycle_start: string;
  cycle_end: string;
  days_remaining: number;
  has_watermark: boolean;
  videos_usage_percent: number;
  cuts_usage_percent: number;
}

export interface PlanInfo {
  type: PlanType;
  name: string;
  description: string;
  max_videos_per_month: number;
  max_video_duration_minutes: number;
  max_cuts_per_month: number;
  price_brl: number;
  has_watermark: boolean;
  priority: PlanPriority;
}

export interface QuotaCheckResponse {
  allowed: boolean;
  message?: string;
  current_usage?: number;
  limit?: number;
}

export interface QuotaError {
  error: string;
  error_code: 'VIDEO_LIMIT_EXCEEDED' | 'VIDEO_DURATION_EXCEEDED' | 'CUTS_LIMIT_EXCEEDED';
  current_usage: number;
  limit: number;
  upgrade_options: PlanType[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  plan_type: PlanType;
  created_at: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  plan_type?: PlanType;
}
