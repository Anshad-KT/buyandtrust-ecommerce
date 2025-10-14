'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useLogin } from '@/app/LoginContext';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCartItemCount } = useLogin();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      // Get merchant order ID and status from URL
      const merchantOrderId = searchParams.get('merchantOrderId');
      const phonePeOrderId = searchParams.get('phonePeOrderId') || sessionStorage.getItem('phonepe_order_id');
      const code = searchParams.get('code'); // PhonePe sends 'code' parameter
      const transactionId = searchParams.get('transactionId');
      const providerReferenceId = searchParams.get('providerReferenceId');

      console.log('Payment callback - merchantOrderId:', merchantOrderId);
      console.log('Payment callback - phonePeOrderId:', phonePeOrderId);
      console.log('Payment callback - code:', code);
      console.log('Payment callback - transactionId:', transactionId);

      if (!merchantOrderId) {
        setStatus('failure');
        setMessage('Invalid payment session. Please try again.');
        return;
      }

      // PhonePe sends 'code' parameter: PAYMENT_SUCCESS, PAYMENT_ERROR, etc.
      // If code is present and is PAYMENT_SUCCESS, we can proceed
      const urlPaymentStatus = code || 'UNKNOWN';

      console.log('=== PAYMENT VERIFICATION START ===');
      console.log('Environment:', process.env.PHONEPE_ENV);
      console.log('Sending to verify API:', { 
        merchantOrderId, 
        phonePeOrderId,
        urlPaymentStatus 
      });

      // Wait 5 seconds before verifying to ensure PhonePe has registered the transaction
      // PhonePe needs time to process and make the transaction queryable
      console.log('Waiting 5 seconds before status check...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      try {
        // Verify payment status with PhonePe server-side
        // IMPORTANT: Use our Merchant Reference ID (ORDER_xxx), NOT PhonePe's transaction ID
        // PhonePe's status API works with the merchantTransactionId we sent during creation
        const response = await fetch('/api/phonepe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            merchantOrderId: merchantOrderId, // Use our original ORDER_xxx
            phonePeOrderId: phonePeOrderId, // PhonePe's order ID for reference
            paymentStatus: urlPaymentStatus,
            transactionId,
            providerReferenceId
          }),
        });

        console.log('API Response status:', response.status);
        const result = await response.json();
        console.log('=== PAYMENT VERIFICATION RESULT ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('=== END VERIFICATION ===');

        if (result.success && result.status === 'PAYMENT_SUCCESS') {
          // Payment verified successfully - NOW create the sale
          const pendingOrderData = sessionStorage.getItem('pending_order_data');
          
          if (pendingOrderData) {
            try {
              const orderData = JSON.parse(pendingOrderData);
              
              // Import EcomService dynamically to avoid SSR issues
              const { EcomService } = await import('@/services/api/ecom-service');
              const ecomService = new EcomService();
              
              // Create the sale in database and clear cart
              await ecomService.create_order(orderData, setCartItemCount);
              
              // Clear pending order data
              sessionStorage.removeItem('pending_order_data');
              
              setStatus('success');
              setMessage('Payment completed successfully!');
            } catch (orderError) {
              console.error('Error creating order after payment:', orderError);
              setStatus('failure');
              setMessage('Payment successful but order creation failed. Please contact support with your payment reference.');
            }
          } else {
            // No pending order data found
            console.warn('No pending order data found after successful payment');
            setStatus('success');
            setMessage('Payment completed successfully!');
          }
        } else if (result.status === 'PAYMENT_PENDING') {
          setStatus('failure');
          setMessage('Payment is still pending. Please wait or contact support.');
          // Keep pending order data for retry
        } else {
          setStatus('failure');
          setMessage('Payment failed. Please try again.');
          // Keep pending order data so user can retry payment
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failure');
        setMessage('Unable to verify payment status. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    if (status === 'success') {
      router.push('/profile/orders');
    } else {
      // Redirect back to payment page with cart data intact
      router.push('/payment');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {status === 'loading' && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
              <h2 className="text-2xl font-semibold mb-2">Processing Payment</h2>
              <p className="text-gray-600">{message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'success' && (
        <div className="w-full max-w-4xl mx-auto py-16 px-4 flex flex-col items-center rounded-lg shadow-sm bg-white">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6 border-2 border-green-500">
            <Check className="w-8 h-8 text-green-500 stroke-2" />
          </div>
          
          {/* Success Message */}
          <h2 
            className="text-xl text-gray-700 font-medium mb-8" 
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
          >
            Your order is successfully placed
          </h2>
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-2">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 py-2 px-5 border-2 border-[#FFE7D6] rounded-none bg-white text-gray-600 hover:bg-gray-50 transition text-sm"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_499_31)">
                  <path d="M2.5 13.75L10 18.125L17.5 13.75" stroke="#FA8232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 10L10 14.375L17.5 10" stroke="#FA8232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.5 6.25L10 10.625L17.5 6.25L10 1.875L2.5 6.25Z" stroke="#FA8232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_499_31">
                    <rect width="20" height="20" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
              <span 
                className="text-bold text-[#FA8232]"
                style={{
                  fontWeight: "400",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}
              >
                GO TO DASHBOARD
              </span>
            </button>
            
            <button 
              onClick={() => router.push('/profile/orders')}
              className="flex items-center gap-2 py-2 px-5 border border-orange-500 rounded-none bg-orange-500 text-white hover:bg-orange-600 transition text-sm"
            >
              <span 
                className="text-semibold"
                style={{
                  fontWeight: "400",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}
              >
                VIEW ORDER
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {status === 'failure' && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-semibold mb-2 text-red-700">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
              <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
