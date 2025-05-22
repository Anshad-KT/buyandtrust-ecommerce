"use client";

import React, { useEffect , useState } from "react";
// import  { OrderConfirmationMobile } from "./_components/Payment";
import OrderDetails from "./_components/Payment";
import { makeApiCall } from "@/lib/apicaller";
import { EcomService } from "@/services/api/ecom-service";
// import { usePayment } from "./_context/PaymentContext";
import { AuthService } from "@/services/api/auth-service";
// import Breadcrumbs from "@/app/_components/breadcrumps";
 

export default function ShoppingCartPage() { 
  
  const [cartProducts, setCartProducts] = useState<any[]>([])

  const [address, setAddress] = useState<any>({
    full_address: "",
    landmark: "",
    city: "",
    state: "",
    pin_code: "",
  })
  useEffect(() => {
    makeApiCall(
      async () => new AuthService().get_user_address(await new AuthService().getUserId() || ""),
      {
        afterSuccess: (data: any) => {
          setAddress(data)
        }
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
          console.log("Product details from API:", cartProducts);

          // Get quantities from localStorage
          const localStorageProducts = JSON.parse(localStorage.getItem('cart_products_data') || '[]');
          console.log("Quantities from localStorage:", localStorageProducts);

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
            console.log("Final products with quantities:", productsWithQuantities);
            setCartProducts(productsWithQuantities);
            console.log("🛒 cartProducts updated:", productsWithQuantities);
          }
        }
      }
    );
  }, []);
 
  return (
    <>
      {/* <Breadcrumbs items={[{label: "Payment", href: "/payment", isCurrent: true}]} />  */}
      <div className="mx-auto py-8">
        {/* Step Progress */}
        {/* <StepProgress /> */}
        <OrderDetails 
          quantity={cartProducts.reduce((acc, product) => acc + product.localQuantity, 0)}
          deliveryExpected={cartProducts[0]?.delivery_date ? new Date(cartProducts[0]?.delivery_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).split('/').join('-') : ''}
          totalPrice={cartProducts.reduce((acc, product) => acc + (product.sale_price * product.localQuantity), 0)}
          imageUrl="/trending.svg"
          cartProducts={cartProducts}
          delivery_address={JSON.stringify(address)}
        />
        {/* <OrderConfirmationMobile orderDetails={cartProducts} delivery_address={JSON.stringify(address)} /> */}
      </div>
    </>
  );
}
