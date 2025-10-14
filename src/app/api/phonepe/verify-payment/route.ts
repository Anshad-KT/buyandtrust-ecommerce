import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Environment variables required for PhonePe status API
// PHONEPE_ENV: 'SANDBOX' | 'PRODUCTION'
// PHONEPE_MERCHANT_ID: your merchant ID
// PHONEPE_SALT_KEY: secret salt key
// PHONEPE_SALT_INDEX: salt index (e.g., '1')
const ENV = process.env.PHONEPE_ENV === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX';
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID as string | undefined;
const SALT_KEY = process.env.PHONEPE_SALT_KEY as string | undefined;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX as string | undefined;

function getStatusBaseUrl() {
  // Sandbox base per PhonePe docs
  if (ENV === 'PRODUCTION') {
    return 'https://api.phonepe.com/apis/hermes';
  }
  return 'https://api-preprod.phonepe.com/apis/pg-sandbox';
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { merchantOrderId } = body;

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: 'Merchant order ID is required' },
        { status: 400 }
      );
    }

    if (!MERCHANT_ID || !SALT_KEY || !SALT_INDEX) {
      console.warn('PhonePe verification env vars missing; returning pending');
      return NextResponse.json({
        success: false,
        status: 'PAYMENT_PENDING',
        merchantOrderId,
        message: 'Verification not configured',
      }, { status: 200 });
    }

    // Build status URL and X-VERIFY signature
    const path = `/pg/v1/status/${MERCHANT_ID}/${merchantOrderId}`;
    const base = getStatusBaseUrl();
    const url = `${base}${path}`;

    // As per PhonePe docs: X-VERIFY = sha256(path + SALT_KEY) + '###' + SALT_INDEX
    const checksum = crypto
      .createHash('sha256')
      .update(path + SALT_KEY)
      .digest('hex');
    const xVerify = `${checksum}###${SALT_INDEX}`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': MERCHANT_ID,
      },
      // No body for status GET call
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('PhonePe status HTTP error:', resp.status, txt);
      return NextResponse.json({
        success: false,
        status: 'PAYMENT_PENDING',
        merchantOrderId,
        message: 'Unable to verify payment status',
      }, { status: 200 });
    }

    const data: any = await resp.json();
    // Typical PhonePe response has 'code' or nested 'data.state'
    const rawCode: string = (data && (data.code || data.data?.state)) || '';
    let status: 'PAYMENT_SUCCESS' | 'PAYMENT_PENDING' | 'PAYMENT_FAILED' = 'PAYMENT_PENDING';

    const code = String(rawCode).toUpperCase();
    if (code.includes('SUCCESS')) status = 'PAYMENT_SUCCESS';
    else if (code.includes('PENDING')) status = 'PAYMENT_PENDING';
    else if (code.includes('FAILED') || code.includes('DECLINED') || code.includes('CANCEL')) status = 'PAYMENT_FAILED';

    return NextResponse.json({
      success: status === 'PAYMENT_SUCCESS',
      status,
      merchantOrderId,
      gatewayResponse: data,
    }, { status: 200 });

  } catch (error: any) {
    console.error('PhonePe payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'PAYMENT_PENDING',
        error: 'Failed to verify payment status',
        details: error?.message,
      },
      { status: 200 }
    );
  }
}
