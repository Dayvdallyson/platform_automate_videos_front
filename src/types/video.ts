// Video status enum matching backend VideoStatus
export enum VideoStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  PROCESSING = 'processing',
  DONE = 'done',
  ERROR = 'error',
}

// RawVideo model matching backend RawVideo SQLModel
export interface RawVideo {
  id: number;
  url: string;
  title: string | null;
  file_path: string | null;
  status: VideoStatus;
  created_at: string; // ISO datetime string
  error_message: string | null;
}

// ProcessedVideo model matching backend ProcessedVideo SQLModel
export interface ProcessedVideo {
  id: number;
  raw_video_id: number;
  file_path: string;
  preview_url: string | null;
  duration: number | null;
  status: 'ready' | 'uploaded';
  created_at: string; // ISO datetime string
}

// TranscriptionSegment for parsed segments
export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

// Transcription model matching backend Transcription SQLModel
export interface Transcription {
  id: number;
  raw_video_id: number;
  full_text: string;
  segments_json: string; // JSON string of TranscriptionSegment[]
}

// Upload request for social platforms
export interface UploadRequest {
  video_id: number;
  platform: 'tiktok' | 'instagram';
  caption: string;
}

// API response types
export interface MessageResponse {
  message: string;
}

export interface OkResponse {
  ok: boolean;
}
