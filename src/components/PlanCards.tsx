'use client';

import { Button } from '@/components/ui/button';
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

interface PlanCardsProps {
  plans: PlanInfo[];
  onSelectPlan: (plan: PlanType) => void;
  isLoading?: boolean;
}

const planIcons: Record<PlanType, React.ReactNode> = {
  basic: <Zap className="h-6 w-6" />,
  pro: <Sparkles className="h-6 w-6" />,
  business: <Crown className="h-6 w-6" />,
};

const planColors: Record<
  PlanType,
  { bg: string; text: string; border: string; shadow: string; gradient: string }
> = {
  basic: {
    bg: 'bg-muted/50',
    text: 'text-foreground',
    border: 'border-border',
    shadow: '',
    gradient: 'from-gray-500 to-gray-600',
  },
  pro: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/50',
    shadow: 'shadow-lg shadow-primary/20',
    gradient: 'from-primary to-secondary',
  },
  business: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
    shadow: 'shadow-lg shadow-amber-500/20',
    gradient: 'from-amber-500 to-orange-500',
  },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function PlanCards({ plans, onSelectPlan, isLoading }: PlanCardsProps) {
  const orderedPlans = ['basic', 'pro', 'business'] as const;
  const sortedPlans = orderedPlans
    .map((type) => plans.find((p) => p.type === type))
    .filter((p): p is PlanInfo => !!p);

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 gradient-border px-4 py-1.5 mb-4">
          <Crown className="h-3.5 w-3.5 text-secondary" />
          <span className="text-xs font-medium text-muted-foreground">Escolha seu plano</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-foreground">Comece a criar </span>
          <span className="text-gradient">cortes virais</span>
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Escolha o plano ideal para transformar seus vídeos longos em conteúdo pronto para
          viralizar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => {
          const colors = planColors[plan.type];
          const isRecommended = plan.type === 'pro';

          return (
            <div
              key={plan.type}
              className={`relative glass-card card-gradient-border rounded-2xl p-6 border-0 transition-all hover:scale-[1.02] ${isRecommended ? 'ring-2 ring-primary/50' : ''}`}
            >
              {/* Header */}
              <div className="text-center mb-6 mt-2">
                <div
                  className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-linear-gradient-to-br ${colors.gradient} text-white mb-3 shadow-lg`}
                >
                  {planIcons[plan.type]}
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className={`text-4xl font-bold ${colors.text}`}>
                  {formatPrice(plan.price_brl)}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <FeatureItem
                  icon={<Video className="h-4 w-4" />}
                  text={`${plan.max_videos_per_month} vídeos/mês`}
                />
                <FeatureItem
                  icon={<Clock className="h-4 w-4" />}
                  text={`Máx ${plan.max_video_duration_minutes} min/vídeo`}
                />
                <FeatureItem
                  icon={<Scissors className="h-4 w-4" />}
                  text={`${plan.max_cuts_per_month} cortes/mês`}
                />
                <FeatureItem
                  icon={<Droplets className="h-4 w-4" />}
                  text={plan.has_watermark ? 'Com watermark' : 'Sem watermark'}
                  muted={plan.has_watermark}
                  success={!plan.has_watermark}
                />
                <FeatureItem
                  icon={<Zap className="h-4 w-4" />}
                  text={`Prioridade ${plan.priority === 'high' ? 'alta' : plan.priority === 'medium' ? 'média' : 'normal'}`}
                />
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full bg-linear-gradient-to-r ${colors.gradient} text-white hover:opacity-90 shadow-lg`}
                onClick={() => onSelectPlan(plan.type)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Começar com {plan.name}
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  text,
  muted = false,
  success = false,
}: {
  icon: React.ReactNode;
  text: string;
  muted?: boolean;
  success?: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 text-sm ${muted ? 'text-muted-foreground' : 'text-foreground'}`}
    >
      <span
        className={success ? 'text-emerald-500' : muted ? 'text-muted-foreground' : 'text-primary'}
      >
        {icon}
      </span>
      {text}
    </li>
  );
}
