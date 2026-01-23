'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = process.env.BACKEND_FASTAPI_URL || 'http://localhost:8000';

export interface DownloadProgress {
  percent: number;
  speed: string | null;
  eta: string | null;
  status: 'pending' | 'starting' | 'downloading' | 'done' | 'error';
}

interface UseDownloadProgressOptions {
  onComplete?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: string) => void;
}

/**
 * Hook for tracking download progress via SSE.
 */
export function useDownloadProgress(options: UseDownloadProgressOptions = {}) {
  const [progress, setProgress] = useState<DownloadProgress>({
    percent: 0,
    speed: null,
    eta: null,
    status: 'pending',
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const lastStatusRef = useRef<string>('pending');
  const { onComplete, onError, onStatusChange } = options;

  const stopTracking = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsDownloading(false);
    setJobId(null);
  }, []);

  const startTracking = useCallback(
    (newJobId: string) => {
      // Close any existing connection
      stopTracking();

      setJobId(newJobId);
      setIsDownloading(true);
      setProgress({
        percent: 0,
        speed: null,
        eta: null,
        status: 'starting',
      });

      const url = `${API_BASE}/api/videos/progress/${newJobId}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data: DownloadProgress = JSON.parse(event.data);
          setProgress(data);

          // Notify on status change
          if (data.status !== lastStatusRef.current) {
            lastStatusRef.current = data.status;
            onStatusChange?.(data.status);
          }

          if (data.status === 'done') {
            stopTracking();
            onComplete?.();
          } else if (data.status === 'error') {
            stopTracking();
            onError?.('Download failed');
          }
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        stopTracking();
        onError?.('Connection lost');
      };
    },
    [stopTracking, onComplete, onError, onStatusChange],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    progress,
    isDownloading,
    jobId,
    startTracking,
    stopTracking,
  };
}
