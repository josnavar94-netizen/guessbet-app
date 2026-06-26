import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getPayment, PLAN_PRICES, PlanType } from '@/lib/mercadopago';
import { logError } from '@/lib/logError';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body?.data?.id || req.nextUrl.searchParams.get('id');
    if (!paymentId) return NextResponse.json({ ok: true });

    // Nunca se confía en el estado que venga en el cuerpo de la notificación — se re-confirma
    // directamente contra la API de Mercado Pago con nuestro propio access token.
    const payment = await getPayment(String(paymentId));
    if (payment.status !== 'approved') return NextResponse.json({ ok: true });

    const [userIdStr, planType] = String(payment.external_reference || '').split(':');
    const userId = parseInt(userIdStr);
    if (!userId || !(planType in PLAN_PRICES)) return NextResponse.json({ ok: true });

    const months = PLAN_PRICES[planType as PlanType].months;
    await sql`
      UPDATE users SET plan = 'premium',
        plan_expires_at = GREATEST(COALESCE(plan_expires_at, NOW()), NOW()) + (${months} || ' months')::interval
      WHERE id = ${userId}
    `;
    await sql`
      INSERT INTO payments (user_id, plan_type, amount, mp_payment_id, status)
      VALUES (${userId}, ${planType}, ${payment.transaction_amount}, ${String(payment.id)}, 'approved')
      ON CONFLICT (mp_payment_id) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError(err, 'payments/webhook');
    // Siempre 200: si devolvemos error, Mercado Pago reintenta indefinidamente la misma notificación.
    return NextResponse.json({ ok: true });
  }
}
