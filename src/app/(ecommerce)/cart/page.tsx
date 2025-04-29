"use client";

import React, { useEffect, useState } from "react";
import { StepProgress } from "./_components/StepProgress";
import { MinimumQuantityNotice } from "./_components/MinimumQuantityNotice";
import { ProductCard } from "./_components/ProductCard";
import { PriceDetails } from "./_components/PriceDetails";

import { EcomService } from "@/services/api/ecom-service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
export default function ShoppingCartPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [isTrending, setIsTrending] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [quantities, setQuantities] = useState<number[]>([])
  const [extraPrinting, setExtraPrinting] = useState<boolean[]>([])
 
  useEffect(() => {
    const fetchProducts = async () => {
      const products: any = await new EcomService().get_cart_products()
     
      if (products.length !== 0) {
        setIsTrending(true)
        setProducts(products) 
        const initialNotes = products.map((product: any) => product.notes || '');
        setNotes(initialNotes);
        
        // Initialize extraPrinting array based on products data
        const initialExtraPrinting = products.map((product: any) => 
          product.extra_printing === true ? true : false
        );
        setExtraPrinting(initialExtraPrinting);
   
       setQuantities(Array(products.length).fill(1).map((_, index) => products[index].quantity || 1))
      } else {
        setIsTrending(false)
        setProducts([])
        setNotes([])
      }
    }
    fetchProducts()
  }, [isRefetching])
  

  return (
    <>
      <div className="mb-2 pt-4 pb-1  w-full flex items-center lg:hidden ml-2">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="flex" >
          <div className="flex items-center">
            <ArrowLeft width={20} height={20} className="h-7 w-7" />
          </div>
        </Button>
        <h2 className=" font-bold">Cart</h2>
      </div>
      {products.length !== 0 ? (
        <div className="container mx-auto lg:px-28 px-5 lg:py-8">

          <StepProgress />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left column: product list */}
            <div className="lg:col-span-2 ">
              {/* Minimum Quantity Notice */}
              <MinimumQuantityNotice />

              {/* Products */}
              <section className="
    overflow-y-auto">
                {isTrending && products.map((prod: any, index: number) => (
                  <ProductCard
                    products={products}
                    key={index}
                    idx={index}
                    size_based_stock={prod.size_based_stock}
                    id={prod.cart_product_id}
                    productImage={prod.img_url}
                    productName={prod.product_name}
                    productDescription={prod.product_description}
                    productCode={prod.product_code}
                    quantity={prod.quantity}
                    price={prod.purchase_price}
                    cart_product_id={prod.cart_id}
                    notes={notes}
                    setNotes={setNotes}
                    index={index}
                    extraPrinting={extraPrinting}
                    setExtraPrinting={setExtraPrinting}
                    setQuantities={setQuantities}
                    quantities={quantities}
                    setIsRefetching={setIsRefetching}
                    isRefetching={isRefetching}
                    setSizeDefault={prod.sizes}
                    size={prod.size}
                  />
                ))}
                
              </section>
            </div> 
            <PriceDetails quantity={!isTrending ? products[0]?.no_of_players : null} quantities={quantities} isTrending={isTrending} products={products} notes={notes} cart_product_id={products.map((prod: any) => prod.cart_product_id)} extraPrinting={extraPrinting} />
          </div>
        </div>
      ) : (
        <div className="container gap-5 mx-auto flex flex-col items-center justify-center pt-20">
          <img src="/empty-cart.svg" alt="empty-cart" width={200} />

          <h1 className="text-lg font-bold">Your cart is empty</h1>
          <p className="text-sm text-gray-500">Add items to your cart to continue</p>
          <Link href="/customize" className="border border-[#FF3333]">
            <Button className=" hover:bg-white text-[#FF3333] bg-white font-bold lg:text-sm py-6 mx-auto rounded-none">Book your Jersey Now</Button>
          </Link>
        </div>
      )}
    </>
  );
}
