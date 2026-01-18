'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatExpiryTime,
  isTokenExpiringSoon,
  useConnectPlatform,
  useDisconnectPlatform,
  useSocialConnections,
} from '@/hooks/useSocialConnections';
import { ConnectionStatus } from '@/types/video';
import { AlertCircle, AlertTriangle, Check, Link2, Loader2, Unlink } from 'lucide-react';
import { useState } from 'react';
import { FaInstagram, FaTiktok } from 'react-icons/fa';
import { toast } from 'sonner';

interface PlatformCardProps {
  platform: 'tiktok' | 'instagram';
  connection: ConnectionStatus | undefined;
  isLoading: boolean;
}

function PlatformCard({ platform, connection, isLoading }: PlatformCardProps) {
  const [confirming, setConfirming] = useState(false);
  const connectMutation = useConnectPlatform();
  const disconnectMutation = useDisconnectPlatform();

  const isTikTok = platform === 'tiktok';
  const isConnected = connection?.connected ?? false;
  const accountName = connection?.account_name;
  const expiresAt = connection?.expires_at ?? null;
  const isExpiringSoon = isTokenExpiringSoon(expiresAt);

  const handleConnect = async () => {
    try {
      await connectMutation.mutateAsync(platform);
      toast.info(`Abrindo login do ${isTikTok ? 'TikTok' : 'Instagram'}...`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao conectar');
    }
  };

  const handleDisconnect = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    try {
      await disconnectMutation.mutateAsync(platform);
      toast.success(`Desconectado do ${isTikTok ? 'TikTok' : 'Instagram'}`);
    } catch {
      toast.error('Falha ao desconectar');
    } finally {
      setConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card border-0 rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg bg-muted/50" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24 bg-muted/50" />
              <Skeleton className="h-3 w-32 bg-muted/50" />
            </div>
            <Skeleton className="h-9 w-24 bg-muted/50" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`glass-card border-0 rounded-xl overflow-hidden transition-all ${
        isConnected ? 'ring-1 ring-emerald-500/30' : ''
      }`}
    >
      {/* Platform gradient bar */}
      <div
        className={`h-1 ${
          isTikTok
            ? 'bg-linear-to-r from-[#25F4EE] via-[#FE2C55] to-[#000000]'
            : 'bg-linear-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
        }`}
      />

      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Platform Icon */}
          <div
            className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
              isTikTok
                ? 'bg-black text-white'
                : 'bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]'
            }`}
          >
            {isTikTok ? (
              <FaTiktok className="h-5 w-5" />
            ) : (
              <FaInstagram className="h-5 w-5 text-white" />
            )}
          </div>

          {/* Account Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">
                {isTikTok ? 'TikTok' : 'Instagram'}
              </span>
              {isConnected && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              )}
              {isExpiringSoon && (
                <Badge className="bg-amber-500/20 text-amber-400 border-none text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {formatExpiryTime(expiresAt)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isConnected && accountName ? `@${accountName}` : 'Não conectado'}
            </p>
          </div>

          {/* Action Button */}
          {isConnected ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              onBlur={() => setConfirming(false)}
              disabled={disconnectMutation.isPending}
              className={`h-9 px-3 rounded-lg text-xs ${
                confirming
                  ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                  : 'hover:bg-muted/50 text-muted-foreground'
              }`}
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : confirming ? (
                'Confirmar?'
              ) : (
                <>
                  <Unlink className="h-4 w-4 mr-1" />
                  Desconectar
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleConnect}
              disabled={connectMutation.isPending}
              className={`h-9 px-4 rounded-lg text-xs font-medium ${
                isTikTok
                  ? 'bg-black hover:bg-zinc-800 text-white'
                  : 'bg-linear-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white'
              }`}
            >
              {connectMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-1" />
                  Conectar
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SocialConnectionsPanel() {
  const { data: connections, isLoading, error } = useSocialConnections();

  const tiktokConnection = connections?.find((c) => c.platform === 'tiktok');
  const instagramConnection = connections?.find((c) => c.platform === 'instagram');

  if (error) {
    return (
      <Card className="glass-card border-0 rounded-xl">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">Falha ao carregar conexões</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card card-gradient-border border-0 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          Contas de Redes Sociais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <PlatformCard platform="tiktok" connection={tiktokConnection} isLoading={isLoading} />
        <PlatformCard platform="instagram" connection={instagramConnection} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}
