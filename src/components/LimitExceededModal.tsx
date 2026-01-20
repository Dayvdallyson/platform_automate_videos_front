'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlanType, QuotaError } from '@/types/subscription';
import { AlertTriangle, Clock, Crown, Scissors, TrendingUp, Video } from 'lucide-react';

interface LimitExceededModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotaError: QuotaError | null;
  onViewPlans: () => void;
}

const errorIcons: Record<string, React.ReactNode> = {
  VIDEO_LIMIT_EXCEEDED: <Video className="h-8 w-8" />,
  VIDEO_DURATION_EXCEEDED: <Clock className="h-8 w-8" />,
  CUTS_LIMIT_EXCEEDED: <Scissors className="h-8 w-8" />,
};

const errorTitles: Record<string, string> = {
  VIDEO_LIMIT_EXCEEDED: 'Limite de Vídeos Atingido',
  VIDEO_DURATION_EXCEEDED: 'Duração Máxima Excedida',
  CUTS_LIMIT_EXCEEDED: 'Limite de Cortes Atingido',
};

const errorDescriptions: Record<string, (current: number, limit: number) => string> = {
  VIDEO_LIMIT_EXCEEDED: (current, limit) =>
    `Você já processou ${current} de ${limit} vídeos disponíveis no seu plano este mês.`,
  VIDEO_DURATION_EXCEEDED: (current, limit) =>
    `O vídeo tem ${current} minutos, mas seu plano permite vídeos de até ${limit} minutos.`,
  CUTS_LIMIT_EXCEEDED: (current, limit) =>
    `Você já gerou ${current} de ${limit} cortes disponíveis no seu plano este mês.`,
};

const planLabels: Record<PlanType, string> = {
  basic: 'Basic',
  pro: 'Pro',
  business: 'Business',
};

export function LimitExceededModal({
  open,
  onOpenChange,
  quotaError,
  onViewPlans,
}: LimitExceededModalProps) {
  if (!quotaError) return null;

  const icon = errorIcons[quotaError.error_code] || <AlertTriangle className="h-8 w-8" />;
  const title = errorTitles[quotaError.error_code] || 'Limite Excedido';
  const description = errorDescriptions[quotaError.error_code]
    ? errorDescriptions[quotaError.error_code](quotaError.current_usage, quotaError.limit)
    : quotaError.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md glass-card border-border/50">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center text-destructive mb-4">
            {icon}
          </div>
          <DialogTitle className="text-xl font-bold text-center text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Usage Bar */}
        <div className="my-6 p-4 rounded-xl bg-muted/50 border border-border/50">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Uso atual</span>
            <span className="font-medium text-foreground">
              {quotaError.current_usage} / {quotaError.limit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-background overflow-hidden">
            <div
              className="h-full rounded-full bg-destructive transition-all"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Upgrade Options */}
        {quotaError.upgrade_options.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Faça upgrade para continuar produzindo:
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {quotaError.upgrade_options.map((option) => (
                <div
                  key={option}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-medium"
                >
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {planLabels[option as PlanType] || option}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/30"
            onClick={onViewPlans}
          >
            <Crown className="mr-2 h-4 w-4" />
            Ver Planos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
