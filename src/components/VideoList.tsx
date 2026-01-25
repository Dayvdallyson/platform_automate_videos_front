'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserId } from '@/hooks/useSubscription';
import { useVideos } from '@/hooks/useVideos';
import { AlertCircle, Video } from 'lucide-react';
import { VideoCard } from './VideoCard';

export function VideoList() {
  const userId = useUserId();

  const { data: videos, isLoading, error } = useVideos(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card rounded-xl border-0">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl bg-muted/50" />
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-4 w-3/4 bg-muted/50" />
                  <Skeleton className="h-3 w-1/2 bg-muted/50" />
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
      <Card className="glass-card rounded-xl border-destructive/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium">Falha ao carregar vídeos</p>
          <p className="text-sm text-muted-foreground mt-2">
            Verifique se o backend está rodando em localhost:8000
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!videos?.length) {
    return (
      <Card className="glass-card card-gradient-border rounded-xl border-0 border-dashed">
        <CardContent className="p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-5">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum vídeo ainda</h3>
          <p className="text-sm text-muted-foreground">
            Cole um link do YouTube acima para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Seus Vídeos
        </h2>
        <span className="text-sm text-muted-foreground">{videos.length} vídeos</span>
      </div>

      <div className="space-y-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
