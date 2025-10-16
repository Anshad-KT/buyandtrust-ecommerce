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
import { useLogin } from "@/app/LoginContext";
import { useCurrency } from "@/app/CurrencyContext";
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

  // Get cart functions and currency from context
  const { setCartItemCount } = useLogin();
  const { currencySymbol } = useCurrency();

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
                      <div className="col-span-4 flex items-center gap-3">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <Skeleton className="w-[60px] h-[60px] rounded" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Skeleton className="h-10 w-24" />
                      </div>
                      <div className="col-span-2 text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </div>
                      <div className="col-span-2 text-center">
                        <Skeleton className="h-4 w-16 mx-auto" />
                      </div>
                      <div className="col-span-2 text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
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
                <div className="bg-[#E4E7E9] border border-gray-300 p-4">
                  <div
                    className="grid grid-cols-12 gap-4 text-xs font-medium font-weight-400 text-gray-700 uppercase"
                    style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  >
                    <div className="col-span-4">PRODUCTS</div>
                    <div className="col-span-2 text-center">QUANTITY</div>
                    <div className="col-span-2 text-center hidden md:block">SALE PRICE</div>
                    <div className="col-span-2 text-center hidden md:block">TAX</div>
                    <div className="col-span-2 text-right">AMOUNT</div>
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
                          {/* Remove Button & Product */}
                          <div className="col-span-4 flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleRemoveItem(prod.item_id, prod.cart_id)
                              }
                              className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-gray-400 hover:border-red-500 transition-colors">
                                <X size={14} className="cursor-pointer" />
                              </span>
                            </button>
                            
                            {/* Product Image */}
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
                              className="flex-shrink-0"
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
                                width={60}
                                height={60}
                                className="rounded object-cover w-[60px] h-[60px]"
                              />
                            </span>
                            
                            {/* Product Name */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-family-futura text-sm">
                                {prod.name}
                              </h3>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="col-span-2 flex justify-center">
                            <div className="flex items-center border border-gray-300 rounded-none">
                              <button
                                type="button"
                                className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                                onClick={() =>
                                  handleQuantityChange(
                                    index,
                                    quantities[index] - 1
                                  )
                                }
                              >
                                −
                              </button>
                              <span className="px-4 py-1 min-w-[40px] text-center">{quantities[index]}</span>
                              <button
                                type="button"
                                className="px-3 py-1 text-gray-500 hover:bg-gray-100"
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

                          {/* Sale Price */}
                          <div className="col-span-2 text-center hidden md:block">
                            <span className="text-sm">
                              {currencySymbol}{(prod.sale_price || prod.purchase_price).toLocaleString()}
                            </span>
                          </div>

                          {/* Tax */}
                          <div className="col-span-2 text-center hidden md:block">
                            <span className="text-sm text-gray-600">
                              {(() => {
                                const unitPrice = Number(prod.sale_price ?? prod.purchase_price ?? 0);
                                const qty = Number(quantities[index] || 1);
                                const ratePct = Number(prod.tax_rate || 0);
                                const tax = unitPrice * (ratePct / 100) * qty;
                                const label = prod.is_tax_inclusive ? 'INC' : 'EXC';
                                return `${currencySymbol}${tax.toFixed(2)}(${label})`;
                              })()}
                            </span>
                          </div>

                          {/* Subtotal */}
                          <div className="col-span-2 text-right">
                            <span className="text-sm">
                              {(() => {
                                const unitPrice = Number(prod.sale_price ?? prod.purchase_price ?? 0);
                                const qty = Number(quantities[index] || 1);
                                const ratePct = Number(prod.tax_rate || 0);
                                const taxPerUnit = unitPrice * (ratePct / 100);
                                const subtotal = prod.is_tax_inclusive
                                  ? unitPrice * qty
                                  : (unitPrice + taxPerUnit) * qty;
                                return `${currencySymbol}${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </section>
                {/* Return to Shop Button */}
                <div className="mt-6 mb-2">
                  <Link href="/product">
                    <Button className="bg-white text-[#1E1E2A] rounded-none flex items-center gap-2 border-2 border-[#1E1E2A] hover:bg-[#1E1E2A] hover:text-white py-4 px-3 text-sm uppercase">
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