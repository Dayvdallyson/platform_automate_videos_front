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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createVideo(url: string): Promise<RawVideo> {
    const res = await fetch(`${this.baseUrl}/api/videos/?url=${encodeURIComponent(url)}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to create video');
    }
    return res.json();
  }

  async listVideos(): Promise<RawVideo[]> {
    const res = await fetch(`${this.baseUrl}/api/videos/`);
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

  async generateCuts(videoId: number): Promise<MessageResponse> {
    const res = await fetch(`${this.baseUrl}/api/processed/${videoId}/generate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to start processing');
    return res.json();
  }

  async listProcessedVideos(): Promise<ProcessedVideo[]> {
    const res = await fetch(`${this.baseUrl}/api/processed/`);
    if (!res.ok) throw new Error('Failed to fetch processed videos');
    return res.json();
  }

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
}

export const api = new ApiClient(API_BASE);
export { ApiClient };
