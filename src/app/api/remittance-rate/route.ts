import { NextResponse } from 'next/server';
import { getRemittanceReference } from '../../../lib/sync/live/remittanceRates';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const from = (params.get('from') ?? '').toUpperCase();
  const to = (params.get('to') ?? '').toUpperCase();
  try {
    const reference = await getRemittanceReference(from, to);
    return NextResponse.json(reference, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } });
  } catch (error) {
    const invalid = error instanceof RangeError;
    return NextResponse.json({ error: invalid ? 'Choose valid sending and receiving currencies.' : 'Reference unavailable. You can still calculate using a current provider quote.' }, { status: invalid ? 400 : 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
