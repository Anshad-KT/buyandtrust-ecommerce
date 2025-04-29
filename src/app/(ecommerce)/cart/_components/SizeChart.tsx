import * as React from "react"

import { Input } from "@mui/material";

import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useState } from "react";
import QuantityCounter from "@/components/Counter";
import { EcomService } from "@/services/api/ecom-service";
import { toastWithTimeout } from "@/hooks/use-toast";
import { ToastVariant } from "@/hooks/use-toast";
import { makeApiCall } from "@/lib/apicaller";

 
export default function SizeChart({ EditComponent, quantity,cart_product_id,sizes,setSizes,setIsRefetching,isRefetching,size_based_stock }: { EditComponent: React.ReactNode, quantity: number,cart_product_id:string,sizes:any,setSizes:any,setIsRefetching:any,isRefetching:any,size_based_stock:any }) {
 

  const handleIncrement = (index: number) => {
    setSizes((prev:any) => {
      const currentTotal = prev.reduce((sum:any, size:any) => sum + size.quantity, 0)
      
      // Check if quantity is defined and we haven't exceeded it
      if (typeof quantity === 'undefined' || currentTotal >= quantity) {
        return prev
      }

      const updated = [...prev]
      const currentSize = updated[index]
      
      // Check stock availability for this size
      const stockForSize = size_based_stock[currentSize.label]
      
      // Only increment if:
      // 1. We haven't reached total quantity
      // 2. Stock is available for this size
      // 3. Current size quantity is less than available stock
      if (currentTotal < quantity && 
          typeof stockForSize !== 'undefined' && 
          stockForSize > 0 &&
          currentSize.quantity < stockForSize) {
        
        currentSize.quantity = currentSize.quantity + 1
      }

      return updated
    })
  }
  const [open, setOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const handleDecrement = (index: number) => {
    setSizes((prev:any) => {
      const updated = [...prev]
      if (updated[index].quantity > 0) {
        updated[index].quantity--
      }
      return updated
    })
  }

  const updateSizes = async () => {
 
    
    makeApiCall(
      ()=> new EcomService().update_cart_size(sizes, cart_product_id,quantity),
      {
       
        
        afterSuccess: () => {
          setOpen(false)
          setIsRefetching(!isRefetching)
          toastWithTimeout(ToastVariant.Default,"Size updated successfully")
        },
        afterError: () => {
          setOpen(false)
          setIsRefetching(!isRefetching)
          toastWithTimeout(ToastVariant.Default,"Size update failed")
        }
      }
    )
    
    
  }
 
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {EditComponent}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md z-[1000]">
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <SheetTitle>Size Chart</SheetTitle>
        </SheetHeader>

        <div  className="space-y-4 pt-4 ">
          {sizes.map((size:any, index:any) => (
            <QuantityCounter
              key={size.label}
              size={size.label}
              quantity={size.quantity}
              onIncrement={() => handleIncrement(index)}
              onDecrement={() => handleDecrement(index)}
            />
          ))}

          <Button
            type="submit"
            onClick={() => updateSizes()}
            className="w-full bg-red-500 hover:bg-red-600 rounded-none text-white"
          >
            Update
          </Button>
          
        </div>
      </SheetContent>
    </Sheet>
  )
}
