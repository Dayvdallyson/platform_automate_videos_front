'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDeleteVideo, useGenerateCuts } from '@/hooks/useVideos';
import { RawVideo, VideoStatus } from '@/types/video';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

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

  const status = statusConfig[video.status];
  const isReady = video.status === VideoStatus.DONE;
  const isProcessing =
    video.status === VideoStatus.DOWNLOADING || video.status === VideoStatus.PROCESSING;

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
      await generateCuts.mutateAsync(video.id);
      toast.success('Processamento iniciado! Pode levar alguns minutos.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <Card className="group relative overflow-hidden glass-card card-gradient-border rounded-xl border-0 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
      {isProcessing && (
        <div className="absolute left-0 top-0 right-0 z-10">
          <Progress value={status.progress} className="h-1 rounded-none bg-muted" />
        </div>
      )}

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1.5 text-sm">
              {video.title || 'Vídeo sem título'}
            </h3>
            <p className="text-xs text-muted-foreground/70 truncate mb-3">{video.url}</p>

            <div className="flex items-center gap-2">
              <Badge
                className={`${status.color} text-white border-none flex items-center gap-1.5 text-xs px-2.5 py-0.5`}
              >
                {status.icon}
                {status.label}
              </Badge>
              {video.error_message && (
                <span className="text-xs text-destructive truncate">{video.error_message}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isReady && (
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
