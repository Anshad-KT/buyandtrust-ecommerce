"use client";

import React, { useEffect , useState } from "react";
import { StepProgress } from "./_components/StepProgress";
import  { OrderConfirmationMobile } from "./_components/Payment";
import OrderDetails from "./_components/Payment";
import { makeApiCall } from "@/lib/apicaller";
import { EcomService } from "@/services/api/ecom-service";
import { usePayment } from "./_context/PaymentContext";
import { AuthService } from "@/services/api/auth-service";
 

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
    const fetchCartProducts = async () => {
      try {
        const response = await new EcomService().check_cart_exists();
     
        if(response.length > 0){
          const cartProducts = await new EcomService().get_cart_products()
          
          setCartProducts(cartProducts);
         
        } 
      } catch (error) {
        console.error('Error fetching cart products:', error);
      }
    };
    fetchCartProducts();
  }, []);
 const {createOrderId,processPayment,onSubmit} = usePayment()
 const [isLoading,setIsLoading] = useState(false)
 
  return (
    <div className="container mx-auto lg:px-28 px-5 py-8   ">
      {/* Step Progress */}
      <StepProgress />

       
 
     <> <OrderDetails 
  quantity = {cartProducts.reduce((acc, product) => acc + product.quantity, 0)}
  deliveryExpected = {cartProducts[0]?.delivery_date ? new Date(cartProducts[0]?.delivery_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).split('/').join('-') : ''}
  totalPrice = {cartProducts.reduce((acc, product) => acc + (product.purchase_price * product.quantity), 0)}
  imageUrl = "/trending.svg" cartProducts={cartProducts}  delivery_address={JSON.stringify(address)}/>
  <OrderConfirmationMobile orderDetails={cartProducts} delivery_address={JSON.stringify(address)} /></>
  
 
 
    </div>
  );
}
