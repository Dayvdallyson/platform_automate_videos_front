'use client';

import { PlanCard } from '@/components/PlanCard';
import { useAuth } from '@/components/auth-provider';
import { billingService } from '@/lib/billing';
import {
  BillingPlanId,
  PLANS,
  PLANS_NAME_TRANSLATE,
  SubscriptionStatusResponse,
} from '@/types/billing';
import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function PlanCards() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id ?? null;
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusResponse | null>(
    null,
  );
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState<BillingPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionStatus = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!userId) {
      setIsLoadingStatus(false);
      return;
    }

    try {
      setIsLoadingStatus(true);
      const status = await billingService.getSubscriptionStatus(userId);
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [userId, authLoading]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  const handleSubscribe = async (planId: BillingPlanId) => {
    if (!userId) {
      router.push('/login');
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

      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-center text-sm">
          {error}
        </div>
      )}

      {subscriptionStatus?.plan_id && subscriptionStatus?.status === 'active' && (
        <div className="max-w-md mx-auto mb-8 p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
          <p className="text-sm text-muted-foreground">Seu plano atual:</p>
          <p className="text-lg font-bold text-primary">
            {PLANS.find((p) => p.id === subscriptionStatus.plan_id)?.name ||
              subscriptionStatus.plan_id}
          </p>
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={{
              name:
                PLANS_NAME_TRANSLATE[plan.name as keyof typeof PLANS_NAME_TRANSLATE] || plan.name,
              description: plan.subtitle,
              price: plan.price,
              theme: plan.id,
              isPopular: plan.isPopular,
            }}
            features={plan.features.map((f) => ({ text: f }))}
            isLoading={isSubscribing === plan.id || isLoadingStatus || authLoading}
            isCurrent={isCurrentPlan(plan.id)}
            onSubscribe={() => handleSubscribe(plan.id)}
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-xs text-muted-foreground">
          Pagamento seguro via Mercado Pago • Cancele a qualquer momento
        </p>
      </div>
    </main>
  );
}
