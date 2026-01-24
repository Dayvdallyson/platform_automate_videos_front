import { useCallback, useEffect, useRef, useState } from 'react';

export interface DownloadProgress {
  percent: number;
  speed: string | null;
  eta: string | null;
  status: 'pending' | 'starting' | 'downloading' | 'done' | 'error';
  message?: string;
}

interface UseDownloadProgressOptions {
  onComplete?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: DownloadProgress['status']) => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const INITIAL_PROGRESS: DownloadProgress = {
  percent: 0,
  speed: null,
  eta: null,
  status: 'pending',
};

export function useDownloadProgress(options: UseDownloadProgressOptions = {}) {
  const {
    onComplete,
    onError,
    onStatusChange,
    reconnectAttempts = 3,
    reconnectDelay = 2000,
  } = options;

  const [progress, setProgress] = useState<DownloadProgress>(INITIAL_PROGRESS);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef(0);

  const jobIdRef = useRef<string | null>(null);
  const lastStatusRef = useRef<DownloadProgress['status']>('pending');
  const isActiveRef = useRef(false);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const cleanupSocket = () => {
    wsRef.current?.close();
    wsRef.current = null;
  };

  const stopTracking = useCallback(() => {
    clearReconnectTimer();
    cleanupSocket();

    reconnectCountRef.current = 0;
    isActiveRef.current = false;
    jobIdRef.current = null;
    lastStatusRef.current = 'pending';

    setProgress(INITIAL_PROGRESS);
  }, []);

  const connectWebSocket = useCallback(
    (jobId: string) => {
      const protocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
      const url = `${protocol}://${API_BASE.replace(
        /^https?:\/\//,
        '',
      )}/api/videos/progress/${jobId}`;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectCountRef.current = 0;
        isActiveRef.current = true;
      };

      ws.onmessage = (event) => {
        let data: DownloadProgress;

        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }

        setProgress((prev) =>
          prev.status === data.status && prev.percent === data.percent ? prev : data,
        );

        if (data.status !== lastStatusRef.current) {
          lastStatusRef.current = data.status;
          onStatusChange?.(data.status);
        }

        if (data.status === 'done') {
          stopTracking();
          onComplete?.();
        }

        if (data.status === 'error') {
          stopTracking();
          onError?.(data.message ?? 'Download failed');
        }
      };

      // Do NOT rely on onerror for logic — browsers hide details
      ws.onerror = () => {
        // intentionally empty
      };

      ws.onclose = (event) => {
        if (
          event.code === 1000 ||
          !isActiveRef.current ||
          reconnectCountRef.current >= reconnectAttempts
        ) {
          if (reconnectCountRef.current >= reconnectAttempts) {
            onError?.('Connection lost. Maximum reconnection attempts reached.');
          }
          stopTracking();
          return;
        }

        reconnectCountRef.current += 1;

        reconnectTimerRef.current = setTimeout(() => {
          if (jobIdRef.current) {
            connectWebSocket(jobIdRef.current);
          }
        }, reconnectDelay);
      };
    },
    [onComplete, onError, onStatusChange, reconnectAttempts, reconnectDelay, stopTracking],
  );

  const startTracking = useCallback(
    (jobId: string) => {
      if (jobIdRef.current === jobId && isActiveRef.current) {
        return;
      }

      stopTracking();

      jobIdRef.current = jobId;
      lastStatusRef.current = 'starting';

      setProgress({
        ...INITIAL_PROGRESS,
        status: 'starting',
      });

      connectWebSocket(jobId);
    },
    [connectWebSocket, stopTracking],
  );

  useEffect(() => {
    return () => {
      clearReconnectTimer();
      cleanupSocket();
    };
  }, []);

  return {
    progress,
    startTracking,
    stopTracking,
    isDownloading: isActiveRef.current,
    jobId: jobIdRef.current,
  };
}
