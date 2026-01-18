'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateVideo } from '@/hooks/useVideos';
import { Link as LinkIcon, Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function AddVideoForm() {
  const [url, setUrl] = useState('');
  const createVideo = useCreateVideo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error('Por favor, cole o link do YouTube');
      return;
    }

    try {
      await createVideo.mutateAsync(url.trim());
      toast.success('Vídeo adicionado! Download iniciado em segundo plano.');
      setUrl('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao adicionar vídeo');
    }
  };

  return (
    <Card className="glass-card card-gradient-border rounded-2xl border-0 py-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-linear-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Criar Cortes Automaticamente</h3>
            <p className="text-xs text-muted-foreground">
              Cole o link do YouTube e receba vários cortes prontos para viralizar
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Cole o link do YouTube aqui..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={createVideo.isPending}
              className="pl-11 h-11 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-primary/20 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={createVideo.isPending}
            className="h-11 px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/30 transition-all rounded-xl font-medium"
          >
            {createVideo.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Gerar Cortes
                <span className="ml-1">→</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
