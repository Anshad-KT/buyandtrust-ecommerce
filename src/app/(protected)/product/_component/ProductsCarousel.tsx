// FOR DESKTOPVIEW
'use client'
import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { EcomService } from "@/services/api/ecom-service"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { makeApiCall } from "@/lib/apicaller"
import '@fontsource-variable/inter-tight';
import { useLogin } from "@/app/LoginContext";
import { useCurrency } from "@/app/CurrencyContext";

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
  const {cartItemCount, setCartItemCount} = useLogin();
  const { currencySymbol } = useCurrency();
  const handleProductClick = (product: Product) => {
    router.push(`/productinfo/${product.item_id || product.id}`);
  };

  const handleAddToCart = (product: any) => {
    makeApiCall(
      async () => {
        // const customized_cart = await new EcomService().get_customized_cart()
        // if (customized_cart.length !== 0) {
        //   throw new Error("Customized cart already exists")
        // }
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
          toastWithTimeout(ToastVariant.Default, "Product added to cart successfully")
          setCartItemCount(cartItemCount + 1);
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
                        {(product?.img_url || (product as any)?.images?.[0]?.url || (product as any)?.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail)?.url) ? (
                          <Image
                            src={
                              product?.img_url ||
                              (product as any)?.images?.[0]?.url ||
                              (product as any)?.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail)?.url ||
                              "/placeholder.svg"
                            }
                            alt={product.name}
                            width={800}
                            height={600}
                            className="h-64 w-full object-cover hover:scale-105 transition-all duration-300 rounded-md"
                            style={{ aspectRatio: "1/1" }}
                          />
                        ) : (
                          <div className="h-64 w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-md">
                            <span className="text-5xl font-semibold text-indigo-600" style={interFontStyle}>
                              {product?.name?.charAt(0)?.toUpperCase() || 'P'}
                            </span>
                          </div>
                        )}
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
                          <p className="text-gray-500 line-through text-xs" style={interFontStyle}>{currencySymbol}{product?.retail_price}</p>
                          {discountPercentage > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full" style={interFontStyle}>
                              -{discountPercentage}%
                            </span>
                          )}
                        </div>
                        {product?.stock_quantity > 0 ? (
                          <Button
                            variant="outline"
                            className="w-full py-2 px-4 text-sm font-semibold rounded-full border border-gray-300 text-black transition-colors duration-300 hover:bg-black hover:text-white hover:border-black mt-2"
                            style={interFontStyle}
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
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

// // FOR DESKTOPVIEW
// 'use client'
// import { useState } from "react"
// import { Card, CardContent, CardFooter } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import Image from "next/image"
// import { EcomService } from "@/services/api/ecom-service"
// import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
// import { useRouter } from "next/navigation"
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel"

// interface Product {
//     id: string;
//     item_id?: string;
//     name: string;
//     stock: number;
//     img_url: string;
//     category_name: string;
//     item_category_id: string; // Add this line to your interface
//     jersey_color: string;
//     size_based_stock: any;
//     size: string[];
//     purchase_price: number;
//     retail_price: number;
//     stock_quantity: number;
//     sale_price: number;
//     rich_text?: string;
//     images?: {url: string, is_thumbnail: boolean}[];
//   }

// interface ProductsCatProps {
//   products: Product[];
// }

// export default function ProductsCat({ products }: ProductsCatProps) {
//   const router = useRouter();
  
//   const handleAddToCart = async (product: any) => {
//     try {
//       const customized_cart = await new EcomService().get_customized_cart()
//       if (customized_cart.length !== 0) {
//         toastWithTimeout(ToastVariant.Default, "Customized cart already exists")
//         return
//       }
//       const cart = await new EcomService().check_cart_exists()

//       if (cart.length == 0) {
//         const newCart = await new EcomService().add_to_cart()
        
//         const deliveryDate = new Date();
//         deliveryDate.setDate(deliveryDate.getDate() + 10);
//         await new EcomService().add_to_cart_products({
//           product_id: product.id,
//           item_id: product.item_id,
//           cart_id: newCart.id,
//           quantity: 1,
//           delivery_date: deliveryDate.toISOString()
//         })
//       } else {
//         const deliveryDate = new Date();
//         deliveryDate.setDate(deliveryDate.getDate() + 10);
//         await new EcomService().add_to_cart_products({
//           product_id: product.id,
//           item_id: product.item_id,
//           cart_id: cart[0].id,
//           quantity: 1,
//           delivery_date: deliveryDate.toISOString()
//         })
//       }
//       toastWithTimeout(ToastVariant.Default, "Product added to cart successfully")
//     } catch (error: any) {
//       console.log(error, "error")
//       toastWithTimeout(ToastVariant.Default, "Error adding product to cart")
//     }
//   };

//   // Determine if we need to show two carousels based on product count
//   const showTwoCarousels = products?.length > 14;
//   const firstHalfProducts = showTwoCarousels ? products.slice(0, Math.ceil(products.length / 2)) : products;
//   const secondHalfProducts = showTwoCarousels ? products.slice(Math.ceil(products.length / 2)) : [];

//   const renderCarousel = (carouselProducts: Product[], className: string = "") => (
//     <Carousel className={`w-full ${className}`} opts={{ slidesToScroll: 1, align: "start" }}>
//       <CarouselContent className="-ml-2 ">
//         {carouselProducts?.map((product) => (
//           <CarouselItem key={product.id} className="pl-2 basis-1/4 md:basis-1/4 sm:basis-1/2">
//             <Card className="bg-[#222222] text-white border-0">
//               <CardContent className="p-0">
//                 <div className="relative">
//                   {/* <Badge
//                     variant="default"
//                     className={`absolute left-2 top-2 z-10 ${
//                       product?.stock_quantity === 0
//                         ? "bg-red-600 text-white"
//                         : product?.stock_quantity < 40
//                         ? "bg-yellow-400 text-black"
//                         : "bg-green-600 text-white"
//                     }`}
//                   >
//                     {product?.stock_quantity === 0
//                       ? "Out of Stock"
//                       : product?.stock_quantity < 40
//                       ? "Low Stock"
//                       : "In Stock"}
//                   </Badge> */}
//                   <Image
//                     src={product?.img_url || (product as any)?.images?.[0]?.url || (product as any)?.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail)?.url}
//                     alt={product.name}
//                     width={800}
//                     height={600}
//                     className="h-64 w-full hover:scale-105 transition-all duration-300 object-contain"
//                   />
//                 </div>
//               </CardContent>
//               <CardFooter className="flex flex-col items-start gap-2 w-full p-0">
//                 <div className="flex items-center gap-2 w-full bg-black">
//                   <Button
//                     // variant="destructive"
//                     className="w-full p-0 rounded-full"
//                     disabled={product?.stock_quantity === 0}
//                     onClick={() => handleAddToCart(product)}
//                 >
//                   ADD TO CART
//                 </Button>

//                 </div>
//                 <div className="space-y-1 w-full">
//                   <p className="text-sm text-red-500">{product?.category_name}</p>
//                   <h3 className="text-sm font-medium">{product?.name}</h3>
//                   <div className="flex items-center gap-3">
//                     <p className="font-semibold">₹{product?.sale_price}</p>
//                     <p className="text-gray-500 line-through">₹{product?.purchase_price}</p>
//                   </div>
            
//                   {/* Product description with read more/less */}
//                   {(() => {
//                     try {
//                       const parsed = JSON.parse((product as any)?.rich_text);
//                       const text = Array.isArray(parsed)
//                         ? parsed.map((block: any) => block.insert).join('')
//                         : '';

//                       const [expanded, setExpanded] = useState(false);

//                       return (
//                         <div className="text-sm font-medium">
//                           <p>{expanded || text.length <= 50 ? text : text.substring(0, 50) + "..."}</p>
//                           {text.length > 50 && (
//                             <Button
//                               variant="link"
//                               className="p-0 h-auto text-xs text-red-500"
//                               onClick={() => setExpanded(!expanded)}
//                             >
//                               {expanded ? "Read less" : "Read more"}
//                             </Button>
//                           )}
//                         </div>
//                       );
//                     } catch {
//                       return <p className="text-sm font-medium"></p>;
//                     }
//                   })()}
//                 </div>
//               </CardFooter>
//             </Card>
//           </CarouselItem>
//         ))}
//       </CarouselContent>
//       <CarouselPrevious />
//       <CarouselNext />
//     </Carousel>
//   );
  
//   return (
//     <>
//       {renderCarousel(firstHalfProducts, showTwoCarousels ? "mb-10" : "")}
//       {showTwoCarousels && renderCarousel(secondHalfProducts)}
//     </>
//   );
// }