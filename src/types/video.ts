export enum VideoStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  PROCESSING = 'processing',
  DONE = 'done',
  ERROR = 'error',
}

export interface RawVideo {
  id: number;
  url: string;
  title: string | null;
  file_path: string | null;
  status: VideoStatus;
  created_at: string;
  error_message: string | null;
}

export interface ProcessedVideo {
  id: number;
  raw_video_id: number;
  file_path: string;
  preview_url: string | null;
  duration: number | null;
  status: 'ready' | 'uploaded';
  created_at: string;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface Transcription {
  id: number;
  raw_video_id: number;
  full_text: string;
  segments_json: string;
}

export interface UploadRequest {
  video_id: number;
  platform: 'tiktok' | 'instagram';
  caption: string;
}

export interface MessageResponse {
  message: string;
}

export interface OkResponse {
  ok: boolean;
}

export interface ConnectionStatus {
  platform: 'tiktok' | 'instagram';
  connected: boolean;
  account_name: string | null;
  account_id: string | null;
  connected_at: string | null;
  expires_at: string | null;
}

export interface OAuthResponse {
  auth_url: string;
  state: string;
}

export interface DisconnectResponse {
  status: string;
  message: string;
}
export interface UploadResponse {
  status: string;
  platform: string;
  account?: string;
  publish_id?: string;
  media_id?: string;
  permalink?: string;
  message?: string;
}
