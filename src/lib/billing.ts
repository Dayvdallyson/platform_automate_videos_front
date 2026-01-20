/**
 * Billing service for Mercado Pago subscription integration
 */

import {
  BillingPlanId,
  CreateSubscriptionResponse,
  SubscriptionStatusResponse,
} from '@/types/billing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class BillingService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Creates a subscription and returns the Mercado Pago checkout URL
   */
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
      // Handle different API error formats
      const errorMessage =
        error.detail ||
        error.message ||
        error.error ||
        (typeof error === 'string' ? error : 'Falha ao criar assinatura');
      throw new Error(errorMessage);
    }

    return res.json();
  }

  /**
   * Gets the current subscription status
   */
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

  /**
   * Redirects the user to the Mercado Pago checkout
   */
  redirectToCheckout(initPoint: string): void {
    window.location.href = initPoint;
  }
}

export const billingService = new BillingService(API_BASE);
export { BillingService };
