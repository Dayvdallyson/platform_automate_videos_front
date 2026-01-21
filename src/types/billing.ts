/**
 * Billing types for Mercado Pago integration
 */

export type BillingPlanId = 'basic' | 'pro' | 'business';

export type SubscriptionStatus = 'active' | 'pending' | 'canceled';

export interface CreateSubscriptionRequest {
  plan_id: BillingPlanId;
}

export interface CreateSubscriptionResponse {
  init_point: string;
}

export interface SubscriptionStatusResponse {
  plan_id: BillingPlanId | null;
  status: SubscriptionStatus;
}

export interface PlanDetails {
  id: BillingPlanId;
  name: string;
  subtitle: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export const PLANS_NAME_TRANSLATE = {
  Basic: 'Básico',
  'Pro - Creator': 'Profissional',
  'Business - Studio': 'Empresarial',
};

export const PLANS: PlanDetails[] = [
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Para começar',
    price: 49,
    features: [
      '10 vídeos/mês',
      'Máx 30 min/vídeo',
      '50 cortes/mês',
      'Com watermark',
      'Prioridade normal',
    ],
  },
  {
    id: 'pro',
    name: 'Pro - Creator',
    subtitle: 'Para criadores',
    price: 179,
    features: [
      '50 vídeos/mês',
      'Máx 60 min/vídeo',
      '200 cortes/mês',
      'Sem watermark',
      'Prioridade média',
    ],
    isPopular: true,
  },
  {
    id: 'business',
    name: 'Business - Studio',
    subtitle: 'Para equipes',
    price: 499,
    features: [
      '200 vídeos/mês',
      'Máx 120 min/vídeo',
      '1000 cortes/mês',
      'Sem watermark',
      'Prioridade alta',
    ],
  },
];
