'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlanInfo, PlanType } from '@/types/subscription';
import {
  Check,
  Clock,
  Crown,
  Droplets,
  Loader2,
  Scissors,
  Sparkles,
  Video,
  Zap,
} from 'lucide-react';

interface PlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: PlanInfo[];
  currentPlan?: PlanType;
  onUpgrade: (plan: PlanType) => void;
  isUpgrading?: boolean;
}

const planIcons: Record<PlanType, React.ReactNode> = {
  basic: <Zap className="h-6 w-6" />,
  pro: <Sparkles className="h-6 w-6" />,
  business: <Crown className="h-6 w-6" />,
};

const planColors: Record<PlanType, { bg: string; text: string; border: string; shadow: string }> = {
  basic: {
    bg: 'bg-muted/50',
    text: 'text-foreground',
    border: 'border-border',
    shadow: '',
  },
  pro: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/50',
    shadow: 'shadow-lg shadow-primary/20',
  },
  business: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
    shadow: 'shadow-lg shadow-amber-500/20',
  },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function PlansModal({
  open,
  onOpenChange,
  plans,
  currentPlan,
  onUpgrade,
  isUpgrading,
}: PlansModalProps) {
  const orderedPlans = ['basic', 'pro', 'business'] as const;
  const sortedPlans = orderedPlans
    .map((type) => plans.find((p) => p.type === type))
    .filter((p): p is PlanInfo => !!p);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Escolha o plano ideal para você
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Atualize seu plano para desbloquear mais recursos e aumentar sua produtividade
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {sortedPlans.map((plan) => {
            const colors = planColors[plan.type];
            const isCurrent = currentPlan === plan.type;
            const canUpgrade = !isCurrent;

            return (
              <div
                key={plan.type}
                className={`relative rounded-2xl p-4 border min-w-0 ${colors.border} ${colors.bg} ${colors.shadow} transition-all hover:scale-[1.02]`}
              >
                {/* Badges */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {isCurrent && (
                    <Badge className="bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Atual
                    </Badge>
                  )}
                </div>

                {/* Header */}
                <div className="text-center mb-4 mt-2">
                  <div
                    className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${colors.bg} ${colors.text} mb-2`}
                  >
                    {planIcons[plan.type]}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <span className={`text-2xl font-bold ${colors.text}`}>
                    {formatPrice(plan.price_brl)}
                  </span>
                  <span className="text-muted-foreground text-sm">/mês</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-4 text-xs">
                  <FeatureItem
                    icon={<Video className="h-3.5 w-3.5" />}
                    text={`${plan.max_videos_per_month} vídeos/mês`}
                  />
                  <FeatureItem
                    icon={<Clock className="h-3.5 w-3.5" />}
                    text={`Máx ${plan.max_video_duration_minutes} min`}
                  />
                  <FeatureItem
                    icon={<Scissors className="h-3.5 w-3.5" />}
                    text={`${plan.max_cuts_per_month} cortes/mês`}
                  />
                  <FeatureItem
                    icon={<Droplets className="h-3.5 w-3.5" />}
                    text={plan.has_watermark ? 'Com watermark' : 'Sem watermark'}
                    muted={plan.has_watermark}
                  />
                  <FeatureItem
                    icon={<Zap className="h-3.5 w-3.5" />}
                    text={`Prioridade ${plan.priority === 'high' ? 'alta' : plan.priority === 'medium' ? 'média' : 'normal'}`}
                  />
                </ul>

                {/* CTA Button */}
                <Button
                  size="sm"
                  className={`w-full ${
                    isCurrent
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'cursor-pointer bg-linear-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/30'
                  }`}
                  onClick={() => onUpgrade(plan.type)}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : isCurrent ? (
                    'Plano Atual'
                  ) : canUpgrade ? (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Fazer Upgrade
                    </>
                  ) : (
                    'Plano Inferior'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureItem({
  icon,
  text,
  muted = false,
}: {
  icon: React.ReactNode;
  text: string;
  muted?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 text-sm ${muted ? 'text-muted-foreground' : 'text-foreground'}`}
    >
      <span className={muted ? 'text-muted-foreground' : 'text-primary'}>{icon}</span>
      {text}
    </li>
  );
}
