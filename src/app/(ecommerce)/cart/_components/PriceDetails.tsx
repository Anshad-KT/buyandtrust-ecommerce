"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EcomService } from "@/services/api/ecom-service";
import { useRouter } from "next/navigation";
import { toastWithTimeout } from "@/hooks/use-toast";
import { ToastVariant } from "@/hooks/use-toast";

interface PriceDetailsProps {
  products: any;
  notes: string
  cart_product_id: string[]
  isTrending: boolean
  quantity: number
  quantities: number[]
  extraPrinting: boolean[]
}

export function PriceDetails({ products, notes ,cart_product_id,isTrending,quantities,quantity,extraPrinting}: PriceDetailsProps) {
   
  const totalItems = isTrending ? quantities.reduce((acc:number, quantity:number) => acc + quantity, 0) : products.length
  const totalMRP = isTrending ? products.reduce((acc:number, product:any, index:number) => acc + product.purchase_price*quantities[index], 0) : 2000
 
  const router = useRouter()
  return (
    <div className="space-y-6 lg:pb-0 pb-5 lg:block flex flex-col-reverse gap-5">
      {/* Delivery Notice */}
        {/* Save and Update Button */}
        <button  onClick={async () => {
 
 if(isTrending){
        const productsWithInvalidSizes = products.filter((product: any, index: number) => {
          if (!product.sizes) return true;
          
          const totalSizeQuantity = product.sizes.reduce((sum: number, size: any) => sum + size.quantity, 0);
          
          const expectedQuantity = quantities[index];
          
          
          return totalSizeQuantity !== expectedQuantity;
        });
      
        if(productsWithInvalidSizes.length > 0){
          toastWithTimeout(ToastVariant.Default,"Please select a size for all products")
          return
        }
        for (let i = 0; i < cart_product_id.length; i++) {
        
          await new EcomService().update_cart_notes(notes[i], quantities[i], cart_product_id[i],extraPrinting[i])
        }
      }
         
        router.push("/address")
      }} className="bg-gradient-to-b lg:hidden block from-[#FF4D4D] to-[#D32F2F] text-white py-3 px-7 w-full">
        Save And Update
      </button>
      <Card className="bg-red-50 rounded-none"> 
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="shrink-0">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                  fill="#FF4141"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.8 14.9625L10.4003 5.44035C10.3204 3.53651 13.6779 3.48114 13.5997 5.36042L13.2 14.9625C13.1727 15.6182 12.661 16.1624 12.0001 16.1624C11.3393 16.1624 10.8277 15.6228 10.8 14.9625Z"
                  fill="white"
                />
                <path
                  d="M13.2014 18.8032C13.2014 18.1397 12.6635 17.6018 12.0001 17.6018C11.3366 17.6018 10.7987 18.1397 10.7987 18.8032C10.7987 19.4666 11.3366 20.0045 12.0001 20.0045C12.6635 20.0045 13.2014 19.4666 13.2014 18.8032Z"
                  fill="white"
                />
              </svg>
            </div>
            <div className="text-sm">
              <p className="text-gray-600 lg:pt-2">
                {isTrending ? "Delivery charges may vary depending on your location.Final charges will be calculated at checkout based on your delivery address." : "A ₹2000 advance is required at purchase, with the remaining amount charged upon order completion."}
                
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card className="rounded-none bg-[#EAEAEC]">
        <CardContent className="p-4">
          <h3 className="mb-4  text-black font-bold underline">Price Details</h3>
          <div className="space-y-2 text-[#757575]">
            <div className="flex justify-between">
              <span>Total Items</span>
              <span>{!isTrending ? quantity : totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Total {isTrending ? "MRP" : "Advance"}</span>
              <span className="font-medium">
                {isTrending ? "₹" + totalMRP.toLocaleString() : "₹" + "2000"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save and Update Button */}
      <button onClick={async () => {
 
 if(isTrending){
        const productsWithInvalidSizes = products.filter((product: any, index: number) => {
          if (!product.sizes) return true;
          
          const totalSizeQuantity = product.sizes.reduce((sum: number, size: any) => sum + size.quantity, 0);
          
          const expectedQuantity = quantities[index];
          
          
          return totalSizeQuantity !== expectedQuantity;
        });
      
        if(productsWithInvalidSizes.length > 0){
          toastWithTimeout(ToastVariant.Default,"Please select a size for all products")
          return
        }
        for (let i = 0; i < cart_product_id.length; i++) {
        
          await new EcomService().update_cart_notes(notes[i], quantities[i], cart_product_id[i],extraPrinting[i])
        }
      }
         
        router.push("/address")
      }} className="bg-gradient-to-b lg:block hidden  from-[#FF4D4D] to-[#D32F2F] text-white py-3 px-7 w-full">
        Save And Update
      </button>
    </div>
  );
}
