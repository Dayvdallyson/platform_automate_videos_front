'use client';

import { AddVideoForm } from '@/components/AddVideoForm';
import { PlanCards } from '@/components/PlanCards';
import { PlansModal } from '@/components/PlansModal';
import { ProcessedVideoList } from '@/components/ProcessedVideoList';
import { SocialConnectionsPanel } from '@/components/SocialConnectionsPanel';
import { UsageCard } from '@/components/UsageCard';
import { VideoList } from '@/components/VideoList';
import { useAuth } from '@/components/auth-provider';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlans, useUpgradePlan, useUsage } from '@/hooks/useSubscription';
import { billingService } from '@/lib/billing';
import { BillingPlanId } from '@/types/billing';
import { PlanType } from '@/types/subscription';
import { Loader2, Sparkles, Video } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function SubscriptionWrapper() {
  const { user, isLoading: authLoading } = useAuth();
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: usage, isLoading: usageLoading } = useUsage(user?.id ?? null);
  const { data: plans, isLoading: plansLoading } = usePlans();
  const upgradePlan = useUpgradePlan();

  const hasSubscription = !!user && !!usage;

  const handleSelectPlan = async (plan: PlanType) => {
    if (!user) {
      toast.error('Usuário não encontrado. Por favor, faça login novamente.');
      return;
    }

    try {
      setIsSubscribing(true);

      // Call billing API to create subscription and get Mercado Pago checkout URL
      const response = await billingService.createSubscription(plan as BillingPlanId, user.id);

      // Redirect to Mercado Pago checkout
      billingService.redirectToCheckout(response.init_point);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao criar assinatura');
      setIsSubscribing(false);
    }
  };

  const handleUpgrade = async (plan: PlanType) => {
    if (!user) return;

    try {
      await upgradePlan.mutateAsync({ userId: user.id, newPlan: plan });
      toast.success(`Upgrade para ${plan.toUpperCase()} realizado com sucesso!`);
      setPlansModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao fazer upgrade');
    }
  };

  if (authLoading || plansLoading || (user && usageLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User has no subscription - show plan selection
  if (!hasSubscription && !usageLoading && plans) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <PlanCards plans={plans} onSelectPlan={handleSelectPlan} isLoading={isSubscribing} />
      </div>
    );
  }

  // User has subscription - show normal interface
  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Usage Card */}
        {user && usage && (
          <section className="mb-8">
            <UsageCard usage={usage} onUpgrade={() => setPlansModalOpen(true)} />
          </section>
        )}

        <section className="mb-12">
          <AddVideoForm />
        </section>

        <Separator className="bg-border/50 mb-10" />

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="w-full max-w-md mx-auto glass-card rounded-xl p-1.5 mb-8 py-10">
            <TabsTrigger
              value="videos"
              className="py-6 flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 transition-all"
            >
              <Video className="h-4 w-4 mr-2" />
              Vídeos Originais
            </TabsTrigger>
            <TabsTrigger
              value="processed"
              className="py-6 flex-1 rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/25 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Cortes Gerados
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="videos" className="m-0">
              <VideoList />
            </TabsContent>

            <TabsContent value="processed" className="m-0 space-y-6">
              <SocialConnectionsPanel />
              <ProcessedVideoList />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Plans Modal */}
      {plans && (
        <PlansModal
          open={plansModalOpen}
          onOpenChange={setPlansModalOpen}
          plans={plans}
          currentPlan={usage?.plan_type}
          onUpgrade={handleUpgrade}
          isUpgrading={upgradePlan.isPending}
        />
      )}
    </>
  );
}
