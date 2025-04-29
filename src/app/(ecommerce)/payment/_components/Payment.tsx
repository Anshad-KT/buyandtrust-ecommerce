import { Button } from '@/components/ui/button';
import { Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { usePayment } from '../_context/PaymentContext';
import { AuthService } from '@/services/api/auth-service';
import { Loader2 } from 'lucide-react';

const OrderDetails = ({size,quantity,deliveryExpected,totalPrice,imageUrl,cartProducts,delivery_address}:any) => {
  const { createOrderId,processPayment,onSubmit} = usePayment()
  const [isLoading,setIsLoading] = useState(false)
  return (
    <>
    
    <section className='lg:flex hidden  h-full w-[80%] pt-10   m-auto '>
      <div className='lg:w-1/4 bg-[#E1E9ED]  py-32'>
      <section className='flex h-full w-full  font-bold text-md text-left  items-center flex-col'>
      
         <button className='w-full py-4 bg-[#F4F6FF] border-b  text-left pl-5'>
            Order Quantity
         </button>
         <button className='w-full py-4 bg-[#F4F6FF] border-b  text-left pl-5'>
            Delivery Expected
         </button>
         <button className='w-full py-4 bg-[#F4F6FF] border-b  text-left pl-5'>
            Total price
         </button>
      </section>
       
      </div>
      <div className='lg:w-[65%]  h-full  '>
      <section>
      <button className='w-full py-3 pl-16 text-left text-2xl font-semibold    mt-auto'>
            Payment Details
         </button>
      </section>
      <section className='flex h-full w-full    justify-center items-center flex-col pt-[4.4rem] pb-20 '>
                                                                   
       
         <button className='w-full py-4   font-bold  text-left pl-16'>
         {quantity}
         </button>
         <button className='w-full py-4   font-bold  text-left pl-16'>
         {deliveryExpected}
         </button>
         <button className='w-full py-4   font-bold  text-left pl-16'>
         {totalPrice}
         </button>
      </section>
      <Button 
            onClick={async() => {
              setIsLoading(true)
              const userId = await new AuthService().getUserId();
              if (userId) {
                const userDetails = await new AuthService().getUserDetails(userId);
                
                onSubmit({amount:totalPrice, name:userDetails.name, email:userDetails.email, cartProducts:cartProducts,is_customized_product:false,delivery_address});
            
              }
              setIsLoading(false)
            }}
            className=" bg-gradient-to-b from-[#FF4D4D] to-[#D32F2F] font-bold text-lg text-white py-6 w-3/4 ml-16 rounded-none"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Loading..." : "Confirm"}
          </Button>
      </div>
      
    </section>
    </>
    
  );
};

export default OrderDetails;

export const OrderConfirmationMobile = ({orderDetails,delivery_address}:any) => {
  
  const {isLoading,createOrderId,processPayment,onSubmit} = usePayment()
   const [isLoadingOne,setIsLoadingOne] = useState(false)
  const orderDetail = [
        
      
      { label: "Quantity", value: orderDetails?.reduce((acc:any, detail:any) => acc + Number(detail.quantity), 0) },
      { label: "Delivery Expected", value: orderDetails[0]?.delivery_date ? new Date(orderDetails[0]?.delivery_date).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'}).split('/').join('-') : '' },
      { label: "Total price", value: orderDetails?.reduce((acc:any, detail:any) => acc + Number(detail.purchase_price*detail.quantity), 0) },
    ];
  
    return (
      <div className="lg:hidden block  w-[95%] mx-auto space-y-4">
        
        
        <Card className="bg-[#F4F6FF] border border-gray-700 rounded-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              {orderDetail?.map((detail, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{detail.label}</span>
                 <span className="font-medium">{detail.value}</span> 
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
  
        <Button 
         onClick={async() => {
          setIsLoadingOne(true)
          const userId = await new AuthService().getUserId();
          if (userId) {
            const userDetails = await new AuthService().getUserDetails(userId);
        
            onSubmit({amount:orderDetails?.reduce((acc:any, detail:any) => acc + Number(detail.purchase_price), 0)||"2000", name:userDetails.name, email:userDetails.email, cartProducts:orderDetails,is_customized_product:false,delivery_address});
        
          }
          setIsLoadingOne(false)
        }}
            className=" bg-gradient-to-b from-[#FF4D4D] to-[#D32F2F] font-bold text-lg text-white py-6 w-full mt-5  rounded-none"
          >
           {isLoadingOne && <Loader2 className="w-4 h-4 animate-spin" />}
           {isLoadingOne ? "Loading..." : "Confirm"}
          </Button> 
      </div>
    );
  };