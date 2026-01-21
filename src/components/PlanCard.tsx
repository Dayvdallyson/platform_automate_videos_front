import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2, Sparkles, Zap } from 'lucide-react';
import React from 'react';

export type PlanTheme = 'basic' | 'pro' | 'business';

interface PlanFeature {
  text: string;
  icon?: React.ReactNode;
  muted?: boolean;
  success?: boolean;
}

interface PlanCardProps {
  plan: {
    name: string;
    description: string;
    price: number | string;
    theme: PlanTheme;
    isPopular?: boolean;
  };
  features: PlanFeature[];
  isLoading?: boolean;
  disabled?: boolean;
  isCurrent?: boolean;
  buttonText?: React.ReactNode;
  onSubscribe: () => void;
}

const planIcons: Record<PlanTheme, React.ReactNode> = {
  basic: <Zap className="h-6 w-6" />,
  pro: <Sparkles className="h-6 w-6" />,
  business: <Crown className="h-6 w-6" />,
};

const planColors: Record<PlanTheme, { gradient: string; text: string }> = {
  basic: {
    gradient: 'from-gray-500 to-gray-600',
    text: 'text-foreground',
  },
  pro: {
    gradient: 'from-primary to-secondary',
    text: 'text-primary',
  },
  business: {
    gradient: 'from-amber-500 to-orange-500',
    text: 'text-amber-400',
  },
};

function formatPrice(price: number | string): string {
  if (typeof price === 'string') return price;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function PlanCard({
  plan,
  features,
  isLoading,
  disabled,
  isCurrent,
  buttonText,
  onSubscribe,
}: PlanCardProps) {
  const colors = planColors[plan.theme];

  return (
    <div
      className={`relative glass-card card-gradient-border rounded-2xl p-6 transition-all hover:scale-[1.02] ${
        plan.isPopular ? 'ring-2 ring-primary/50' : ''
      } ${isCurrent ? 'ring-2 ring-emerald-500/50' : ''}`}
    >
      {/* Current plan badge */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Check className="h-3 w-3" />
            Plano Atual
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6 mt-2">
        <div
          className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-linear-gradient-to-br ${colors.gradient} text-white mb-3 shadow-lg`}
        >
          {planIcons[plan.theme]}
        </div>
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <span className={`text-4xl font-bold ${colors.text}`}>{formatPrice(plan.price)}</span>
        <span className="text-muted-foreground">/mês</span>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex items-center gap-3 text-sm ${feature.muted ? 'text-muted-foreground' : 'text-foreground'}`}
          >
            <span
              className={
                feature.success
                  ? 'text-emerald-500'
                  : feature.muted
                    ? 'text-muted-foreground'
                    : 'text-primary'
              }
            >
              {feature.icon || <Check className="h-4 w-4 shrink-0" />}
            </span>
            {feature.text}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        className={`w-full cursor-pointer ${
          isCurrent
            ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed'
            : `bg-linear-to-r ${colors.gradient} text-white hover:opacity-90 shadow-lg`
        }`}
        onClick={onSubscribe}
        disabled={isLoading || disabled || isCurrent}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processandoxxx...
          </>
        ) : isCurrent ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Ativo
          </>
        ) : (
          buttonText || <>Assinar {plan.name}</>
        )}
      </Button>
    </div>
  );
}
