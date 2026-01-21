'use client';

import { useAuth } from '@/components/auth-provider';
import { billingService } from '@/lib/billing';
import { AlertCircle, CheckCircle, CreditCard, Home, Loader2, XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not_authenticated'>(
    'loading',
  );
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (authLoading) return;
      if (!user) {
        setStatus('not_authenticated');
        return;
      }

      const mpStatus = searchParams.get('status');

      if (mpStatus === 'rejected' || mpStatus === 'cancelled') {
        setStatus('error');
        return;
      }

      try {
        const result = await billingService.confirmPayment(user.id);

        if (result.success) {
          setStatus('success');
          setPlanId(result.planId);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [user, authLoading, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Processando pagamento...</h1>
            <p className="text-muted-foreground">Aguarde enquanto confirmamos seu pagamento.</p>
          </>
        )}

        {status === 'not_authenticated' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/10 flex items-center justify-center animate-in zoom-in duration-300">
              <AlertCircle className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Sessão expirada</h1>
            <p className="text-muted-foreground mb-6">
              Faça login para verificar o status do seu pagamento.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Fazer Login
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Pagamento confirmado! 🎉</h1>
            <p className="text-muted-foreground mb-6">
              {planId
                ? `Seu plano ${planId.charAt(0).toUpperCase() + planId.slice(1)} foi ativado com sucesso!`
                : 'Sua assinatura foi ativada com sucesso. Aproveite todos os recursos do seu plano!'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <Home className="w-4 h-4" />
                Ir para Dashboard
              </button>
              <button
                onClick={() => router.push('/plans')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary/20 text-foreground font-medium hover:bg-secondary/30 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Ver Meu Plano
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center animate-in zoom-in duration-300">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Pagamento não concluído</h1>
            <p className="text-muted-foreground mb-6">
              Houve um problema com seu pagamento. Por favor, tente novamente ou entre em contato
              com o suporte.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/plans')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                <CreditCard className="w-4 h-4" />
                Tentar Novamente
              </button>
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary/20 text-foreground font-medium hover:bg-secondary/30 transition-colors"
              >
                <Home className="w-4 h-4" />
                Voltar ao Início
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
