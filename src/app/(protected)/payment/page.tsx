"use client";

import React, { useEffect, useRef, useState } from "react";
// import  { OrderConfirmationMobile } from "./_components/Payment";
import OrderDetails from "./_components/Payment";
import { makeApiCall } from "@/lib/apicaller";
import { EcomService } from "@/services/api/ecom-service";
// import { usePayment } from "./_context/PaymentContext";
import { AuthService } from "@/services/api/auth-service";
// import Breadcrumbs from "@/app/_components/breadcrumps";
import ZipaaraLoader from "../_components/zipaara-loader";
import { useInViewport } from "@/hooks/useInViewport";
 

export default function ShoppingCartPage() { 
  
  const [cartProducts, setCartProducts] = useState<any[]>([])
  const [isAddressLoading, setIsAddressLoading] = useState(true)
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)
  const [isExitingLoader, setIsExitingLoader] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isPageLoading = isAddressLoading || isCartLoading

  const [address, setAddress] = useState<any>({
    full_address: "",
    landmark: "",
    city: "",
    state: "",
    pin_code: "",
  })
  const hasEntered = useInViewport(sectionRef, {
    threshold: 0.1,
    once: true,
    enabled: !showLoader && !isPageLoading,
  })
  useEffect(() => {
    makeApiCall(
      async () => new AuthService().get_user_address(await new AuthService().getUserId() || ""),
      {
        afterSuccess: (data: any) => {
          setAddress(data)
          setIsAddressLoading(false)
        },
        afterError: () => {
          setIsAddressLoading(false)
        },
      }
    )
  }, [])
  useEffect(() => {
    makeApiCall(
      async () => {
        const response = await new EcomService().check_cart_exists();
        if (response.length > 0) {
          // Get product details from API
          const cartProducts = await new EcomService().get_cart_products();
       // Get quantities from localStorage
          const localStorageProducts = JSON.parse(localStorage.getItem('cart_products_data') || '[]');
        
          // Map through API products and add quantities from localStorage
          const productsWithQuantities = cartProducts.map((product: any) => {
            const localProduct = localStorageProducts.find((p: any) => p.item_id === product.item_id);
            return {
              ...product,
              cartquantity: localProduct?.localQuantity || 0
            };
          });

          return productsWithQuantities;
        }
        return [];
      },
      {
        afterSuccess: (productsWithQuantities: any[]) => {
          if (productsWithQuantities && productsWithQuantities.length > 0) {
        
            setCartProducts(productsWithQuantities);
      
          } else {
            setCartProducts([]);
          }
          setIsCartLoading(false)
        },
        afterError: () => {
          setCartProducts([]);
          setIsCartLoading(false)
        }
      }
    );
  }, []);

  useEffect(() => {
    if (!isPageLoading && showLoader) {
      setIsExitingLoader(true)
    }
  }, [isPageLoading, showLoader])

  const handleLoaderExitComplete = () => {
    setShowLoader(false)
  }

  const getProductQuantity = (product: any) =>
    Number(product?.localQuantity ?? product?.cartquantity ?? product?.quantity ?? 1)

  if (showLoader) {
    return (
      <ZipaaraLoader
        isExiting={isExitingLoader}
        onExitComplete={handleLoaderExitComplete}
      />
    )
  }
 
  return (
    <>
      {/* <Breadcrumbs items={[{label: "Payment", href: "/payment", isCurrent: true}]} />  */}
      <div
        ref={sectionRef}
        className="mx-auto py-8 transition-all duration-700 ease-out"
        style={{
          transform: hasEntered ? "translateY(0)" : "translateY(20px)",
          opacity: hasEntered ? 1 : 0,
        }}
      >
        {/* Step Progress */}
        {/* <StepProgress /> */}
        <OrderDetails 
          quantity={cartProducts.reduce((acc, product) => acc + getProductQuantity(product), 0)}
          deliveryExpected={cartProducts[0]?.delivery_date ? new Date(cartProducts[0]?.delivery_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).split('/').join('-') : ''}
          totalPrice={cartProducts.reduce((acc, product) => acc + (Number(product.sale_price || 0) * getProductQuantity(product)), 0)}
          imageUrl="/trending.svg"
          cartProducts={cartProducts}
          delivery_address={JSON.stringify(address)}
        />
        {/* <OrderConfirmationMobile orderDetails={cartProducts} delivery_address={JSON.stringify(address)} /> */}
      </div>
    </>
  );
}
