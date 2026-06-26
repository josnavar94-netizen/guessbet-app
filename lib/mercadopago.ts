// Integración con Mercado Pago — Checkout Pro (redirige a su página de pago hospedada,
// GuessBet nunca toca ni almacena datos de tarjeta).

const MP_API = 'https://api.mercadopago.com';

export const PLAN_PRICES = {
  monthly: { amount: 9990, title: 'GuessBet PRO — Mensual', months: 1 },
  annual: { amount: 69990, title: 'GuessBet PRO — Plan Completo (1 año)', months: 12 },
} as const;

export type PlanType = keyof typeof PLAN_PRICES;

export async function createPreference(userId: number, planType: PlanType, origin: string) {
  const plan = PLAN_PRICES[planType];
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [{ title: plan.title, quantity: 1, unit_price: plan.amount, currency_id: 'CLP' }],
      back_urls: {
        success: `${origin}/dashboard?payment=success`,
        failure: `${origin}/dashboard?payment=failure`,
        pending: `${origin}/dashboard?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: `${userId}:${planType}`,
      notification_url: `${origin}/api/payments/webhook`,
    }),
  });
  if (!res.ok) throw new Error(`Mercado Pago /checkout/preferences respondió ${res.status}: ${await res.text().catch(() => '')}`);
  return res.json();
}

// Nunca confiamos en el cuerpo del webhook a ojos cerrados: se vuelve a pedir el pago
// directamente a Mercado Pago con nuestro propio token, para confirmar que es real.
export async function getPayment(paymentId: string) {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Mercado Pago /v1/payments respondió ${res.status}: ${await res.text().catch(() => '')}`);
  return res.json();
}
