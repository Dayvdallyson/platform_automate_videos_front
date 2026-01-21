'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UsageSummary } from '@/types/subscription';
import { Calendar, Crown, Droplets, Scissors, TrendingUp, Video } from 'lucide-react';

interface UsageCardProps {
  usage: UsageSummary;
  onUpgrade?: () => void;
}

export function UsageCard({ usage, onUpgrade }: UsageCardProps) {
  const videosPercent = Math.min(usage.videos_usage_percent, 100);
  const cutsPercent = Math.min(usage.cuts_usage_percent, 100);

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-destructive';
    if (percent >= 70) return 'bg-amber-500';
    return 'bg-primary';
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'business':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'pro':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className="glass-card card-gradient-border rounded-2xl border-0">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Seu Consumo</h3>
              <p className="text-xs text-muted-foreground">Ciclo atual de faturamento</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`${getPlanBadgeColor(usage.plan_type)} border`}>
              <Crown className="h-3 w-3 mr-1" />
              {usage.plan_name}
            </Badge>
            {usage.has_watermark && (
              <Badge variant="outline" className="border-border text-muted-foreground">
                <Droplets className="h-3 w-3 mr-1" />
                Watermark
              </Badge>
            )}
          </div>
        </div>

        {/* Usage Bars */}
        <div className="space-y-4 mb-6">
          {/* Videos Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Video className="h-4 w-4" />
                <span>Vídeos processados</span>
              </div>
              <span className="font-medium text-foreground">
                {usage.videos_processed} / {usage.max_videos}
              </span>
            </div>
            <div className="relative">
              <Progress value={videosPercent} className="h-2 bg-muted" />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(videosPercent)}`}
                style={{ width: `${videosPercent}%` }}
              />
            </div>
          </div>

          {/* Cuts Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Scissors className="h-4 w-4" />
                <span>Cortes gerados</span>
              </div>
              <span className="font-medium text-foreground">
                {usage.cuts_generated} / {usage.max_cuts}
              </span>
            </div>
            <div className="relative">
              <Progress value={cutsPercent} className="h-2 bg-muted" />
              <div
                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(cutsPercent)}`}
                style={{ width: `${cutsPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {usage.days_remaining}{' '}
              {usage.days_remaining === 1 ? 'dia restante' : 'dias restantes'}
            </span>
          </div>

          {usage.plan_type !== 'business' && onUpgrade && (
            <Button
              size="sm"
              onClick={onUpgrade}
              className="bg-linear-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg shadow-primary/30 transition-all rounded-lg"
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              Fazer Upgrade
            </Button>
          )}
          {usage.plan_type === 'business' && onUpgrade && (
            <Button
              size="sm"
              onClick={onUpgrade}
              className="bg-linear-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg shadow-primary/30 transition-all rounded-lg"
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              Mudar Plano
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
