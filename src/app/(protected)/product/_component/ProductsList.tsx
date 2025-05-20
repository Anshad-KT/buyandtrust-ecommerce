// FOR MOBILEVIEW
'use client'
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { EcomService } from "@/services/api/ecom-service"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ProductsListProps {
  products: any[]
}

export default function ProductsList({ products }: ProductsListProps) {
  const router = useRouter();

  const handleProductClick = (product: any) => {
    router.push(`/productinfo/${product.item_id || product.id}`);
  };

  const handleAddToCart = async (product: any) => {
    try {
      const customized_cart = await new EcomService().get_customized_cart()
      if (customized_cart.length !== 0) {
        toastWithTimeout(ToastVariant.Default, "Customized cart already exists")
        return
      }
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
      toastWithTimeout(ToastVariant.Default, "Product added to cart successfully")
    } catch (error: any) {
      console.log(error, "error")
      toastWithTimeout(ToastVariant.Default, "Login to add to cart")
    }
  };

  // Calculate discount percentage function
  const calculateDiscount = (originalPrice: number, salePrice: number) => {
    return originalPrice > 0
      ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
      : 0;
  };

  return (
    <>
      <div className="overflow-x-auto snap-x snap-mandatory">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products?.map((product: any) => {
            const discountPercentage = calculateDiscount(product.retail_price, product.sale_price);
            const isOutOfStock = product?.stock_quantity <= 0;
            return (
              <div key={product.id} className="flex-shrink-0 snap-center">
                <Card className="bg-white border-0 shadow-sm rounded-md h-full flex flex-col">
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
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        width={800}
                        height={800}
                        className="h-40 w-full object-cover hover:scale-105 transition-all duration-300 rounded-md"
                        style={{ aspectRatio: "1/1" }}
                      />
                      {isOutOfStock && (
                        <div className="absolute top-2 right-2 bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-2 w-full p-2 flex-1">
                    <div className="space-y-1 w-full">
                      <h3
                        className="text-xs font-semibold text-black truncate cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      >
                        {product?.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-black text-sm">₹{product?.sale_price}</p>
                        <p className="text-gray-500 line-through text-xs">₹{product?.retail_price}</p>
                        {discountPercentage > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            -{discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    {product?.stock_quantity > 0 ? (
                      <Button
                        variant="outline"
                        className="w-full py-2 px-4 text-sm rounded-full border border-gray-300 text-black transition-colors duration-300 hover:bg-black hover:text-white hover:border-black mt-2"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <a
                        href="https://wa.me/+919995153455?text=I'm interested in purchasing this product that is currently out of stock"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block mt-2"
                      >
                        <Button
                          variant="outline"
                          className="w-full py-2 px-4 text-sm font-semibold rounded-full border border-gray-300 text-red-500 transition-colors duration-300 hover:bg-[#258C05] hover:text-white hover:border-[#258C05]"
                        >
                          Enquire Now
                        </Button>
                      </a>
                    )}
                  </CardFooter>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </>
  )
}