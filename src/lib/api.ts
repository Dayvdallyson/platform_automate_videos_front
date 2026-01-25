import {
  CreateUserRequest,
  PlanInfo,
  QuotaCheckResponse,
  QuotaError,
  UsageSummary,
  User,
} from '@/types/subscription';
import {
  ConnectionStatus,
  DisconnectResponse,
  MessageResponse,
  OAuthResponse,
  OkResponse,
  ProcessedVideo,
  RawVideo,
  UploadRequest,
  UploadResponse,
} from '@/types/video';

const API_BASE = process.env.BACKEND_FASTAPI_URL || 'http://localhost:8000';

// Custom error class for quota exceeded
export class QuotaExceededError extends Error {
  quotaError: QuotaError;

  constructor(quotaError: QuotaError) {
    super(quotaError.error);
    this.name = 'QuotaExceededError';
    this.quotaError = quotaError;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ==================== VIDEO METHODS ====================

  async createVideo(
    url: string,
    userId?: number,
    videoDurationMinutes?: number,
  ): Promise<RawVideo> {
    const params = new URLSearchParams({ url });
    if (userId) params.append('user_id', userId.toString());
    if (videoDurationMinutes)
      params.append('video_duration_minutes', videoDurationMinutes.toString());

    const res = await fetch(`${this.baseUrl}/api/videos/?${params.toString()}`, {
      method: 'POST',
    });

    if (res.status === 403) {
      const quotaError = (await res.json()) as QuotaError;
      throw new QuotaExceededError(quotaError);
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to create video');
    }
    return res.json();
  }

  async listVideos(userId?: number): Promise<RawVideo[]> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());

    const res = await fetch(`${this.baseUrl}/api/videos/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  }

  async deleteVideo(videoId: number): Promise<OkResponse> {
    const res = await fetch(`${this.baseUrl}/api/videos/${videoId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
  }

  async generateCuts(
    videoId: number,
    style: string = 'viral',
    userId?: number,
    estimatedCuts?: number,
  ): Promise<MessageResponse> {
    const params = new URLSearchParams({ style });
    if (userId) params.append('user_id', userId.toString());
    if (estimatedCuts) params.append('estimated_cuts', estimatedCuts.toString());

    const res = await fetch(
      `${this.baseUrl}/api/processed/${videoId}/generate?${params.toString()}`,
      {
        method: 'POST',
      },
    );

    if (res.status === 403) {
      const quotaError = (await res.json()) as QuotaError;
      throw new QuotaExceededError(quotaError);
    }

    if (!res.ok) throw new Error('Failed to start processing');
    return res.json();
  }

  async listProcessedVideos(userId?: number): Promise<ProcessedVideo[]> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId.toString());

    const res = await fetch(`${this.baseUrl}/api/processed/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch processed videos');
    return res.json();
  }

  // ==================== UPLOAD METHODS ====================

  async uploadToPlatform(request: UploadRequest): Promise<UploadResponse> {
    const res = await fetch(`${this.baseUrl}/api/uploads/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Upload failed');
    }
    return res.json();
  }

  async getConnections(): Promise<ConnectionStatus[]> {
    const res = await fetch(`${this.baseUrl}/api/uploads/connections`);
    if (!res.ok) throw new Error('Failed to fetch connections');
    return res.json();
  }

  async getConnectUrl(platform: 'tiktok' | 'instagram'): Promise<OAuthResponse> {
    const res = await fetch(`${this.baseUrl}/api/uploads/connect/${platform}`);
    if (res.status === 503) {
      throw new Error(`${platform} credentials not configured on server`);
    }
    if (!res.ok) throw new Error('Failed to get auth URL');
    return res.json();
  }

  async disconnectPlatform(platform: 'tiktok' | 'instagram'): Promise<DisconnectResponse> {
    const res = await fetch(`${this.baseUrl}/api/uploads/disconnect/${platform}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to disconnect');
    return res.json();
  }

  getPreviewUrl(previewPath: string): string {
    if (previewPath.startsWith('http')) return previewPath;
    return `${this.baseUrl}${previewPath}`;
  }

  // ==================== SUBSCRIPTION METHODS ====================

  async getPlans(): Promise<PlanInfo[]> {
    const res = await fetch(`${this.baseUrl}/api/subscription/plans`);
    if (!res.ok) throw new Error('Failed to fetch plans');
    const data = await res.json();
    // API returns {plans: [...], current_plan: ...} - extract the array
    return data.plans || data;
  }

  async getUsage(userId: number): Promise<UsageSummary> {
    const res = await fetch(`${this.baseUrl}/api/subscription/usage?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch usage');
    return res.json();
  }

  async getCurrentPlan(userId: number): Promise<PlanInfo> {
    const res = await fetch(`${this.baseUrl}/api/subscription/current?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch current plan');
    return res.json();
  }

  async upgradePlan(userId: number, newPlan: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/api/subscription/upgrade?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_plan: newPlan }),
    });
    if (!res.ok) throw new Error('Failed to upgrade plan');
    return res.json();
  }

  async canProcessVideo(userId: number, videoDurationMinutes: number): Promise<QuotaCheckResponse> {
    const res = await fetch(
      `${this.baseUrl}/api/subscription/can-process?user_id=${userId}&video_duration_minutes=${videoDurationMinutes}`,
    );
    if (!res.ok) throw new Error('Failed to check quota');
    return res.json();
  }

  async canGenerateCuts(userId: number, cutsRequested: number): Promise<QuotaCheckResponse> {
    const res = await fetch(
      `${this.baseUrl}/api/subscription/can-generate?user_id=${userId}&cuts_requested=${cutsRequested}`,
    );
    if (!res.ok) throw new Error('Failed to check quota');
    return res.json();
  }

  // ==================== USER METHODS ====================

  async createUser(data: CreateUserRequest): Promise<User> {
    const res = await fetch(`${this.baseUrl}/api/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to create user');
    }
    return res.json();
  }

  async getUserById(id: number): Promise<User> {
    const res = await fetch(`${this.baseUrl}/api/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }

  async getUserByEmail(email: string): Promise<User> {
    const res = await fetch(`${this.baseUrl}/api/users/by-email/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }
}

export const api = new ApiClient(API_BASE);
export { ApiClient };
