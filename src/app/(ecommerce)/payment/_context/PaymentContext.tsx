"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
import { EcomService } from "@/services/api/ecom-service";
import { isArray } from "util";

interface PaymentValues {
  amount: string;
  name: string;
  email: string;
  cartProducts: any;
  is_customized_product:boolean
  delivery_address:any
}

interface PaymentContextType {
  isLoading: boolean;
  createOrderId: (amount: string, name: string, email: string) => Promise<string | undefined>;
  processPayment: (values: PaymentValues) => Promise<void>;
  onSubmit: (values: PaymentValues) => Promise<void>;
}

declare global {
  interface Window {
    // ⚠️ notice that "Window" is capitalized here
    Razorpay: any;
  }
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsRazorpayLoaded(true);
    };
    document.body.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
   
  const createOrderId = async (amount: string, name: string, email: string) => {
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount) * 100,
          name, email
        })
      });
      console.log(response)

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data,"data")
      return data.orderId;
    } catch (error) {
      console.error('There was a problem with your fetch operation:', error);
      return error
    }
  };

  const processPayment = async (values: PaymentValues) => {
    try {
      if (!isRazorpayLoaded || typeof window.Razorpay !== 'function') {
        toastWithTimeout(ToastVariant.Default, "Payment gateway not loaded yet. Please try again.");
        setIsLoading(false);
        return;
      }

      const orderId: string = await createOrderId(values?.amount, values?.name, values?.email);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        amount: parseFloat(values?.amount) * 100,
        currency: "INR",
        name: "Bega Sportswear",
        "modal": {
          "ondismiss": async function () {
       
            toastWithTimeout(ToastVariant.Default, "Payment Failed")
            setIsLoading(false)
          }
        },
        description: 'Bega Sportswear',
        order_id: orderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          const data = {
            orderCreationId: orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          const result = await fetch('/api/verify', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
          });
          const res = await result.json();
          if (res.isOk) {
         
            await new EcomService().createOrder(
              values.is_customized_product ? isArray(values.cartProducts) ? values.cartProducts[0] : values.cartProducts : null, 
              values.is_customized_product,
              values.delivery_address,
              !values.is_customized_product ?
              values.cartProducts.map((product: any) => ({
                product_id: product.product_id,
                quantity: product.quantity,
                sizes: product.sizes,
                notes: product.notes,
                extra_printing: product.extra_printing
              })) : null
            )
            
            if(values.is_customized_product){
              await new EcomService().remove_customized_cart(values.cartProducts.customized_cart_id)
            }else{
              await new EcomService().remove_cart(values.cartProducts[0].cart_id)
            }
            toastWithTimeout(ToastVariant.Default, "Payment Successful")
            router.push('/profile/orders')
          }
          else {
            toastWithTimeout(ToastVariant.Default, "Payment Failed")
          }
          setIsLoading(false)
        },
        prefill: {
          name: values.name || "",
          email: values.email || "",
        },
        theme: {
          color: '#FB3F6C',
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function () {
        setIsLoading(false);
        toastWithTimeout(ToastVariant.Default, "Payment Failed");
      });
      paymentObject.open();
    } catch (error) {
      toastWithTimeout(ToastVariant.Default, "Payment Failed");
     
      setIsLoading(false);
    }
  };

  async function onSubmit(values: PaymentValues) {
  
    setIsLoading(true)
    processPayment(values)
  }

  return (
    <PaymentContext.Provider value={{ isLoading, createOrderId, processPayment, onSubmit }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
