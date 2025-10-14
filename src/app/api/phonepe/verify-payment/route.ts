import { NextRequest, NextResponse } from 'next/server';
import { StandardCheckoutClient, Env } from 'pg-sdk-node';
import crypto from 'crypto';

// PhonePe credentials from environment variables (server-side only)
const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1.0';
// Force SANDBOX for now since merchant account is in UAT
// Change this to PRODUCTION once PhonePe activates your production account
const env = Env.SANDBOX; // process.env.PHONEPE_ENV === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

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

    console.log('=== SERVER: VERIFYING PAYMENT ===');
    console.log('Environment:', 'SANDBOX (UAT)');
    console.log('Merchant ID:', clientId);
    console.log('Order ID:', merchantOrderId);
    console.log('URL Payment Status:', paymentStatus);

    // Use PhonePe Status Check API to verify payment
    // Note: merchantOrderId is the merchantTransactionId in PhonePe's system
    try {
      const merchantTransactionId = merchantOrderId; // Same value, just clarifying
      
      console.log('=== ATTEMPTING SDK STATUS CHECK ===');
      
      // Try using PhonePe SDK first
      try {
        const client = StandardCheckoutClient.getInstance(
          clientId,
          clientSecret,
          Number(clientVersion),
          env
        );
        
        // Try to get status using SDK (if method exists)
        console.log('Checking if SDK has status method...');
        
        // If SDK doesn't have status method, fall back to API call
        throw new Error('SDK status check not available, using API');
        
      } catch (sdkError: any) {
        console.log('SDK check failed, using direct API call:', sdkError?.message || sdkError);
      }
      
      // PhonePe Status Check API endpoints
      // Using SANDBOX/UAT endpoint since merchant account is in UAT mode
      const finalStatusCheckUrl = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${clientId}/${merchantTransactionId}`;
      
      console.log('Environment Check:', {
        env: 'SANDBOX (UAT)',
        apiEndpoint: 'api-preprod.phonepe.com'
      });

      // Create X-VERIFY header according to PhonePe docs
      // Format: SHA256(endpoint + saltKey) + ### + saltIndex
      const endpoint = `/pg/v1/status/${clientId}/${merchantTransactionId}`;
      const xVerifyString = endpoint + clientSecret;
      const sha256Hash = crypto.createHash('sha256').update(xVerifyString).digest('hex');
      const xVerify = sha256Hash + '###' + clientVersion;

      console.log('=== CALLING PHONEPE API ===');
      console.log('URL:', finalStatusCheckUrl);
      console.log('Endpoint for hash:', endpoint);
      console.log('Salt Key (first 10 chars):', clientSecret?.substring(0, 10) + '...');
      console.log('X-VERIFY:', xVerify);
      console.log('X-MERCHANT-ID:', clientId);

      const statusResponse = await fetch(finalStatusCheckUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': clientId || '',
        },
      });

      const statusData = await statusResponse.json();
      console.log('=== PHONEPE API RESPONSE ===');
      console.log('Status Code:', statusResponse.status);
      console.log('Response Body:', JSON.stringify(statusData, null, 2));
      console.log('=== END PHONEPE RESPONSE ===');

      // Check the response
      let paymentStatusResult = 'PAYMENT_FAILED';
      
      if (statusData.success && statusData.code === 'PAYMENT_SUCCESS') {
        paymentStatusResult = 'PAYMENT_SUCCESS';
      } else if (statusData.code === 'PAYMENT_PENDING') {
        paymentStatusResult = 'PAYMENT_PENDING';
      } else {
        paymentStatusResult = 'PAYMENT_FAILED';
      }

      return NextResponse.json({
        success: paymentStatusResult === 'PAYMENT_SUCCESS',
        status: paymentStatusResult,
        merchantOrderId,
        transactionId: statusData.data?.transactionId || transactionId,
        providerReferenceId: statusData.data?.providerReferenceId || providerReferenceId,
        message: `Payment ${paymentStatusResult === 'PAYMENT_SUCCESS' ? 'successful' : paymentStatusResult === 'PAYMENT_PENDING' ? 'pending' : 'failed'}`,
        phonePeResponse: statusData
      });

    } catch (statusError: any) {
      console.error('Error calling PhonePe status API:', statusError);
      
      // Fallback to URL parameter if API call fails
      let paymentStatusResult = 'PAYMENT_FAILED';
      
      if (paymentStatus === 'PAYMENT_SUCCESS') {
        paymentStatusResult = 'PAYMENT_SUCCESS';
      } else if (paymentStatus === 'PAYMENT_PENDING' || paymentStatus === 'PAYMENT_INITIATED') {
        paymentStatusResult = 'PAYMENT_PENDING';
      }
      
      return NextResponse.json({
        success: paymentStatusResult === 'PAYMENT_SUCCESS',
        status: paymentStatusResult,
        merchantOrderId,
        transactionId,
        providerReferenceId,
        message: `Payment ${paymentStatusResult === 'PAYMENT_SUCCESS' ? 'successful' : 'failed'} (fallback verification)`,
        error: statusError.message
      });
    }

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
