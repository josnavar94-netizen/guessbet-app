import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createPreference, PlanType } from '@/lib/mercadopago';
import { logError } from '@/lib/logError';

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  if (!process.env.MP_ACCESS_TOKEN)
    return NextResponse.json({ error: 'Los pagos no están disponibles todavía.' }, { status: 503 });

  try {
    const { planType } = await req.json();
    if (planType !== 'monthly' && planType !== 'annual')
      return NextResponse.json({ error: 'Plan inválido.' }, { status: 400 });

    const pref = await createPreference(s.userId, planType as PlanType, req.nextUrl.origin);
    return NextResponse.json({ initPoint: pref.init_point });
  } catch (err) {
    await logError(err, 'payments/create-preference');
    return NextResponse.json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' }, { status: 500 });
  }
}
