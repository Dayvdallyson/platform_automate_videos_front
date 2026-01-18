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
import { useSocialConnections } from '@/hooks/useSocialConnections';
import { useProcessedVideos, useUploadToPlatform } from '@/hooks/useVideos';
import { api } from '@/lib/api';
import { ConnectionStatus, ProcessedVideo } from '@/types/video';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Play,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { toast } from 'sonner';

const CAPTION_LIMITS = {
  tiktok: 150,
  instagram: 2200,
};

interface ProcessedVideoCardProps {
  video: ProcessedVideo;
  connections: ConnectionStatus[];
}

function ProcessedVideoCard({ video, connections }: ProcessedVideoCardProps) {
  const [caption, setCaption] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadingPlatform, setUploadingPlatform] = useState<'tiktok' | 'instagram' | null>(null);
  const uploadMutation = useUploadToPlatform();

  const previewUrl = video.preview_url ? api.getPreviewUrl(video.preview_url) : null;

  const tiktokConnection = connections.find((c) => c.platform === 'tiktok');
  const instagramConnection = connections.find((c) => c.platform === 'instagram');
  const isTiktokConnected = tiktokConnection?.connected ?? false;
  const isInstagramConnected = instagramConnection?.connected ?? false;
  const hasAnyConnection = isTiktokConnected || isInstagramConnected;

  const handleUpload = async (platform: 'tiktok' | 'instagram') => {
    if (!caption.trim()) {
      toast.error('Por favor, digite uma legenda');
      return;
    }

    if (caption.length > CAPTION_LIMITS[platform]) {
      toast.error(
        `Legenda muito longa para ${platform === 'tiktok' ? 'TikTok' : 'Instagram'} (máx ${CAPTION_LIMITS[platform]} caracteres)`,
      );
      return;
    }

    if (platform === 'instagram' && !previewUrl) {
      toast.error('Preview do vídeo necessário para upload no Instagram');
      return;
    }

    setUploadingPlatform(platform);
    try {
      const result = await uploadMutation.mutateAsync({
        video_id: video.id,
        platform,
        caption: caption.trim(),
      });

      if (platform === 'instagram' && result.permalink) {
        toast.success(
          <div className="flex items-center gap-2">
            <span>Enviado para Instagram!</span>
            <a
              href={result.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline"
            >
              Ver <ExternalLink className="h-3 w-3" />
            </a>
          </div>,
        );
      } else {
        toast.success(
          `Enviado com sucesso para ${platform === 'tiktok' ? 'TikTok' : 'Instagram'}!`,
        );
      }

      setDialogOpen(false);
      setCaption('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Falha ao enviar para ${platform}`);
    } finally {
      setUploadingPlatform(null);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLimit = Math.min(CAPTION_LIMITS.tiktok, CAPTION_LIMITS.instagram);
  const isOverLimit = caption.length > currentLimit;

  return (
    <Card className="group overflow-hidden glass-card card-gradient-border rounded-xl border-0 hover:shadow-xl hover:shadow-secondary/10 transition-all duration-300">
      <div className="relative aspect-9/16 max-h-[300px] bg-background/50 rounded-t-xl overflow-hidden">
        {previewUrl ? (
          <video
            src={previewUrl}
            className="w-full h-full object-contain"
            controls
            preload="metadata"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

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
                Enviado
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Pronto
              </>
            )}
          </Badge>
        </div>

        {/* Upload Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/30 transition-all rounded-lg h-10"
              disabled={!hasAnyConnection}
            >
              <Upload className="mr-2 h-4 w-4" />
              {hasAnyConnection ? 'Enviar para Plataforma' : 'Conecte sua Conta'}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-0 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Enviar para Redes Sociais</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Caption Input with Character Count */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Digite uma legenda..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={CAPTION_LIMITS.instagram}
                    className="bg-muted/30 border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 pr-16"
                  />
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                      isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {caption.length}/{currentLimit}
                  </span>
                </div>
                {isOverLimit && (
                  <p className="text-xs text-amber-500">
                    Legenda excede limite do TikTok ({CAPTION_LIMITS.tiktok} caracteres)
                  </p>
                )}
              </div>

              {/* Platform Buttons */}
              <div className="flex gap-3">
                {/* TikTok Button */}
                <Button
                  onClick={() => handleUpload('tiktok')}
                  disabled={!isTiktokConnected || uploadMutation.isPending}
                  className={`flex-1 h-10 rounded-lg font-medium ${
                    isTiktokConnected
                      ? 'bg-black hover:bg-zinc-800 text-white'
                      : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {uploadingPlatform === 'tiktok' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <FaTiktok className="h-4 w-4 mr-2" />
                      TikTok
                    </>
                  )}
                </Button>

                {/* Instagram Button */}
                <Button
                  onClick={() => handleUpload('instagram')}
                  disabled={!isInstagramConnected || uploadMutation.isPending || !previewUrl}
                  className={`flex-1 h-10 rounded-lg font-medium ${
                    isInstagramConnected && previewUrl
                      ? 'bg-linear-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white'
                      : 'bg-muted/30 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {uploadingPlatform === 'instagram' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <FaInstagram className="h-4 w-4 mr-2" />
                      Instagram
                    </>
                  )}
                </Button>
              </div>

              {/* Helper text */}
              {!hasAnyConnection && (
                <p className="text-xs text-center text-muted-foreground">
                  Conecte suas contas no painel acima para enviar
                </p>
              )}
              {!previewUrl && isInstagramConnected && (
                <p className="text-xs text-center text-amber-500">
                  Upload no Instagram requer preview do vídeo (indisponível para este corte)
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export function ProcessedVideoList() {
  const { data: videos, isLoading: videosLoading, error } = useProcessedVideos();
  const { data: connections, isLoading: connectionsLoading } = useSocialConnections();

  const isLoading = videosLoading || connectionsLoading;

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
          <p className="text-destructive font-medium">Falha ao carregar vídeos processados</p>
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
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum corte gerado ainda</h3>
          <p className="text-sm text-muted-foreground">
            Clique em Gerar Cortes em um vídeo para criar vídeos verticais
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
          Cortes Processados
        </h2>
        <span className="text-sm text-muted-foreground">{videos.length} cortes</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <ProcessedVideoCard key={video.id} video={video} connections={connections ?? []} />
        ))}
      </div>
    </div>
  );
}
