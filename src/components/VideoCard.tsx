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
    label: 'Pending',
    color: 'bg-slate-500',
    icon: <Clock className="h-3 w-3" />,
    progress: 0,
  },
  [VideoStatus.DOWNLOADING]: {
    label: 'Downloading',
    color: 'bg-blue-500',
    icon: <Download className="h-3 w-3 animate-bounce" />,
    progress: 25,
  },
  [VideoStatus.PROCESSING]: {
    label: 'Processing',
    color: 'bg-purple-500',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    progress: 60,
  },
  [VideoStatus.DONE]: {
    label: 'Ready',
    color: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3 w-3" />,
    progress: 100,
  },
  [VideoStatus.ERROR]: {
    label: 'Error',
    color: 'bg-red-500',
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
      toast.success('Video deleted');
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const handleGenerate = async () => {
    try {
      await generateCuts.mutateAsync(video.id);
      toast.success('Processing started! This may take a few minutes.');
    } catch (error) {
      toast.error('Failed to start processing');
    }
  };

  return (
    <Card className="group relative overflow-hidden border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 transition-all hover:shadow-xl hover:shadow-purple-500/10">
      {/* Progress bar for active states */}
      {isProcessing && (
        <div className="absolute left-0 top-0 right-0">
          <Progress value={status.progress} className="h-1 rounded-none bg-slate-700" />
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Video Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate mb-1">
              {video.title || 'Untitled Video'}
            </h3>
            <p className="text-xs text-slate-400 truncate mb-3">{video.url}</p>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge className={`${status.color} text-white border-none flex items-center gap-1`}>
                {status.icon}
                {status.label}
              </Badge>
              {video.error_message && (
                <span className="text-xs text-red-400 truncate">{video.error_message}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isReady && (
              <Button
                size="sm"
                onClick={handleGenerate}
                disabled={generateCuts.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {generateCuts.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="mr-1 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleteVideo.isPending}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
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
