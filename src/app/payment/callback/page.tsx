'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { EcomService } from '@/services/api/ecom-service';
import OrderSuccessConfirmation from '@/app/(protected)/payment-confitmation/_components/paysmentSuccess';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [message, setMessage] = useState('Processing payment...');
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      // Get merchant order ID from URL
      const merchantOrderId = searchParams.get('merchantOrderId');

      console.log('Payment callback - merchantOrderId:', merchantOrderId);

      if (!merchantOrderId) {
        setStatus('failure');
        setMessage('Invalid payment session. Please try again.');
        return;
      }

      try {
        // Verify payment status with PhonePe server-side
        const response = await fetch('/api/phonepe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ merchantOrderId }),
        });

        const result = await response.json();
        console.log('Payment verification result:', result);

        if (result.success && result.status === 'PAYMENT_SUCCESS') {
          // Attempt to create order exactly once using pending payload
          try {
            if (typeof window !== 'undefined' && merchantOrderId) {
              const createdFlagKey = `orderCreated:${merchantOrderId}`;
              const pendingKey = `pendingOrder:${merchantOrderId}`;
              const alreadyCreated = localStorage.getItem(createdFlagKey);
              if (!alreadyCreated) {
                const payloadRaw = localStorage.getItem(pendingKey);
                if (payloadRaw) {
                  const payload = JSON.parse(payloadRaw);

                  // Add payment verification response to metadata
                  if (payload.payment_details && payload.payment_details.metadata) {
                    payload.payment_details.metadata.verification_response = {
                      status: result.status,
                      code: result.code,
                      message: result.message,
                      data: result.data || null,
                      verifiedAt: new Date().toISOString(),
                    };
                  }

                  // await new EcomService().create_order(payload);
                  const orderResponse = await new EcomService().create_order(payload);

                  // After successful order creation, settle the payment
                  if (orderResponse && orderResponse.sale_id) {
                    try {
                      const saleId = orderResponse.sale_id;
                      const subTotal = payload.cartProducts.reduce(
                        (acc: number, item: any) => acc + (Number(item.sale_price) * Number(item.localQuantity || 1)),
                        0
                      );
                      const taxAmount = Number(payload.tax_amount || 0);
                      const shippingCharge = Number(payload.shipping_charge || 0);
                      const totalAmount = Number((subTotal + taxAmount + shippingCharge).toFixed(2));

                      const paymentMode = payload.payment_details?.payment_provider || 'online';

                      await new EcomService().settle_sale_payment({
                        sale_id: saleId,
                        amount: totalAmount,
                        payment_mode: paymentMode,
                      });
                      console.log('Payment settled successfully for sale ID:', saleId);
                    } catch (settleErr) {
                      console.error('Failed to settle payment after order creation:', settleErr);
                      // Decide if you want to show a specific message to the user
                    }
                  }

                  // Mark as created and cleanup
                  localStorage.setItem(createdFlagKey, 'true');
                  localStorage.removeItem(pendingKey);
                }
              }
            }
          } catch (orderErr: any) {
            console.error('Order creation after payment failed:', orderErr);
            // If it's a duplicate order error, mark as created anyway since order exists
            if (orderErr?.message?.includes('duplicate key') || orderErr?.message?.includes('Unique constraint')) {
              console.log('Order already exists, marking as created');
              if (typeof window !== 'undefined' && merchantOrderId) {
                localStorage.setItem(`orderCreated:${merchantOrderId}`, 'true');
                localStorage.removeItem(`pendingOrder:${merchantOrderId}`);
              }
            }
          }

          setStatus('success');
          setMessage('Payment completed successfully!');
        } else if (result.status === 'PAYMENT_PENDING') {
          setStatus('failure');
          setMessage('Payment is still pending. Please wait or contact support.');
        } else {
          setStatus('failure');
          setMessage('Payment failed. Please try again.');
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
      router.push('/payment');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {status === 'success' ? (
        <div className="w-full max-w-md">
          <OrderSuccessConfirmation />
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                  <h2 className="text-2xl font-semibold mb-2">Processing Payment</h2>
                  <p className="text-gray-600">{message}</p>
                </>
              )}

              {status === 'failure' && (
                <>
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
                </>
              )}
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
