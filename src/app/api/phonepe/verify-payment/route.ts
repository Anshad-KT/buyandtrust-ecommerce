import { NextRequest, NextResponse } from 'next/server';
import { StandardCheckoutClient, Env } from 'pg-sdk-node';

// PhonePe credentials from environment variables (server-side only)
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1.0';
const env = process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

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
    const { merchantOrderId, paymentStatus, transactionId, providerReferenceId } = body;

    // Validate required fields
    if (!merchantOrderId) {
      return NextResponse.json(
        { error: 'Merchant order ID is required' },
        { status: 400 }
      );
    }

    console.log('Verifying payment:', { merchantOrderId, paymentStatus, transactionId, providerReferenceId });

    // Determine payment status based on the 'code' parameter from PhonePe callback
    let paymentStatusResult = 'PAYMENT_FAILED';
    
    if (paymentStatus === 'PAYMENT_SUCCESS') {
      paymentStatusResult = 'PAYMENT_SUCCESS';
    } else if (paymentStatus === 'PAYMENT_PENDING' || paymentStatus === 'PAYMENT_INITIATED') {
      paymentStatusResult = 'PAYMENT_PENDING';
    } else if (paymentStatus === 'PAYMENT_ERROR' || paymentStatus === 'PAYMENT_DECLINED') {
      paymentStatusResult = 'PAYMENT_FAILED';
    } else {
      // If status is unknown or not provided, treat as failed
      paymentStatusResult = 'PAYMENT_FAILED';
    }
    
    // Log the verification result
    console.log('Payment verification result:', {
      merchantOrderId,
      status: paymentStatusResult,
      transactionId,
      providerReferenceId
    });
    
    return NextResponse.json({
      success: paymentStatusResult === 'PAYMENT_SUCCESS',
      status: paymentStatusResult,
      merchantOrderId,
      transactionId,
      providerReferenceId,
      message: `Payment ${paymentStatusResult === 'PAYMENT_SUCCESS' ? 'successful' : paymentStatusResult === 'PAYMENT_PENDING' ? 'pending' : 'failed'}`
    });

  } catch (error: any) {
    console.error('PhonePe payment verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        status: 'PAYMENT_FAILED',
        error: 'Failed to verify payment status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
