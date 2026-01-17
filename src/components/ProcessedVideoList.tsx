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
    } catch {
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
    <Card className="group overflow-hidden glass-card card-gradient-border rounded-xl border-0 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300">
      {/* Video Preview */}
      <div className="relative aspect-9/16 max-h-[300px] bg-background/50 rounded-t-xl overflow-hidden">
        {previewUrl ? (
          <video
            src={previewUrl}
            className="w-full h-full object-cover"
            controls
            preload="metadata"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Duration Badge */}
        {video.duration && (
          <Badge className="absolute bottom-2 right-2 bg-background/70 text-foreground border-none">
            <Clock className="h-3 w-3 mr-1" />
            {formatDuration(video.duration)}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 pt-4">
        {/* Status */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            className={`${
              video.status === 'uploaded' ? 'bg-emerald-500' : 'bg-primary'
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
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/30 transition-all rounded-lg h-10">
              <Upload className="mr-2 h-4 w-4" />
              Upload to Platform
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-0 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Upload to Social Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpload('tiktok')}
                  disabled={uploadMutation.isPending}
                  className="flex-1 bg-background/50 hover:bg-accent text-foreground border border-border/50 rounded-lg h-10"
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
                  className="flex-1 bg-linear-gradient-to-r from-primary via-secondary to-[#FF6B35] hover:opacity-90 text-white rounded-lg h-10"
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

  console.log('xxxxxxxxxxxxxxxxx this is all videos', videos);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card rounded-xl border-0">
            <Skeleton className="aspect-9/16 max-h-[300px] bg-muted/30 rounded-t-xl" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-20 bg-muted/50" />
              <Skeleton className="h-10 w-full bg-muted/50" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card rounded-xl border-destructive/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium">Failed to load processed videos</p>
        </CardContent>
      </Card>
    );
  }

  if (!videos?.length) {
    return (
      <Card className="glass-card card-gradient-border rounded-xl border-0">
        <CardContent className="p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-linear-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No processed videos yet</h3>
          <p className="text-sm text-muted-foreground">
            Click Generate on a video to create vertical clips
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" />
          Processed Clips
        </h2>
        <span className="text-sm text-muted-foreground">{videos.length} clips</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <ProcessedVideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
