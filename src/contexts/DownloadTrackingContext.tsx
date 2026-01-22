'use client';

import { ReactNode, createContext, useCallback, useContext, useState } from 'react';

interface ActiveDownload {
  videoId: number;
  jobId: string;
}

interface DownloadTrackingContextType {
  activeDownloads: ActiveDownload[];
  addDownload: (videoId: number, jobId: string) => void;
  removeDownload: (videoId: number) => void;
  getJobId: (videoId: number) => string | undefined;
}

const DownloadTrackingContext = createContext<DownloadTrackingContextType | null>(null);

export function DownloadTrackingProvider({ children }: { children: ReactNode }) {
  const [activeDownloads, setActiveDownloads] = useState<ActiveDownload[]>([]);

  const addDownload = useCallback((videoId: number, jobId: string) => {
    setActiveDownloads((prev) => {
      // Remove any existing entry for this video
      const filtered = prev.filter((d) => d.videoId !== videoId);
      return [...filtered, { videoId, jobId }];
    });
  }, []);

  const removeDownload = useCallback((videoId: number) => {
    setActiveDownloads((prev) => prev.filter((d) => d.videoId !== videoId));
  }, []);

  const getJobId = useCallback(
    (videoId: number) => {
      return activeDownloads.find((d) => d.videoId === videoId)?.jobId;
    },
    [activeDownloads],
  );

  return (
    <DownloadTrackingContext.Provider
      value={{ activeDownloads, addDownload, removeDownload, getJobId }}
    >
      {children}
    </DownloadTrackingContext.Provider>
  );
}

export function useDownloadTracking() {
  const context = useContext(DownloadTrackingContext);
  if (!context) {
    throw new Error('useDownloadTracking must be used within a DownloadTrackingProvider');
  }
  return context;
}
