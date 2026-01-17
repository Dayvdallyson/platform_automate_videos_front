'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVideos } from '@/hooks/useVideos';
import { AlertCircle, Video } from 'lucide-react';
import { VideoCard } from './VideoCard';

export function VideoList() {
  const { data: videos, isLoading, error } = useVideos();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-800 bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-slate-700" />
                  <Skeleton className="h-3 w-1/2 bg-slate-700" />
                </div>
              </div>
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
          <p className="text-red-400">Failed to load videos</p>
          <p className="text-sm text-slate-500 mt-1">
            Make sure the backend is running on localhost:8000
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!videos?.length) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 border-dashed">
        <CardContent className="p-12 text-center">
          <Video className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">No videos yet</h3>
          <p className="text-sm text-slate-500">Add a YouTube URL above to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Video className="h-5 w-5 text-purple-400" />
          Your Videos
        </h2>
        <span className="text-sm text-slate-400">{videos.length} videos</span>
      </div>

      <div className="space-y-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
