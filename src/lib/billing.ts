import {
  BillingPlanId,
  CreateSubscriptionResponse,
  SubscriptionStatusResponse,
} from '@/types/billing';

const API_BASE = process.env.BACKEND_FASTAPI_URL || 'http://localhost:8000';

class BillingService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createSubscription(
    planId: BillingPlanId,
    userId: number,
  ): Promise<CreateSubscriptionResponse> {
    const res = await fetch(`${this.baseUrl}/api/billing/create-subscription?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const errorMessage =
        error.detail ||
        error.message ||
        error.error ||
        (typeof error === 'string' ? error : 'Falha ao criar assinatura');
      throw new Error(errorMessage);
    }

    return res.json();
  }

  async getSubscriptionStatus(userId: number): Promise<SubscriptionStatusResponse> {
    const res = await fetch(`${this.baseUrl}/api/billing/subscription-status?user_id=${userId}`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));

      let errorMessage = 'Falha ao verificar status da assinatura';
      if (error.detail) {
        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((e: { msg: string }) => e.msg).join(', ');
        } else {
          errorMessage = JSON.stringify(error.detail);
        }
      }

      throw new Error(errorMessage);
    }

    return res.json();
  }

  redirectToCheckout(initPoint: string): void {
    window.location.href = initPoint;
  }

  async confirmPayment(
    userId: number,
  ): Promise<{ success: boolean; status: string; planId: string | null }> {
    try {
      const subscriptionStatus = await this.getSubscriptionStatus(userId);

      const isSuccess =
        subscriptionStatus.status === 'active' || subscriptionStatus.status === 'pending';

      return {
        success: isSuccess,
        status: subscriptionStatus.status,
        planId: subscriptionStatus.plan_id,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        status: 'error',
        planId: null,
      };
    }
  }
}

export const billingService = new BillingService(API_BASE);
export { BillingService };
