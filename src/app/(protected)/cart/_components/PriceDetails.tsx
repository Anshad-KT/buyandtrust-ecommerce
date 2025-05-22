"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EcomService } from "@/services/api/ecom-service";
import { useRouter } from "next/navigation";
import { toastWithTimeout } from "@/hooks/use-toast";
import { ToastVariant } from "@/hooks/use-toast";
import { makeApiCall } from "@/lib/apicaller";

interface PriceDetailsProps {
  products: any;
  notes: string
  cart_product_id: string[]
  isTrending: boolean
  quantity: number
  quantities: number[]
  extraPrinting: boolean[]
}

export function PriceDetails({ products, notes, cart_product_id, isTrending, quantities, quantity, extraPrinting}: PriceDetailsProps) {
   
  const totalItems = isTrending ? quantities.reduce((acc:number, quantity:number) => acc + quantity, 0) : products.length
  const totalMRP = isTrending ? products.reduce((acc:number, product:any, index:number) => acc + product.sale_price*quantities[index], 0) : 2000
  const deliveryFee = "Free"
  // const tax = "₹0"
  const total = `₹${totalMRP.toLocaleString()}`
 
  const router = useRouter()
  return (
    <div className=" lg:pb-0 pb-5 lg:block flex flex-col-reverse gap-5">
      {/* Mobile Save and Update Button */}
      <button onClick={async () => {
        if(isTrending){
          for (let i = 0; i < cart_product_id.length; i++) {
            await makeApiCall(
              () => new EcomService().update_cart_notes(notes[i], quantities[i], cart_product_id[i], extraPrinting[i]),
              {}
            )
          }
        }
        
        router.push("/payment")
      }} className="bg-gradient-to-b lg:hidden block from-[#FA8232] to-[#FA8232] text-white py-3 px-7 w-full">
        Proceed to Checkout
      </button>
       

      {/* Price Breakdown */}

      <Card className="rounded-none bg-white border border-gray-200 shadow-none">
        <CardContent className="p-4">
          <h3 className="mb-4 text-black font-bold">Cart Totals</h3>
          <div className="space-y-2 text-[#757575]">
            <div className="flex justify-between">
              <span>Total Items</span>
              <span>{!isTrending ? quantity : totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Sub total</span>
              <span className="font-medium">
                {isTrending ? "₹" + totalMRP.toLocaleString() : "₹" + "2000"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-green-600">{deliveryFee}</span>
            </div>
            {/* <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-medium">{tax}</span>
            </div> */}
            <div className="border-t border-gray-300 my-2 pt-2"></div>
            <div className="flex justify-between font-bold text-black">
              <span>Total</span>
              <span>{total}</span>
            </div>
          </div>
                {/* Desktop Proceed to Checkout Button */}
          <button onClick={async () => {
            if(isTrending){
              for (let i = 0; i < cart_product_id.length; i++) {
                await makeApiCall(
                  () => new EcomService().update_cart_notes(notes[i], quantities[i], cart_product_id[i], extraPrinting[i]),
                  {}
                )
              }
            }
            
            router.push("/payment")
          }} className="mt-3 bg-gradient-to-b lg:block font-bold hidden from-[#FA8232] to-[#FA8232] text-white py-3 px-7 w-full">
            Proceed to Checkout
          </button>
        </CardContent>
        
      </Card>


    </div>
  );
}
