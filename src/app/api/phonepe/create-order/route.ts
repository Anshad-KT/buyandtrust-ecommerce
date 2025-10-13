import { NextRequest, NextResponse } from 'next/server';
import { StandardCheckoutClient, Env, CreateSdkOrderRequest } from 'pg-sdk-node';
import { randomUUID } from 'crypto';

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
    const { amount, orderId, customerInfo } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Generate unique merchant order ID (or use provided orderId)
    const merchantOrderId = orderId || `ORDER_${randomUUID()}`;

    // Construct redirect URLs with merchant order ID as parameter
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/payment/callback?merchantOrderId=${merchantOrderId}`;

    // Initialize PhonePe client
    const client = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      Number(clientVersion),
      env
    );

    // Create payment request
    const paymentRequest = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(Number(amount))
      .redirectUrl(redirectUrl)
      .build();

    // Call PhonePe API
    const response = await client.pay(paymentRequest);

    // Return checkout URL to client
    return NextResponse.json({
      success: true,
      redirectUrl: response.redirectUrl,
      merchantOrderId,
    });

  } catch (error: any) {
    console.error('PhonePe order creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create payment order',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
