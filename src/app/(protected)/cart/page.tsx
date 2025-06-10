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
import { makeApiCall } from "@/lib/apicaller";
// Import the LoginContext
import { useLogin } from "@/app/LoginContext";
import { Skeleton } from "@/components/ui/skeleton"


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

  // Get cart functions from context
  const { setCartItemCount } = useLogin();

  // Function to update cart count from localStorage
  const updateCartCount = () => {
    try {
      const cartProducts = localStorage.getItem('cart_products_data') ? 
        JSON.parse(localStorage.getItem('cart_products_data') || '[]') : 
        [];
      
      const totalItems = cartProducts.length > 0 ? 
        cartProducts.reduce((acc: number, product: any) => acc + (product.localQuantity || 1), 0) : 
        0;
      
      setCartItemCount(totalItems);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart count:', error);
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    // Get products using EcomService
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        await makeApiCall(
          () => new EcomService().get_cart_products(),
          {
            afterSuccess: (fetchedProducts: any) => {
              if (fetchedProducts && fetchedProducts.length > 0) {
                setProducts(fetchedProducts);


                // Initialize extraPrinting array based on products data
                const initialExtraPrinting = fetchedProducts.map((product: CartProduct) =>
                  product.extra_printing === true ? true : false
                );
                setExtraPrinting(initialExtraPrinting);

                // Initialize quantities based on products data
                const initialQuantities = fetchedProducts.map((product: CartProduct) => product.localQuantity || product.quantity || 1);
                setQuantities(initialQuantities);
                
                console.log("fetchedProducts", fetchedProducts);
                console.log("initialQuantities", initialQuantities);

                setIsTrending(true);
              } else {
                setIsTrending(false);
                setProducts([]);
                setNotes("");
              }
              setIsLoading(false);
            },
            afterError: (error: any) => {
              console.error("Error loading products:", error);
              setProducts([]);
              setIsTrending(false);
              setIsLoading(false);
            }
          }
        );
      } catch (error) {
        // This catch is redundant since makeApiCall handles errors, but kept for safety
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isRefetching]);

  const handleRemoveItem = async (productId: string, cartId: string) => {
    try {
      await makeApiCall(
        () => new EcomService().deleteCartProduct(productId),
        {
          afterSuccess: () => {
            console.log("productId", productId);
            setIsRefetching((prev) => !prev);
            toastWithTimeout(ToastVariant.Default, "Item removed from cart");
            
            // Update cart count after successful removal
            updateCartCount();
          },
          afterError: (error: any) => {
            console.error("Error removing item:", error);
          }
        }
      );
    } catch (error) {
      // This catch is redundant since makeApiCall handles errors, but kept for safety
    }
  };

  const handleProductClick = (product: any) => {
    router.push(`/productinfo/${product.item_id || product.id}`);
  };

  const handleQuantityChange = async (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Store the original quantity in case we need to revert
    const originalQuantity = quantities[index];
    
    try {
      // Update local state optimistically
      const updatedQuantities = [...quantities];
      updatedQuantities[index] = newQuantity;
      setQuantities(updatedQuantities);

      const product = products[index];
      await makeApiCall(
        () => new EcomService().update_cart_quantity(product.item_id, newQuantity),
        {
          afterSuccess: () => {
            // Update cart count after successful quantity change
            updateCartCount();
            console.log(`Successfully updated ${product.name} quantity to ${newQuantity}`);
          },
          afterError: (error: any) => {
            console.error("Error updating quantity:", error);
            // Revert the local state if API call fails
            const revertedQuantities = [...quantities];
            revertedQuantities[index] = originalQuantity;
            setQuantities(revertedQuantities);
          }
        }
      );
    } catch (error) {
      // Revert local state on any error
      const revertedQuantities = [...quantities];
      revertedQuantities[index] = originalQuantity;
      setQuantities(revertedQuantities);
    }
  };

  return (
    <>

      {isLoading ? (
          <div className="container mx-auto py-20">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Product List Skeleton */}
            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded-none overflow-hidden mb-4 lg:mt-0 mt-4">
                <div className="h-8 w-40 mb-4">
                  <Skeleton className="h-8 w-40" />
                </div>
                <div className="bg-[#E4E7E9] border border-gray-300 p-3 mb-4">
                  <Skeleton className="h-6 w-full" />
                </div>
                {/* Skeleton for 2 cart items */}
                {[1, 2].map((_, i) => (
                  <div key={i} className="border-b border-gray-200 p-4 last:border-b-0">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1">
                        <Skeleton className="w-5 h-5 rounded-full" />
                      </div>
                      <div className="col-span-5 flex items-center gap-4">
                        <Skeleton className="w-[60px] h-[60px] rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-32 mb-2" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <Skeleton className="h-10 w-24" />
                      </div>
                      <div className="col-span-3 text-right">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-6 mb-8">
                  <Skeleton className="h-12 w-48" />
                </div>
              </div>
            </div>
            {/* Right: PriceDetails Skeleton (already handled in PriceDetails.tsx) */}
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      ) : products.length !== 0 ? (
        <div className="mx-auto lg:py-8">
          {/* <StepProgress /> */}

          <div
            className="grid gap-8 lg:grid-cols-3"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {/* Left column: product list */}
            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded-none overflow-hidden mb-4 lg:mt-0 mt-4">
                {/* Shopping Cart Header */}
                <h2 className="text-lg mb-2 px-4 py-5">Shopping Cart</h2>
                <div className="bg-[#E4E7E9] border border-gray-300 p-3 mb-4">
                  <div
                    className="
                      grid 
                      grid-cols-12 
                      gap-2 
                      font-medium 
                      text-gray-500
                      text-base
                      md:text-base
                      sm:text-sm
                      xs:text-xs
                    "
                  >
                    <div className="col-span-6 sm:col-span-5 xs:col-span-6">PRODUCTS</div>
                    <div className="col-span-3 text-center sm:col-span-4 xs:col-span-3">QUANTITY</div>
                    <div className="col-span-3 text-right sm:col-span-3 xs:col-span-3 whitespace-nowrap">SUB-TOTAL</div>
                  </div>
                </div>

                {/* Products List */}
                <section className="overflow-y-auto">
                  {isTrending &&
                    products.map((prod: CartProduct, index: number) => (
                      <div
                        key={prod.id || index}
                        className="border-b border-gray-200 p-4 last:border-b-0"
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Remove Button */}
                          <div className="col-span-1">
                            <button
                              onClick={() =>
                                handleRemoveItem(prod.item_id, prod.cart_id)
                              }
                              className="text-gray-400 hover:text-red-500"
                            >
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-400 hover:border-red-500 transition-colors">
                                <X size={18} className="cursor-pointer" />
                              </span>
                            </button>
                          </div>

                          {/* Product Image & Name */}
                          <div className="col-span-5 flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <span
                                style={{ cursor: "pointer" }}
                                onClick={() => handleProductClick(prod)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View details for ${prod.name}`}
                                onKeyDown={e => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    handleProductClick(prod);
                                  }
                                }}
                              >
                                <Image
                                  src={
                                    prod.images?.[0]?.url ||
                                    prod.images?.find(
                                      (img: { url: string }) => img.url
                                    )?.url ||
                                    prod.image
                                  }
                                  alt={prod.name}
                                  width={80}
                                  height={80}
                                  className="rounded-none object-cover sm:w-[80px] sm:h-[80px] w-[60px] h-[60px]"
                                />
                              </span>
                              {/* Mobile: name below image, Desktop: name to the right */}
                              <h3
                               className="font-family-futura text-xs mt-2 block lg:hidden text-center max-w-[80px] sm:max-w-[100px]"
                                // className="font-family-futura text-xs mt-1 block lg:hidden text-center truncate max-w-[70px] sm:max-w-[90px]"
                              >
                                {/* {prod.name.length > 14
                                  ? prod.name.slice(0, 14) + "…"
                                  : prod.name} */}
                                 {prod.name} 
                              </h3>
                            </div>
                            <div className="hidden lg:block flex-1">
                              <h3 className="font-family-futura text-base">
                                {prod.name}
                              </h3>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-span-3 flex justify-center">
                            <div className="flex items-center border border-gray-300 rounded-none w-20 sm:w-24">
                              <button
                                type="button"
                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-base sm:text-lg"
                                onClick={() =>
                                  handleQuantityChange(
                                    index,
                                    quantities[index] - 1
                                  )
                                }
                              >
                                −
                              </button>
                              <span className="px-2 py-1 sm:px-3">{quantities[index]}</span>
                              <button
                                type="button"
                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 text-base sm:text-lg"
                                onClick={() =>
                                  handleQuantityChange(
                                    index,
                                    quantities[index] + 1
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-3 text-right whitespace-nowrap text-base sm:text-lg">
                            ₹{((prod.sale_price || prod.purchase_price) * quantities[index]).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </section>
                {/* Return to Shop Button */}
                <div className="mt-6 mb-8">
                  <Link href="/product">
                    <Button className="bg-white text-[#1E1E2A] rounded-none flex items-center gap-2 border-2 border-[#1E1E2A] hover:bg-[#1E1E2A] hover:text-white py-3 px-6 text-lg uppercase">
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
              cart_product_id={products.map((prod: CartProduct) => prod.id)}
              isLoading={isLoading}
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

          <h1
            className="text-2xl text-center mb-2"
            style={{
              fontWeight: "700",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Your Cart is Empty
          </h1>
          <p
            className="text-base text-gray-600 text-center mb-4"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            Looks like you haven't added anything to your cart yet
          </p>
          <Link href="/product">
            <Button
              className="hover:bg-[#060303] hover:border-[#060303] hover:text-white text-gray-600 bg-white lg:text-sm py-4 px-6 rounded-none border-2 border-gray-600 transition-colors duration-300"
              style={{
                fontWeight: "500",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              Grab Yours Before It's Gone
            </Button>
          </Link>
        </div>
      )}

    </>
  );
}