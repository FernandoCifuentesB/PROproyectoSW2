import type { PaymentProvider } from "@/lib/payment-types";

export type { PaymentProvider };

export type CreatePaymentRequest = {
  externalRef: string;
  idempotencyKey: string;
  provider: PaymentProvider;
  cardNumber: string;
  cvv?: string;
  amount: number;
};

export type PaymentResponse = {
  idempotent: boolean;
  payment: {
    id: string;
    companyId: string;
    externalRef: string;
    idempotencyKey: string;
    cardBrand: PaymentProvider;
    cardLastFour: string;
    amount: number;
    status: string;
  };
};

const PAYMENT_API_URL =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL ?? 'http://localhost:3001';

const COMPANY_ID =
  process.env.NEXT_PUBLIC_PAYMENT_COMPANY_ID ??
  '550e8400-e29b-41d4-a716-446655440000';

export async function createPayment(
  payload: CreatePaymentRequest,
): Promise<PaymentResponse> {
  const response = await fetch(`${PAYMENT_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: '*/*',
    },
    body: JSON.stringify({
      companyId: COMPANY_ID,
      externalRef: payload.externalRef,
      idempotencyKey: payload.idempotencyKey,
      provider: payload.provider,
      cardNumber: payload.cardNumber,
      cvv: payload.cvv,
      amount: payload.amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.reason ??
      data?.message ??
      'No fue posible procesar el pago con la pasarela';

    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
}