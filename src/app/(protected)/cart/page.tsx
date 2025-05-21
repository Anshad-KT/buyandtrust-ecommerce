"use client";

import React, { useState, useEffect } from "react";
import { PriceDetails } from "./_components/PriceDetails";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, X, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { EcomService } from "@/services/api/ecom-service";
import Image from "next/image";
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
interface CartProduct {
  item_id: string;
  id: string;
  quantity: number;
  notes?: string;
  extra_printing?: boolean;
  [key: string]: any;
}

interface ItemDetail {
  item_id: string;
  [key: string]: any;
}

export default function ShoppingCartPage() {
  const router = useRouter();
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [quantities, setQuantities] = useState<number[]>([1]);
  const [extraPrinting, setExtraPrinting] = useState<boolean[]>([false]);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [isTrending, setIsTrending] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Get products using EcomService
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const ecomService = new EcomService();
        const fetchedProducts = await ecomService.get_cart_products();
        
        if (fetchedProducts && fetchedProducts.length > 0) {
          // Set the products to state
          setProducts(fetchedProducts);
          
          // Initialize notes based on products data
          const initialNotes = fetchedProducts.map((product: CartProduct) => product.notes || '');
          setNotes(initialNotes);
          
          // Initialize extraPrinting array based on products data
          const initialExtraPrinting = fetchedProducts.map((product: CartProduct) => 
            product.extra_printing === true ? true : false
          );
          setExtraPrinting(initialExtraPrinting);
          
          // Initialize quantities based on products data
          setQuantities(fetchedProducts.map((product: CartProduct) => product.localQuantity || 1));
          console.log("fetchedProducts",fetchedProducts)
          
          
          setIsTrending(true);
        } else {
          setIsTrending(false);
          setProducts([]);
          setNotes("");
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
        setIsTrending(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [isRefetching]);
  
  const handleRemoveItem = async (productId: string, cartId: string) => {
    try {
      const ecomService = new EcomService();

      await ecomService.deleteCartProduct(productId);
      console.log("productId", productId);

      setIsRefetching(!isRefetching);

      // Show toast on success
      toastWithTimeout(ToastVariant.Default,"Item removed from cart")
      
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleQuantityChange = async (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      const updatedQuantities = [...quantities];
      updatedQuantities[index] = newQuantity;
      setQuantities(updatedQuantities);
      
      const product = products[index];
      const ecomService = new EcomService();
      await ecomService.update_cart_quantity(product.item_id, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  return (
    <>
      
      {isLoading ? (
        <div className="container mx-auto flex justify-center items-center py-20">
          <div className="animate-pulse">Loading cart...</div>
        </div>
      ) : products.length !== 0 ? (
        <div className="mx-auto lg:py-8">
          {/* <StepProgress /> */}
          

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left column: product list */}
            <div className="lg:col-span-2">
            <div className="border border-gray-200 rounded-none overflow-hidden mb-4 lg:mt-0 mt-4">
              {/* Shopping Cart Header */}
              <h2 className="font-semibold text-lg mb-2 px-4 py-5">Shopping Cart</h2>
              <div className="bg-[#E4E7E9] border border-gray-300 p-4 mb-4">
                
                <div className="grid grid-cols-12 gap-4 font-medium text-gray-500">
                  <div className="col-span-6">PRODUCTS</div>
                  <div className="col-span-3 text-center">QUANTITY</div>
                  <div className="col-span-3 text-right">SUB-TOTAL</div>
                </div>
              </div>
              
              {/* Products List */}
              
                <section className="overflow-y-auto">
                  {isTrending && products.map((prod: CartProduct, index: number) => (
                    console.log("prod", prod),
                    <div key={prod.id || index} className="border-b border-gray-200 p-4 last:border-b-0">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Remove Button */}
                        <div className="col-span-1">
                          <button 
                            onClick={() => handleRemoveItem(prod.item_id, prod.cart_id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        
                        {/* Product Image & Name */}
                        <div className="col-span-5 flex items-center gap-3">
                          <Image
                            src={prod.images?.[0]?.url || prod.images?.find((img: { url: string }) => img.url)?.url || prod.image}
                            alt={prod.name}
                            width={60}
                            height={60}
                            className="rounded-none object-cover"
                          />
                          <div>
                            <h3 className="font-extrabold font-family-futura text-sm">{prod.name}</h3>
                            
                          </div>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="col-span-3 flex justify-center">
                          <div className="flex items-center border border-gray-300 rounded-none w-24">
                            <button 
                              type="button"
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                              onClick={() => handleQuantityChange(index, quantities[index] - 1)}
                            >
                              −
                            </button>
                            <span className="px-3 py-1">{quantities[index]}</span>
                            <button 
                              type="button"
                              className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                              onClick={() => handleQuantityChange(index, quantities[index] + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="col-span-3 text-right font-semibold">
                          ₹{((prod.sale_price || prod.purchase_price) * quantities[index]).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
                              {/* Return to Shop Button */}
              <div className="mt-6 mb-8">
                <Link href="/product">
                  <Button 
                    className="bg-white text-[#1E1E2A] rounded-none flex items-center gap-2 border-2 border-[#1E1E2A] hover:bg-[#1E1E2A] hover:text-white py-3 px-6 text-lg font-bold uppercase"
                  >
                    <ArrowLeft size={19} />
                    <span>RETURN TO SHOP</span>
                  </Button>
                </Link>
              </div>
              </div>

            </div>
            <PriceDetails 
              quantity={!isTrending ? products[0]?.no_of_players || 0 : 0} 
              quantities={quantities} 
              isTrending={isTrending} 
              products={products} 
              notes={notes} 
              cart_product_id={products.map((prod: CartProduct) => prod.id)} 
              extraPrinting={extraPrinting} 
            />
          </div>
        </div>
      ) : (
        <div className="container gap-6 mx-auto flex flex-col items-center justify-center py-16">
          <Image 
            src="/emptycart.svg" 
            alt="Empty cart" 
            width={200} 
            height={200}
            className="mb-4"
          />

          <h1 className="text-xl font-bold">Your cart is empty</h1>
          <p className="text-sm text-gray-500 mb-4">Looks like you haven't added any items to your cart yet</p>
          <Link href="/product">
            <Button className="hover:bg-[#060303] hover:border-[#060303] hover:text-white text-black bg-white font-bold lg:text-sm py-4 px-6 rounded-none border-2 border-black transition-colors duration-300">
              Grab Yours Before It's Gone
            </Button>
          </Link>
        </div>
      )}
      {/* <Footer /> */}
    </>
  );
}



// "use client";

// import React, { useEffect, useState } from "react";
// import { StepProgress } from "./_components/StepProgress";
// import { MinimumQuantityNotice } from "./_components/MinimumQuantityNotice";
// import { ProductCard } from "./_components/ProductCard";
// import { PriceDetails } from "./_components/PriceDetails";

// import { EcomService } from "@/services/api/ecom-service";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";
// export default function ShoppingCartPage() {
//   const router = useRouter();
//   const [products, setProducts] = useState<any>([])
//   const [notes, setNotes] = useState<any>([])
//   const [isTrending, setIsTrending] = useState(false)
//   const [isRefetching, setIsRefetching] = useState(false)
//   const [quantities, setQuantities] = useState<number[]>([])
//   const [extraPrinting, setExtraPrinting] = useState<boolean[]>([])
 
//   useEffect(() => {
//     const fetchProducts = async () => {
//       const products: any = await new EcomService().get_cart_products()
     
//       if (products.length !== 0) {
//         setIsTrending(true)
//         setProducts(products) 
//         const initialNotes = products.map((product: any) => product.notes || '');
//         setNotes(initialNotes);
        
//         // Initialize extraPrinting array based on products data
//         const initialExtraPrinting = products.map((product: any) => 
//           product.extra_printing === true ? true : false
//         );
//         setExtraPrinting(initialExtraPrinting);
   
//        setQuantities(Array(products.length).fill(1).map((_, index) => products[index].quantity || 1))
//       } else {
//         setIsTrending(false)
//         setProducts([])
//         setNotes([])
//       }
//     }
//     fetchProducts()
//   }, [isRefetching])
  

//   return (
//     <>
//       <div className="mb-2 pt-4 pb-1  w-full flex items-center lg:hidden ml-2">
//         <Button onClick={() => router.back()} variant="ghost" size="icon" className="flex" >
//           <div className="flex items-center">
//             <ArrowLeft width={20} height={20} className="h-7 w-7" />
//           </div>
//         </Button>
//         <h2 className=" font-bold">Cart</h2>
//       </div>
//       {products.length !== 0 ? (
//         <div className="container mx-auto lg:px-28 px-5 lg:py-8">

//           <StepProgress />

//           <div className="grid gap-8 lg:grid-cols-3">
//             {/* Left column: product list */}
//             <div className="lg:col-span-2 ">
//               {/* Minimum Quantity Notice */}
//               <MinimumQuantityNotice />

//               {/* Products */}
//               <section className="
//     overflow-y-auto">
//                 {isTrending && products.map((prod: any, index: number) => (
//                   <ProductCard
//                     products={products}
//                     key={index}
//                     idx={index}
//                     size_based_stock={prod.size_based_stock}
//                     id={prod.cart_product_id}
//                     productImage={prod.img_url}
//                     productName={prod.product_name}
//                     productDescription={prod.product_description}
//                     productCode={prod.product_code}
//                     quantity={prod.quantity}
//                     price={prod.purchase_price}
//                     cart_product_id={prod.cart_id}
//                     notes={notes}
//                     setNotes={setNotes}
//                     index={index}
//                     extraPrinting={extraPrinting}
//                     setExtraPrinting={setExtraPrinting}
//                     setQuantities={setQuantities}
//                     quantities={quantities}
//                     setIsRefetching={setIsRefetching}
//                     isRefetching={isRefetching}
//                     setSizeDefault={prod.sizes}
//                     size={prod.size}
//                   />
//                 ))}
                
//               </section>
//             </div> 
//             <PriceDetails quantity={!isTrending ? products[0]?.no_of_players : null} quantities={quantities} isTrending={isTrending} products={products} notes={notes} cart_product_id={products.map((prod: any) => prod.cart_product_id)} extraPrinting={extraPrinting} />
//           </div>
//         </div>
//       ) : (
//         <div className="container gap-5 mx-auto flex flex-col items-center justify-center pt-20">
//           <img src="/empty-cart.svg" alt="empty-cart" width={200} />

//           <h1 className="text-lg font-bold">Your cart is empty</h1>
//           <p className="text-sm text-gray-500">Add items to your cart to continue</p>
//           <Link href="/customize" className="border border-[#FF3333]">
//             <Button className=" hover:bg-white text-[#FF3333] bg-white font-bold lg:text-sm py-6 mx-auto rounded-none">Book your Jersey Now</Button>
//           </Link>
//         </div>
//       )}
//     </>
//   );
// }
