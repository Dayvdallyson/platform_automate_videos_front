import {
  MessageResponse,
  OkResponse,
  ProcessedVideo,
  RawVideo,
  UploadRequest,
} from '@/types/video';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ============ Videos API (/api/videos) ============

  /**
   * Create a new video from a URL (triggers background download)
   */
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

  /**
   * List all raw videos
   */
  async listVideos(): Promise<RawVideo[]> {
    const res = await fetch(`${this.baseUrl}/api/videos/`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  }

  /**
   * Delete a video by ID
   */
  async deleteVideo(videoId: number): Promise<OkResponse> {
    const res = await fetch(`${this.baseUrl}/api/videos/${videoId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
  }

  // ============ Processing API (/api/processed) ============

  /**
   * Start generating clips for a video (background task)
   */
  async generateCuts(videoId: number): Promise<MessageResponse> {
    const res = await fetch(`${this.baseUrl}/api/processed/${videoId}/generate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to start processing');
    return res.json();
  }

  /**
   * List all processed videos
   */
  async listProcessedVideos(): Promise<ProcessedVideo[]> {
    const res = await fetch(`${this.baseUrl}/api/processed/`);
    if (!res.ok) throw new Error('Failed to fetch processed videos');
    return res.json();
  }

  // ============ Uploads API (/api/uploads) ============

  /**
   * Upload a processed video to a social platform
   */
  async uploadToPlatform(request: UploadRequest): Promise<{ status: string }> {
    const res = await fetch(`${this.baseUrl}/api/uploads/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  }

  /**
   * Get the static URL for a processed video preview
   */
  getPreviewUrl(previewPath: string): string {
    if (previewPath.startsWith('http')) return previewPath;
    return `${this.baseUrl}${previewPath}`;
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE);

// Export class for testing or custom instances
export { ApiClient };
