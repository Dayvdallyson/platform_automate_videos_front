'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useDownloadTracking } from '@/contexts/DownloadTrackingContext';
import { useDownloadProgress } from '@/hooks/useDownloadProgress';
import { queryKeys, useCreateVideo } from '@/hooks/useVideos';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Link as LinkIcon,
  Loader2,
  Lock,
  Plus,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddVideoFormProps {
  disabled?: boolean;
}

export function AddVideoForm({ disabled = false }: AddVideoFormProps) {
  const [url, setUrl] = useState('');
  const [connectionLost, setConnectionLost] = useState(false);
  const createVideo = useCreateVideo();
  const queryClient = useQueryClient();
  const { addDownload } = useDownloadTracking();

  const { progress, isDownloading, startTracking, stopTracking } = useDownloadProgress({
    onComplete: () => {
      toast.success('Download concluído!');
      setConnectionLost(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.videos });
    },
    onError: (error) => {
      if (error.includes('Connection lost') || error.includes('reconnection')) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) {
      toast.error('Você precisa de uma assinatura ativa para usar esta funcionalidade');
      return;
    }
    if (!url.trim()) {
      toast.error('Por favor, cole o link do YouTube');
      return;
    }

    try {
      const video = await createVideo.mutateAsync({ url: url.trim() });

      if (video.job_id) {
        addDownload(video.id, video.job_id);
        startTracking(video.job_id);
        toast.success('Download iniciado!');
      } else {
        toast.success('Vídeo adicionado! Download iniciado em segundo plano.');
      }

      setUrl('');
      setConnectionLost(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao adicionar vídeo');
    }
  };

  const handleCancel = () => {
    stopTracking();
    setConnectionLost(false);
    toast.info('Download cancelado');
  };

  const isProcessing = createVideo.isPending || isDownloading;
  const downloadPercent = Math.round(progress.percent ?? 0);

  return (
    <Card className="glass-card card-gradient-border rounded-2xl border-0 py-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`h-10 w-10 rounded-xl bg-linear-gradient-to-br ${disabled ? 'from-muted to-muted-foreground/50' : 'from-primary to-secondary'} flex items-center justify-center shadow-lg ${disabled ? 'shadow-muted/30' : 'shadow-primary/30'}`}
          >
            {disabled ? (
              <Lock className="h-5 w-5 text-white" />
            ) : (
              <Plus className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Criar Cortes Automaticamente</h3>
            <p className="text-xs text-muted-foreground">
              {disabled
                ? 'Assine um plano para desbloquear esta funcionalidade'
                : 'Cole o link do YouTube e receba vários cortes prontos para viralizar'}
            </p>
          </div>
        </div>

        {isDownloading && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {connectionLost ? (
                  <WifiOff className="h-4 w-4 text-destructive animate-pulse" />
                ) : progress.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                <span className="text-foreground font-medium">
                  {connectionLost
                    ? 'Reconectando...'
                    : progress.status === 'done'
                      ? 'Download concluído'
                      : progress.status === 'starting'
                        ? 'Iniciando download...'
                        : 'Baixando vídeo...'}
                </span>
              </div>
              <span className="text-muted-foreground font-mono">{downloadPercent}%</span>
            </div>
            <Progress value={downloadPercent} className="h-2" />
            {(progress.speed || progress.eta) && !connectionLost && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress.speed || ''}</span>
                <span>{progress.eta ? `ETA: ${progress.eta}` : ''}</span>
              </div>
            )}
            {connectionLost && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>Conexão perdida. Tentando reconectar...</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-xs h-7 px-3 text-muted-foreground hover:text-destructive"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              placeholder={
                disabled
                  ? 'Funcionalidade bloqueada - assine um plano'
                  : 'Cole o link do YouTube aqui...'
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isProcessing || disabled}
              className="pl-11 h-11 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={isProcessing || disabled}
            className={`h-11 px-6 ${disabled ? 'bg-muted text-muted-foreground' : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/30'} transition-all rounded-xl font-medium`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isDownloading ? `${Math.round(progress.percent)}%` : 'Processando...'}
              </>
            ) : disabled ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Bloqueado
              </>
            ) : (
              <>
                Download
                <Download className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
