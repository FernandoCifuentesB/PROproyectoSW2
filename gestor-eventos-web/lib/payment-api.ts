const RAW_PAYMENT_API = process.env.NEXT_PUBLIC_PAYMENT_API_URL;
const COMPANY_ID = process.env.NEXT_PUBLIC_PAYMENT_COMPANY_ID;

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function requirePaymentApiUrl() {
  if (!RAW_PAYMENT_API) {
    throw new Error("NEXT_PUBLIC_PAYMENT_API_URL no está definido en .env.local");
  }

  return normalizeBaseUrl(RAW_PAYMENT_API);
}

function requireCompanyId() {
  if (!COMPANY_ID) {
    throw new Error("NEXT_PUBLIC_PAYMENT_COMPANY_ID no está definido en .env.local");
  }

  return COMPANY_ID;
}

async function parseBody(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(body: unknown) {
  if (!body) return "";

  if (typeof body === "object" && body !== null) {
    const data = body as any;

    if (Array.isArray(data.message)) {
      return data.message.join(", ");
    }

    return data.reason || data.message || data.error || data.detail || JSON.stringify(data);
  }

  return String(body);
}

export type CardBrand = "VISA" | "MASTERCARD" | "NU";

export type CreatePaymentPayload = {
  externalRef: string;
  idempotencyKey: string;
  provider: CardBrand;
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
    cardBrand: CardBrand;
    cardLastFour: string;
    amount: number;
    status: "NO_LIQUIDADO" | "LIQUIDADO" | "RECHAZADO";
    providerResponse?: {
      approved: boolean;
      reason?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
};

export async function createPayment(body: CreatePaymentPayload) {
  const PAYMENT_API = requirePaymentApiUrl();

  const cleanCardNumber = body.cardNumber.replace(/\s/g, "");
  const cleanCvv = body.cvv?.replace(/\s/g, "");

  const res = await fetch(`${PAYMENT_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyId: requireCompanyId(),
      externalRef: body.externalRef,
      idempotencyKey: body.idempotencyKey,
      provider: body.provider,
      cardNumber: cleanCardNumber,
      cvv: body.provider === "NU" ? cleanCvv : undefined,
      amount: body.amount,
    }),
  });

  const data = await parseBody(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(data) || "No fue posible procesar el pago");
  }

  return data as PaymentResponse;
}

export function isValidCardForBrand(cardNumber: string, brand: CardBrand) {
  const cleanCard = cardNumber.replace(/\s/g, "");

  if (brand === "NU") {
    return /^\d{13,19}$/.test(cleanCard);
  }

  if (brand === "VISA") {
    return /^4/.test(cleanCard);
  }

  if (brand === "MASTERCARD") {
    const prefix2 = Number(cleanCard.substring(0, 2));
    const prefix4 = Number(cleanCard.substring(0, 4));

    return (
      (prefix2 >= 51 && prefix2 <= 55) ||
      (prefix4 >= 2221 && prefix4 <= 2720)
    );
  }

  return false;
}