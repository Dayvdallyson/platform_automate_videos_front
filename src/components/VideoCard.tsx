'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDownloadTracking } from '@/contexts/DownloadTrackingContext';
import { useDownloadProgress } from '@/hooks/useDownloadProgress';
import { queryKeys, useDeleteVideo, useGenerateCuts } from '@/hooks/useVideos';
import { api } from '@/lib/api';
import { CutStyle, RawVideo, VideoStatus } from '@/types/video';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Sparkles,
  Trash2,
  WifiOff,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const cutStyleOptions: { value: CutStyle; label: string; icon: string }[] = [
  { value: 'viral', label: 'Viral', icon: '🎯' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'educational', label: 'Educacional', icon: '📚' },
  { value: 'humor', label: 'Humor', icon: '😂' },
  { value: 'business', label: 'Negócios', icon: '💼' },
];

const statusConfig: Record<VideoStatus, { label: string; color: string; icon: React.ReactNode }> = {
  [VideoStatus.PENDING]: {
    label: 'Pendente',
    color: 'bg-muted-foreground',
    icon: <Clock className="h-3 w-3" />,
  },
  [VideoStatus.DOWNLOADING]: {
    label: 'Baixando',
    color: 'bg-secondary',
    icon: <Download className="h-3 w-3 animate-bounce" />,
  },
  [VideoStatus.PROCESSING]: {
    label: 'Processando',
    color: 'bg-primary',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  [VideoStatus.DONE]: {
    label: 'Pronto',
    color: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  [VideoStatus.ERROR]: {
    label: 'Erro',
    color: 'bg-destructive',
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

interface VideoCardProps {
  video: RawVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const queryClient = useQueryClient();
  const deleteVideo = useDeleteVideo();
  const generateCuts = useGenerateCuts();
  const { getJobId, removeDownload } = useDownloadTracking();

  const [selectedStyle, setSelectedStyle] = useState<CutStyle>('viral');
  const [connectionLost, setConnectionLost] = useState(false);

  const jobId = getJobId(video.id);
  const isReady = video.status === VideoStatus.DONE;
  const status = statusConfig[video.status];

  const { progress, isDownloading, startTracking, stopTracking } = useDownloadProgress({
    onComplete: () => {
      setConnectionLost(false);
      toast.success('Download concluído!');
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });
    },
    onError: (error) => {
      if (error?.includes('Connection lost')) {
        setConnectionLost(true);
        toast.error('Conexão perdida. Tentando reconectar...', {
          description: 'O download continuará em segundo plano.',
        });
      } else {
        toast.error(error || 'Falha no download');
      }
    },
    onStatusChange: (status) => {
      if (status === 'downloading' && connectionLost) {
        setConnectionLost(false);
        toast.success('Conexão restabelecida!');
      }
    },
    reconnectAttempts: 5,
    reconnectDelay: 3000,
  });

  useEffect(() => {
    if (!jobId) return;

    startTracking(jobId);
  }, [jobId, startTracking]);

  const downloadPercent = useMemo(() => Math.round(progress.percent ?? 0), [progress.percent]);

  const handleDelete = async () => {
    try {
      if (isDownloading) {
        stopTracking();
        removeDownload(video.id);
      }

      await deleteVideo.mutateAsync(video.id);
      toast.success('Vídeo excluído');
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const handleGenerate = async () => {
    try {
      await generateCuts.mutateAsync({
        videoId: video.id,
        style: selectedStyle,
      });
      toast.success('Processamento iniciado! Pode levar alguns minutos.');
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  return (
    <Card className="group relative overflow-hidden glass-card card-gradient-border rounded-xl border-0 transition-all hover:shadow-xl hover:shadow-primary/10">
      <CardContent className="p-5">
        {video.video_url && (
          <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-black/20">
            <video
              src={api.getPreviewUrl(video.video_url)}
              className="h-full w-full object-contain"
              controls
              preload="metadata"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1.5 truncate text-sm font-semibold text-foreground">
              {video.title || 'Vídeo sem título'}
            </h3>

            <p className="mb-3 truncate text-xs text-muted-foreground/70">{video.url}</p>

            {video.status === VideoStatus.DOWNLOADING && isDownloading ? (
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {connectionLost ? (
                      <WifiOff className="h-3.5 w-3.5 animate-pulse text-destructive" />
                    ) : (
                      <Download className="h-3.5 w-3.5 animate-bounce text-secondary" />
                    )}
                    <span className="font-medium text-foreground">
                      {connectionLost ? 'Reconectando...' : 'Baixando vídeo...'}
                    </span>
                  </div>

                  <span className="font-mono font-medium text-muted-foreground">
                    {downloadPercent}%
                  </span>
                </div>

                <Progress value={downloadPercent} className="h-2" />

                {!connectionLost && (progress.speed || progress.eta) && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.speed}</span>
                    <span>{progress.eta && `ETA: ${progress.eta}`}</span>
                  </div>
                )}

                {connectionLost && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>Conexão perdida. Tentando reconectar...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={`${status.color} flex items-center gap-1.5 border-none px-2.5 py-0.5 text-xs text-white`}
                >
                  {status.icon}
                  {status.label}
                </Badge>

                {video.error_message && (
                  <span className="truncate text-xs text-destructive">{video.error_message}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {isReady && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">Estilo:</span>
                  <div className="flex gap-1">
                    {cutStyleOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedStyle(option.value)}
                        disabled={generateCuts.isPending}
                        className={`rounded-md px-2.5 py-1.5 text-xs transition-all
                          ${
                            selectedStyle === option.value
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                              : 'bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                          }`}
                      >
                        <span className="text-sm">{option.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateCuts.isPending}
                  className="h-9 rounded-lg bg-primary px-4 text-primary-foreground shadow-lg shadow-primary/30"
                >
                  {generateCuts.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Gerar Cortes
                    </>
                  )}
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleteVideo.isPending}
              className="h-9 w-9 rounded-lg p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              {deleteVideo.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
