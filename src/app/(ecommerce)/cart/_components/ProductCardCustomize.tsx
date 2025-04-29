"use client";
 
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@mui/material";
import SizeChart from "./SizeChart";
import {  X } from "lucide-react";
import DeleteDialogue from "@/components/ui/delete-dialog";
import { EcomService } from "@/services/api/ecom-service";
import { useRouter } from "next/navigation";
import { toastWithTimeout } from "@/hooks/use-toast";
import { ToastVariant } from "@/hooks/use-toast";
interface ProductCardProps {
  productImage: string;
  productName: string;
  productDescription: string;
  cart_product_id: string;
  quantity: number;
  delivery_date: string;
  idx: number
  id: string
}

export function ProductCardCustomize({
  productImage,
  productName,
  productDescription,
  cart_product_id,
  quantity,
  delivery_date,
  idx,
  id
}: ProductCardProps) {
  const router = useRouter()
  return (
    <Card className={`relative lg:py-4 py-0 px-4  ${idx !== 0 && "mt-8"} rounded-none`}>
      {/* Top-right banner & close button */}
      
       
      <CardContent 
        // Switch layout to column on mobile, row on medium screens and up.
        className="flex flex-col md:flex-row items-start relative p-0 gap-5"
      >
        {/**Mobile */}
        <section className="relative w-full md:w-auto lg:mt-10 mt-7 flex lg:hidden">
          <Image
            src={"/customized.svg"}
            alt={productName}
            width={100}
            height={100}
            className="rounded bg-red-500 mx-auto md:mx-0"
          />
           
           
          <CardHeader className="p-0 block lg:hidden lg:mt-0 mt-3">
            <CardTitle>{productName}</CardTitle>
            <CardDescription className="text-[#757575]">
              {productDescription}
            </CardDescription>
           
            
          </CardHeader> 
          
        </section>
        {/* Product image & Checkbox */}
        <section className="relative w-full md:w-auto lg:block hidden">
          <Image
            src={"/customized.svg"}
            alt={productName}
            width={150}
            height={150}
            className="rounded bg-red-500 mx-auto md:mx-0"
          />
          <Checkbox
            className="mt-2 absolute top-0 left-0"
            aria-label="Select Product"
          />
          
        </section>

        {/* Product Details */}
        <div className="flex-1 p-3 w-full relative">
          <CardHeader className="p-0 lg:block hidden">
            <CardTitle>{productName}</CardTitle>
            <CardDescription className="text-[#757575]">
              {productDescription}
            </CardDescription>
          
          </CardHeader>

          {/* Actions: Select size, QTY input, extra printing */}
          <div className="flex lg:flex-wrap items-center gap-4 mt-4">
           
            
             {/**large devices */}
            <div className="lg:flex items-center space-x-2 hidden">
              <TextField
                label="QTY"
                type="number"
                value={quantity}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  inputProps: { min: 0, max: 100 },
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "42px",
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "8px 14px",
                  },
                }}
              />
            </div>
            {/**small devices */}
            <div className="flex items-center w-1/2   space-x-2 lg:hidden">
              <TextField
                label="QTY"
                type="number"
                value={quantity}
                fullWidth={true}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  inputProps: { min: 0, max: 100 },
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "42px",
                    width: "100%" 
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "8px 14px",
                  },
                }}
              />
            </div>
            <DeleteDialogue
            triggerButton={<X className="absolute top-0 right-0 text-black" />}
            onConfirm={async () => {
              await new EcomService().delete_customized_cart(cart_product_id)
              toastWithTimeout(ToastVariant.Default, "Cart removed successfully")
              router.push("/")
            }}
            />
            <button className="lg:text-base text-sm  bg-gradient-to-b lg:w-auto w-1/2 from-[#FF4D4D] to-[#D32F2F] text-white py-2 px-7">
              <a href={`/cart/edit/${cart_product_id}`}>Edit </a>
            </button>
          </div>

          {/* Price and extra printing */}
          <div className="mt-4 text-lg flex justify-between gap-3 sm:gap-0">
            <span>{"advance: " + "₹" + "2000"}</span>
            <span className="text-[#2C2C2C] text-[11px]">
        Order expect <span className="font-bold">{delivery_date}</span>
        </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
