"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@mui/material";
import SizeChart from "./SizeChart";
import { useState } from "react";
import { EcomService } from "@/services/api/ecom-service";
import { toastWithTimeout } from "@/hooks/use-toast";
import { ToastVariant } from "@/hooks/use-toast";
import  CustomDialogue from "@/components/ui/custom-dialogue";
interface ProductCardProps {
  productImage: string;
  productName: string;
  productDescription: string;
  productCode: string;
  quantity: number;
  price: number;
  idx: number
  notes: string[]
  setNotes: (notes: string[]) => void
  cart_product_id: string
  size: any
  id: string
  setIsRefetching: (isRefetching: boolean) => void
  isRefetching: boolean
  setSizeDefault: any
  quantities: number[]
  setQuantities: (quantities: number[]) => void
  index: number
  size_based_stock: any
  products: any
  extraPrinting: boolean[]
  setExtraPrinting: any
}
export function ProductCard({
  productImage,
  productName,
  productDescription,
  productCode,
  quantity,
  size_based_stock,
  notes,
  setSizeDefault,
  setNotes,
  price,
  idx,
  extraPrinting,
  setExtraPrinting ,
  cart_product_id,
  size,
  id,
  setIsRefetching,
  isRefetching,
  quantities,
  setQuantities,
  index,
  products
}: ProductCardProps) { 
 
  const [localQuantity,setLocalQuantity] = useState<number>(quantity)
   
  const [sizes, setSizes] = useState(setSizeDefault ? setSizeDefault.map((s:any) => ({
    label: s.label,
    quantity: s.quantity
  })) : size.map((s: string) => ({
    label: s,
    quantity: 0
  })))
  
   
   
  return (
    <Card className={`relative lg:py-4 py-0 px-4  ${idx !== 0 && "mt-8"} rounded-none`}>
      {/* Top-right banner & close button */}
      <div className="absolute top-2 space-x-2 right-3 flex items-center lg:space-x-2 lg:text-[11px] text-[10px] ">
        <span className="text-[#2C2C2C] "> 
          delivery expected within 10 days of the order date
        </span>
        <CustomDialogue 
          triggerButton={<button
             
            className="w-4 h-4 text-muted-foreground hover:text-foreground"
            aria-label="Close banner"
          >
            <X className="w-4 h-4 font-bold text-black" />
          </button>}
          title="Are you sure?"
          description="This action cannot be undone." onConfirm={async () => {
            if(products.length == 1){
            
              const cart_products = await new EcomService().deleteCart(Number(cart_product_id));
            }else{
              
              const cart_products = await new EcomService().deleteCartProduct(Number(id));
            }

            toastWithTimeout(ToastVariant.Default, "Product Removed from Cart");
            setIsRefetching(!isRefetching);
          } }        />
       
      </div>
      <CardContent 
        className="flex flex-col md:flex-row items-start relative p-0 gap-5"
      >
        {/**Mobile */}
        <section className="relative w-full md:w-auto lg:mt-0 mt-7 flex lg:hidden">
          <Image
            src={"https://iqwgvylkgjaqitnqjldp.supabase.co/storage/v1/object/public/"+productImage}
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
            <p className="text-sm text-muted-foreground mt-1">
             
            </p>
          </CardHeader>
        </section>

        {/* Product image & Checkbox */}
        <section className="relative w-full md:w-auto lg:mt-0 mt-10 lg:block hidden">
          <Image
            src={"https://iqwgvylkgjaqitnqjldp.supabase.co/storage/v1/object/public/"+productImage}
            alt={productName}
            width={150}
            height={150}
            className="rounded bg-red-500 mx-auto md:mx-0"
          />
          
        </section>

        {/* Product Details */}
        <div className="flex-1 p-3 w-full">
          <CardHeader className="p-0 lg:block hidden">
            <CardTitle>{productName}</CardTitle>
            <CardDescription className="text-[#757575]">
              {productDescription}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-1">
              
            </p>
          </CardHeader>

          {/* Actions: Select size, QTY input, extra printing */}
          <div className="flex lg:flex-wrap items-center gap-4 lg:mt-4">
            <SizeChart size_based_stock={size_based_stock} sizes={sizes} setSizes={setSizes} EditComponent={<button className="bg-gradient-to-b lg:w-auto w-1/2 from-[#FF4D4D] to-[#D32F2F] text-white py-2 lg:px-7">
              {setSizeDefault ? "Update Size" : "Select Size"}
            </button>} quantity={localQuantity} cart_product_id={id}  setIsRefetching={setIsRefetching} isRefetching={isRefetching} />
            
            {/**large devices */}
            <div className="lg:flex items-center space-x-2 hidden">
              <TextField
                label="QTY"
                type="number"
                defaultValue={localQuantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value);
                  setLocalQuantity(newQuantity);
                  setQuantities(quantities.map((q, i) => i === index ? newQuantity : q));
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  inputProps: { min: 10, max: 100 },
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
            <div className="relative flex lg:hidden w-1/2"> 
            <div className="flex items-center  space-x-2 w-full lg:hidden">
              <TextField
                label="QTY"
                type="number"
                defaultValue={localQuantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value);
                  setLocalQuantity(newQuantity);
                  setQuantities(quantities.map((q, i) => i === index ? newQuantity : q));
                }}
                fullWidth={true}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  inputProps: { min: 0, max: 100 },
                }}
                value={localQuantity}
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
            <div className="absolute top-1/2 right-3 -translate-y-1/2 gap-0 ml-2">
                  <button 
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => {
                    
                      const currentValue = parseInt(String(localQuantity || "10"));
                      const newValue = currentValue + 1;
                      setQuantities(quantities.map((q, i) => i === index ? newValue : q));
                     
                      setLocalQuantity(newValue);
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700" 
                    onClick={() => {
                      
                      const currentValue = parseInt(String(localQuantity || "10"));
                      const newValue = currentValue - 1;
                     
                      if (newValue >= 10) {
                        setLocalQuantity(newValue);
                        setQuantities(quantities.map((q, i) => i === index ? newValue : q));
                      }
                    }}
                  >
                    ▼
                  </button>
                </div>
            </div>
          </div>

          {/* Price and extra printing */}
          <div className="my-2">
          <div className="text-sm text-[#757575]">Selected size: {setSizeDefault ? setSizeDefault.map((s:any) => `${s.label} (${s.quantity})`).join(', ') : "Please select size"}</div>
          </div>
          <div className=" text-lg font-semibold flex justify-between gap-3 sm:gap-0 w-full">
             
            <div className="w-1/3 lg:w-2/3">₹{price.toLocaleString()}</div>
            <div className="flex flex-col lg:1/3 w-2/3">
              <span className="flex items-center space-x-2">
                <Checkbox id="extra-printing " checked={extraPrinting[index]} onCheckedChange={() => {
                  setExtraPrinting((prev: any) => {
                    const newState = [...prev];
                    newState[index] = !newState[index];
                    return newState;
                  })
                }} />
                <label
                  htmlFor="extra-printing"
                  className="lg:text-sm text-[12px] mt-[0.12rem] font-extralight text-[#2C2C2C]"
                >
                  Need extra printing?
                </label>
              </span>
              <TextField
                defaultValue={notes?.[index]}
                onChange={(e) => {
                 
                  const newNotes = [...notes];
                  newNotes[index] = e.target.value;
                  setNotes(newNotes);
                }}
                label="Notes"
                multiline
                placeholder="Logo and back print"
                size="small"
                fullWidth
                sx={{
                  mt: 2,
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.875rem"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
