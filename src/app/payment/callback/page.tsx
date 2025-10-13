'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failure'>('loading');
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
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

            {status === 'success' && (
              <>
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-semibold mb-2 text-green-700">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button
                  onClick={handleContinue}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  View Orders
                </Button>
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
