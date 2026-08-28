import { NextResponse, NextRequest } from 'next/server';
import { getMarketRates, updateMarketRate } from '../../../../lib/db/dataProvider';

export async function GET() {
  try {
    const rates = await getMarketRates();
    return NextResponse.json({ success: true, rates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, label, unit, category, secretKey, adminUser } = body;

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'pakcalc2026';
    if (secretKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Secret Key' }, { status: 401 });
    }

    if (!key || typeof value !== 'number') {
      return NextResponse.json({ success: false, error: 'Bad Request: "key" and numeric "value" are required.' }, { status: 400 });
    }

    const updated = await updateMarketRate(key, value, label, unit, category, adminUser || 'Admin');
    return NextResponse.json({ success: true, rate: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
