'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useProcessedVideos, useUploadToPlatform } from '@/hooks/useVideos';
import { api } from '@/lib/api';
import { ProcessedVideo } from '@/types/video';
import { AlertCircle, CheckCircle2, Clock, Loader2, Play, Sparkles, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProcessedVideoCardProps {
  video: ProcessedVideo;
}

function ProcessedVideoCard({ video }: ProcessedVideoCardProps) {
  const [caption, setCaption] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const uploadMutation = useUploadToPlatform();

  const previewUrl = video.preview_url ? api.getPreviewUrl(video.preview_url) : null;

  const handleUpload = async (platform: 'tiktok' | 'instagram') => {
    if (!caption.trim()) {
      toast.error('Please enter a caption');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        video_id: video.id,
        platform,
        caption: caption.trim(),
      });
      toast.success(`Uploaded to ${platform}!`);
      setDialogOpen(false);
      setCaption('');
    } catch (error) {
      toast.error(`Failed to upload to ${platform}`);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="group overflow-hidden border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 hover:shadow-xl hover:shadow-pink-500/10 transition-all">
      {/* Video Preview */}
      <div className="relative aspect-[9/16] max-h-[300px] bg-slate-950">
        {previewUrl ? (
          <video
            src={previewUrl}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-12 w-12 text-slate-600" />
          </div>
        )}

        {/* Duration Badge */}
        {video.duration && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-none">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            className={`${
              video.status === 'uploaded' ? 'bg-emerald-500' : 'bg-purple-500'
            } text-white border-none`}
          >
            {video.status === 'uploaded' ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Uploaded
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Ready
              </>
            )}
          </Badge>
        </div>

        {/* Upload Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload to Platform
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Upload to Social Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpload('tiktok')}
                  disabled={uploadMutation.isPending}
                  className="flex-1 bg-black hover:bg-gray-900 text-white"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'TikTok'
                  )}
                </Button>
                <Button
                  onClick={() => handleUpload('instagram')}
                  disabled={uploadMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Instagram'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function ProcessedVideoList() {
  const { data: videos, isLoading, error } = useProcessedVideos();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-800 bg-slate-900/50">
            <Skeleton className="aspect-[9/16] max-h-[300px] bg-slate-700" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-20 bg-slate-700" />
              <Skeleton className="h-10 w-full bg-slate-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">Failed to load processed videos</p>
        </CardContent>
      </Card>
    );
  }

  if (!videos?.length) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 border-dashed">
        <CardContent className="p-12 text-center">
          <Sparkles className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">No processed videos yet</h3>
          <p className="text-sm text-slate-500">
            Click "Generate" on a video to create vertical clips
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-pink-400" />
          Processed Clips
        </h2>
        <span className="text-sm text-slate-400">{videos.length} clips</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <ProcessedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
