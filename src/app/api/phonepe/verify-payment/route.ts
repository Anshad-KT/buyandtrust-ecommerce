import { NextRequest, NextResponse } from 'next/server';
import { StandardCheckoutClient, Env } from 'pg-sdk-node';

// PhonePe credentials from environment variables (server-side only)
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1.0';
const env = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;
console.log("env", env);
export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'PhonePe credentials not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { merchantOrderId } = body;

    // Validate required fields
    if (!merchantOrderId) {
      return NextResponse.json(
        { error: 'Merchant order ID is required' },
        { status: 400 }
      );
    }

    // For sandbox testing: If user reaches callback with merchantOrderId, assume success
    // In production, you should use PhonePe's transaction status API endpoint
    // or implement webhook verification
    
    // Temporary solution for sandbox testing
    // TODO: Implement proper PhonePe status check API call for production
    return NextResponse.json({
      success: true,
      status: 'PAYMENT_SUCCESS',
      merchantOrderId,
      message: 'Payment verified (sandbox mode)',
    });

  } catch (error: any) {
    console.error('PhonePe payment verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify payment status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
