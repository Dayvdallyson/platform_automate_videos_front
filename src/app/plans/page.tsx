'use client';

import { Button } from '@/components/ui/button';
import { getStoredUserId } from '@/hooks/useSubscription';
import { billingService } from '@/lib/billing';
import { BillingPlanId, PLANS, PlanDetails, SubscriptionStatusResponse } from '@/types/billing';
import { Check, Crown, Loader2, Sparkles, Zap } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const planIcons: Record<BillingPlanId, React.ReactNode> = {
  basic: <Zap className="h-6 w-6" />,
  pro: <Sparkles className="h-6 w-6" />,
  business: <Crown className="h-6 w-6" />,
};

const planColors: Record<BillingPlanId, { gradient: string; text: string }> = {
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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export default function PlansPage() {
  const [userId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      return getStoredUserId();
    }
    return null;
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusResponse | null>(
    null,
  );
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState<BillingPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoadingStatus(true);
      const status = await billingService.getSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
      // Don't show error for status fetch - user might not have a subscription yet
    } finally {
      setIsLoadingStatus(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const handleSubscribe = async (planId: BillingPlanId) => {
    if (!userId) {
      setError('Usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    try {
      setIsSubscribing(planId);
      setError(null);

      const response = await billingService.createSubscription(planId, userId);
      billingService.redirectToCheckout(response.init_point);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar assinatura');
      setIsSubscribing(null);
    }
  };

  const isCurrentPlan = (planId: BillingPlanId): boolean => {
    return subscriptionStatus?.plan_id === planId && subscriptionStatus?.status === 'active';
  };

  return (
    <main className="min-h-screen bg-background py-16 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 gradient-border px-4 py-1.5 mb-6">
          <Crown className="h-3.5 w-3.5 text-secondary" />
          <span className="text-xs font-medium text-muted-foreground">Escolha seu plano</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-foreground">Desbloqueie o poder da </span>
          <span className="text-gradient">automação</span>
        </h1>

        <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
          Escolha o plano ideal para transformar seus vídeos longos em cortes prontos para viralizar
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-center text-sm">
          {error}
        </div>
      )}

      {/* Current subscription status */}
      {subscriptionStatus?.plan_id && subscriptionStatus?.status === 'active' && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
          <p className="text-sm text-muted-foreground">Seu plano atual:</p>
          <p className="text-lg font-bold text-primary">
            {PLANS.find((p) => p.id === subscriptionStatus.plan_id)?.name ||
              subscriptionStatus.plan_id}
          </p>
        </div>
      )}

      {/* Plans grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isLoading={isSubscribing === plan.id}
            isLoadingStatus={isLoadingStatus}
            isCurrent={isCurrentPlan(plan.id)}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* Footer notes */}
      <div className="text-center mt-12">
        <p className="text-xs text-muted-foreground">
          Pagamento seguro via Mercado Pago • Cancele a qualquer momento
        </p>
      </div>
    </main>
  );
}

interface PlanCardProps {
  plan: PlanDetails;
  isLoading: boolean;
  isLoadingStatus: boolean;
  isCurrent: boolean;
  onSubscribe: (planId: BillingPlanId) => void;
}

function PlanCard({ plan, isLoading, isLoadingStatus, isCurrent, onSubscribe }: PlanCardProps) {
  const colors = planColors[plan.id];
  const isPopular = plan.isPopular;

  return (
    <div
      className={`relative glass-card card-gradient-border rounded-2xl p-6 transition-all hover:scale-[1.02] ${
        isPopular ? 'ring-2 ring-primary/50' : ''
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
          {planIcons[plan.id]}
        </div>
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.subtitle}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <span className={`text-4xl font-bold ${colors.text}`}>{formatPrice(plan.price)}</span>
        <span className="text-muted-foreground">/mês</span>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm text-foreground">
            <Check className="h-4 w-4 text-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        className={`w-full ${
          isCurrent
            ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed'
            : `bg-linear-to-r ${colors.gradient} text-white hover:opacity-90 shadow-lg`
        }`}
        onClick={() => onSubscribe(plan.id)}
        disabled={isLoading || isLoadingStatus || isCurrent}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : isCurrent ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Ativo
          </>
        ) : (
          <>Assinar {plan.name}</>
        )}
      </Button>
    </div>
  );
}
