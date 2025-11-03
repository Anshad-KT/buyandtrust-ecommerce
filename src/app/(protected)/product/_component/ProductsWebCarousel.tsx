// FOR DESKTOPVIEW
'use client'
import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { EcomService } from "@/services/api/ecom-service"
import { ToastVariant, toastWithTimeout, toastWithAction } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { makeApiCall } from "@/lib/apicaller"
import '@fontsource-variable/inter-tight';
import { useLogin } from "@/app/LoginContext";
import { useCurrency } from "@/app/CurrencyContext";
import QuantityCounter from "@/components/common/quantity-counter";
import { useCart } from "@/hooks/useCart";

interface Product {
    id: string;
    item_id?: string;
    name: string;
    stock: number;
    img_url: string;
    category_name: string;
    item_category_id: string;
    jersey_color: string;
    size_based_stock: any;
    size: string[];
    purchase_price: number;
    retail_price: number;
    stock_quantity: number;
    sale_price: number;
    rich_text?: string;
    images?: {url: string, is_thumbnail: boolean}[];
}

interface ProductsCatProps {
  products: Product[];
}

export default function ProductsCat({ products }: ProductsCatProps) {
  const router = useRouter();
  const { cartProducts, handleIncrement, handleDecrement, updateCartCount, fetchCartProducts } = useCart();
  const {cartItemCount, setCartItemCount} = useLogin();
  const { currencySymbol } = useCurrency();
  const handleProductClick = (product: Product) => {
    router.push(`/productinfo/${product.item_id || product.id}`);
  };

  const handleAddToCart = (product: any) => {
    makeApiCall(
      async () => {

        const cart = await new EcomService().check_cart_exists()

        if (cart.length == 0) {
          const newCart = await new EcomService().add_to_cart()
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + 10);
          await new EcomService().add_to_cart_products({
            product_id: product.id,
            item_id: product.item_id,
            cart_id: newCart.id,
            quantity: 1,
            delivery_date: deliveryDate.toISOString()
          })
        } else {
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + 10);
          await new EcomService().add_to_cart_products({
            product_id: product.id,
            item_id: product.item_id,
            cart_id: cart[0].id,
            quantity: 1,
            delivery_date: deliveryDate.toISOString()
          })
        }
        setCartItemCount(cartItemCount + 1);
        return true
      },
      {
        afterSuccess: () => {
          toastWithAction(
            ToastVariant.Default, 
            "Product added to cart successfully",
            "View Cart",
            () => router.push('/cart')
          )
          setCartItemCount(cartItemCount + 1);
          // Ensure in-memory cart state updates immediately for UI
          updateCartCount();
          fetchCartProducts();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }
        },
        afterError: (error: any) => {
          if (error?.message === "Customized cart already exists") {
            toastWithTimeout(ToastVariant.Default, "Customized cart already exists")
          } else {
            console.log(error, "error")
            toastWithTimeout(ToastVariant.Default, "Error adding product to cart")
          }
        }
      }
    )
  };

  // Calculate discount percentage function
  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return originalPrice > 0 
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) 
      : 0;
  };

  // Style object for Inter Variable font
  const interFontStyle = { fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products?.map((product) => {
                const discountPercentage = calculateDiscount(product.retail_price, product.sale_price);

                return (
                  <Card
                    key={product.id}
                    className="bg-white border-0 shadow-none overflow-hidden rounded-md flex flex-col h-full"
                  >
                    <CardContent className="p-0">
                      <div
                        className="relative cursor-pointer rounded-md overflow-hidden"
                        onClick={() => handleProductClick(product)}
                      >
                        <Image
                          src={
                            product?.img_url ||
                            (product as any)?.images?.[0]?.url ||
                            (product as any)?.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail)?.url ||
                            "/productpage/noimage.svg"
                          }
                          alt={product.name}
                          width={800}
                          height={600}
                          className="h-64 w-full object-cover hover:scale-105 transition-all duration-300 rounded-md"
                          style={{ aspectRatio: "1/1" }}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2 w-full p-4 flex-1">
                      <div className="space-y-1 w-full">
                        <h3
                          className="text-sm text-black font-semibold truncate cursor-pointer"
                          style={interFontStyle}
                          onClick={() => handleProductClick(product)}
                        >
                          {product?.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap pb-2">
                          <p className="font-semibold text-black text-base" style={interFontStyle}>{currencySymbol}{product?.sale_price}</p>
                          {typeof product?.retail_price === 'number' && product.retail_price > 0 && product.retail_price > product.sale_price && (
                            <p className="text-gray-500 line-through text-xs" style={interFontStyle}>{currencySymbol}{product?.retail_price}</p>
                          )}
                          {typeof product?.retail_price === 'number' && product.retail_price > 0 && product.retail_price > product.sale_price && discountPercentage > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full" style={interFontStyle}>
                              -{discountPercentage}%
                            </span>
                          )}
                        </div>
                        {product?.stock_quantity > 0 ? (
                          (() => {
                            const inCart = cartProducts.some(p => p.item_id === product.item_id);
                            return inCart && product.item_id ? (
                              <QuantityCounter
                                quantity={cartProducts.find(p => p.item_id === product.item_id)?.localQuantity}
                                onIncrement={() => handleIncrement(product.item_id!)}
                                onDecrement={() => handleDecrement(product.item_id!)}
                              />
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full py-2 px-4 text-sm font-semibold rounded-full border border-gray-300 text-black transition-colors duration-300 hover:bg-black hover:text-white hover:border-black mt-2"
                                style={interFontStyle}
                                onClick={() => handleAddToCart(product)}
                              >
                                Add to Cart
                              </Button>
                            );
                          })()
                        ) : (
                          <a
                            href="https://wa.me/+919995303951?text=I'm interested in purchasing this product that is currently out of stock"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block mt-2"
                          >
                            <Button
                              variant="outline"
                              className="w-full py-2 px-4 text-sm font-semibold rounded-full border bg-[#258C05] border-gray-300 text-white transition-colors duration-300 hover:bg-green-700 hover:text-white hover:border-[#258C05]"
                              style={interFontStyle}
                            >
                              Out of Stock - Enquire Now
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

