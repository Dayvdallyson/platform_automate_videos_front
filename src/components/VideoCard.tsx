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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const cutStyleOptions: { value: CutStyle; label: string; icon: string }[] = [
  { value: 'viral', label: 'Viral', icon: '🎯' },
  { value: 'podcast', label: 'Podcast', icon: '🎙️' },
  { value: 'educational', label: 'Educacional', icon: '📚' },
  { value: 'humor', label: 'Humor', icon: '😂' },
  { value: 'business', label: 'Negócios', icon: '💼' },
];

const statusConfig: Record<
  VideoStatus,
  { label: string; color: string; icon: React.ReactNode; progress: number }
> = {
  [VideoStatus.PENDING]: {
    label: 'Pendente',
    color: 'bg-muted-foreground',
    icon: <Clock className="h-3 w-3" />,
    progress: 0,
  },
  [VideoStatus.DOWNLOADING]: {
    label: 'Baixando',
    color: 'bg-secondary',
    icon: <Download className="h-3 w-3 animate-bounce" />,
    progress: 25,
  },
  [VideoStatus.PROCESSING]: {
    label: 'Processando',
    color: 'bg-primary',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    progress: 60,
  },
  [VideoStatus.DONE]: {
    label: 'Pronto',
    color: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3 w-3" />,
    progress: 100,
  },
  [VideoStatus.ERROR]: {
    label: 'Erro',
    color: 'bg-destructive',
    icon: <AlertCircle className="h-3 w-3" />,
    progress: 0,
  },
};

interface VideoCardProps {
  video: RawVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const deleteVideo = useDeleteVideo();
  const generateCuts = useGenerateCuts();
  const queryClient = useQueryClient();
  const { getJobId, removeDownload } = useDownloadTracking();
  const [selectedStyle, setSelectedStyle] = useState<CutStyle>('viral');

  const status = statusConfig[video.status];
  const isReady = video.status === VideoStatus.DONE;
  const isDownloading = video.status === VideoStatus.DOWNLOADING;

  const jobId = getJobId(video.id);

  const {
    progress,
    isDownloading: isTrackingProgress,
    startTracking,
  } = useDownloadProgress({
    onComplete: () => {
      removeDownload(video.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });
    },
    onStatusChange: (status) => {
      if (status !== VideoStatus.DONE) {
        queryClient.invalidateQueries({ queryKey: queryKeys.videos });
      }
    },
  });

  useEffect(() => {
    if (jobId && isDownloading && !isTrackingProgress) {
      startTracking(jobId);
    }
  }, [jobId, isDownloading, isTrackingProgress, startTracking, video.id]);

  const progressValue = isDownloading && isTrackingProgress ? progress.percent : 100;

  const statusLabel =
    isDownloading && isTrackingProgress && progress.percent > 0
      ? `Baixando ${Math.round(progress.percent)}%`
      : status.label;

  const handleDelete = async () => {
    try {
      await deleteVideo.mutateAsync(video.id);
      toast.success('Vídeo excluído');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const handleGenerate = async () => {
    try {
      await generateCuts.mutateAsync({ videoId: video.id, style: selectedStyle });
      toast.success('Processamento iniciado! Pode levar alguns minutos.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Card className="group relative overflow-hidden glass-card card-gradient-border rounded-xl border-0 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
      <CardContent className="p-5">
        {video.video_url && (
          <div className="mb-4 rounded-lg overflow-hidden bg-black/20 aspect-video">
            <video
              src={api.getPreviewUrl(video.video_url)}
              className="w-full h-full object-contain"
              controls
              preload="metadata"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1.5 text-sm">
              {video.title || 'Vídeo sem título'}
            </h3>
            <p className="text-xs text-muted-foreground/70 truncate mb-3">{video.url}</p>

            {isDownloading && (
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Download className="h-3.5 w-3.5 animate-bounce text-secondary" />
                    <span className="text-foreground font-medium">
                      {isTrackingProgress && progress.percent > 0
                        ? 'Baixando vídeo...'
                        : 'Iniciando download...'}
                    </span>
                  </div>
                  <span className="text-muted-foreground font-mono font-medium">
                    {Math.round(progressValue)}%
                  </span>
                </div>
                <Progress value={progressValue} className="h-2" />
                {isTrackingProgress && (progress.speed || progress.eta) && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.speed || ''}</span>
                    <span>{progress.eta ? `ETA: ${progress.eta}` : ''}</span>
                  </div>
                )}
              </div>
            )}

            {!isDownloading && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={`${status.color} text-white border-none flex items-center gap-1.5 text-xs px-2.5 py-0.5`}
                >
                  {status.icon}
                  {statusLabel}
                </Badge>
                {video.error_message && (
                  <span className="text-xs text-destructive truncate">{video.error_message}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isReady && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Estilo:</span>
                  <div className="flex gap-1">
                    {cutStyleOptions.map((option) => (
                      <div key={option.value} className="relative group/tooltip">
                        <button
                          onClick={() => setSelectedStyle(option.value)}
                          disabled={generateCuts.isPending}
                          className={`text-xs px-2.5 py-1.5 rounded-md transition-all cursor-pointer
                            ${
                              selectedStyle === option.value
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                : 'bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <span className="text-sm">{option.icon}</span>
                        </button>
                        <div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
                          bg-primary text-primary-foreground text-xs font-medium rounded-lg
                          opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible
                          transition-all duration-200 whitespace-nowrap shadow-lg shadow-primary/30 z-50
                          pointer-events-none"
                        >
                          {option.label}
                          <div
                            className="absolute top-full left-1/2 -translate-x-1/2
                            border-4 border-transparent border-t-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generateCuts.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all rounded-lg h-9 px-4"
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
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-9 w-9 p-0"
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
