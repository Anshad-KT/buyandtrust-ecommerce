// 'use client'
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { useEffect, useState } from "react";
// import { makeApiCall } from "@/lib/apicaller";
// import { EcomService } from "@/services/api/ecom-service";
// import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
// import { useRouter } from "next/navigation";
// import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
// import { useLogin } from "@/app/LoginContext";
// // Supports weights 100-900
// import '@fontsource-variable/inter-tight';
// import '@fontsource/anton';

// export default function TrendingProducts() {
//   const [products, setProducts] = useState<any[]>([]);
//   const router = useRouter();
//   // const {isLoggedIn} = useLogin();
//   const {cartItemCount, setCartItemCount} = useLogin();

//   const handleProductClick = (product: any) => {
//     router.push(`/productinfo/${product.item_id || product.id}`);
//   };
  
//   useEffect(() => {
//     makeApiCall(
//       () => new EcomService().get_all_products(),
//       {
//         afterSuccess: (data: any) => {
//           // Filter products to only include the 5 specific item_ids
//           const featuredItemIds =
//           // [
//           //   'e9e2d525-e602-48c9-9ae9-037042c31bf1',
//           //   '71f886b4-0429-403c-b4e9-40b4e7bb63dc',
//           //   '6683521f-78cb-49f5-b62a-ae0f34adcdb7',
//           //   '7cd84a3a-0a1b-4cc6-82ed-38ce6cfe8c99',
//           //   '0035ed3f-6153-465a-ab6e-2d2c133676d0'  
//           // ]; 
//           [
//             '95b43395-e999-41b7-84e0-50b6662bbfdf',
//             '27648bd7-558e-46bb-a97e-95e79e8759c5', 
//             '2cb8d96e-19eb-4c60-8d14-cb24d4344d63',
//             '49c1281b-876c-4c47-a821-be781084fea8',
//             '7f5bf67a-64d6-41cf-8731-87f090592dda'
//           ];

//           const filteredProducts = data.filter((product: any) => 
//             featuredItemIds.includes(product.item_id)
//           );

//           setProducts(filteredProducts);
//         }
//       }
//     )
//   }, [])

//   return (
//     <section
//       className="w-full bg-white px-4 py-12"
//       style={{ fontFamily: "'Anton', sans-serif" }} // Anton as a substitute for Integral CF
//     >
//       <div className="mx-auto max-w-7xl">
//         <h2
//           className="mb-12 text-center uppercase text-4xl md:text-5xl font-black text-[#1E1E2A] tracking-tight"
//           style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
//         >
//           NEW ARRIVALS
//         </h2>
        
//         {/* Product Carousel - Now always visible */}
//         <ProductCarousel products={products} handleProductClick={handleProductClick} />
//       </div>
//     </section>
//   );
// }
// const handleAddToCart = async (product: any) => {
//   makeApiCall(
//     async () => {
//       const customized_cart = await new EcomService().get_customized_cart();
//       if (customized_cart.length !== 0) {
//         throw { type: "customized_cart_exists" };
//       }
//       const cart = await new EcomService().check_cart_exists();

//       let cartId;
//       if (cart.length === 0) {
//         const newCart = await new EcomService().add_to_cart();
//         cartId = newCart.id;
//       } else {
//         cartId = cart[0].id;
//       }

//       const deliveryDate = new Date();
//       deliveryDate.setDate(deliveryDate.getDate() + 10);

//       await new EcomService().add_to_cart_products({
//         product_id: product.id,
//         item_id: product.item_id,
//         cart_id: cartId,
//         quantity: 1,
//         delivery_date: deliveryDate.toISOString()
//       });
//     },
//     {
//       afterSuccess: () => {
//         toastWithTimeout(ToastVariant.Default, "Product added to cart successfully");
//       },
//       afterError: (error: any) => {
//         if (error?.type === "customized_cart_exists") {
//           toastWithTimeout(ToastVariant.Default, "Customized cart already exists");
//         } else {
//           console.log(error, "error");
//           toastWithTimeout(ToastVariant.Default, "Login to add to cart");
//         }
//       }
//     }
//   );
// };


// // Modified ProductCarousel component with auto-sliding functionality
// const ProductCarousel = ({ products, handleProductClick }: { products: any[], handleProductClick: (product: any) => void }) => {
//   const [api, setApi] = useState<any>(null);
//   const [current, setCurrent] = useState(0);
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     if (!api || products.length === 0) return;
    
//     // Set the count once products are available
//     setCount(products.length);
    
//     // Set up the auto-slide interval
//     const interval = setInterval(() => {
//       api.scrollNext();
//     }, 3000); // Change slide every 3 seconds
    
//     // Clean up the interval on component unmount
//     return () => clearInterval(interval);
//   }, [api, products]);

//   // Update current index when the carousel slides
//   useEffect(() => {
//     if (!api) return;
    
//     const handleSelect = () => {
//       setCurrent(api.selectedScrollSnap());
//     };
    
//     api.on("select", handleSelect);
    
//     return () => {
//       api.off("select", handleSelect);
//     };
//   }, [api]);

//   return (
//     <div className="w-full">
//       {/* Custom styles for button hover */}
//       <style>
//         {`
//           .add-to-cart-btn {
//             transition: background 0.2s, color 0.2s;
//           }
//           .add-to-cart-btn:not(.special):hover {
//             background: #000 !important;
//             color: #fff !important;
//             border-color: #000 !important;
//           }
//           .add-to-cart-btn.special:hover {
//             background: #fff !important;
//             color: #000 !important;
//             border-color: #000 !important;
//           }
//           .enquire-now-btn {
//             transition: background 0.2s, color 0.2s;
//           }
//           .enquire-now-btn:hover {
//             background: #22c55e !important; /* Tailwind green-500 */
//             color: #fff !important;
//             border-color: #22c55e !important;
//           }
//         `}
//       </style>
//       <Carousel
//         className="w-full"
//         setApi={setApi}
//         opts={{
//           align: "start",
//           loop: true,
//         }}
//       >
//         <CarouselContent>
//         {products.map((product) => {
//   // Calculate discount percentage
//   const originalPrice = product?.retail_price || 0; // Changed from purchase_price to retail_price
//   const salePrice = product?.sale_price || 0;
//   const discountPercentage = originalPrice > 0 
//     ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) 
//     : 0;
  
//   // Check if this is the special product that should always have zoom effect
//   const isSpecialProduct = product.item_id === '7f5bf67a-64d6-41cf-8731-87f090592dda';
//   // const isSpecialProduct = product.item_id === '7cd84a3a-0a1b-4cc6-82ed-38ce6cfe8c99';
  
//   return (
//     <CarouselItem key={product.id} className="basis-full md:basis-1/2 lg:basis-1/4">
//       <div className="flex justify-center px-4">
//         <Card
//           className={`w-full max-w-md bg-white rounded-2xl shadow-none border-0 ${
//             isSpecialProduct ? 'relative z-10' : ''
//           }`}
//           style={{
//             borderRadius: '24px',
//             boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
//             border: 'none',
//           }}
//         >
//           <CardContent
//             className="p-0 flex items-center justify-center"
//             style={{
//               borderTopLeftRadius: '24px',
//               borderTopRightRadius: '24px',
//               overflow: 'hidden',
//               height: 280,
//               background: '#f8f8f8',
//             }}
//           >
//             <div
//               className="relative cursor-pointer w-full h-full flex items-center justify-center"
//               style={{ minHeight: 220, minWidth: 220 }}
//               onClick={() => handleProductClick(product)}
//             >
//               {isSpecialProduct && (
//                 <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-2xl"></div>
//               )}
//               <Image
//                 src={
//                   product?.img_url ||
//                   product?.images?.[0]?.url ||
//                   product?.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail)?.url ||
//                   "/placeholder.svg"
//                 }
//                 alt={product.name}
//                 width={320}
//                 height={280}
//                 className={`object-fill w-full h-full transition-all duration-300 ${
//                   isSpecialProduct
//                     ? 'scale-125 brightness-110 animate-[]'
//                     : 'hover:scale-105'
//                 }`}
//                 style={{
//                   borderTopLeftRadius: '24px',
//                   borderTopRightRadius: '24px',
//                   background: '#f8f8f8',
//                 }}
//               />
//               {isSpecialProduct && (
//                 <div
//                   className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md z-10"
//                   style={{ fontFamily: "Poppins", fontWeight: "bold" }}
//                 >
//                   Featured
//                 </div>
//               )}
//             </div>
//           </CardContent>
//           <CardFooter
//             className={`flex flex-col items-start gap-2 w-full px-6 pt-4 pb-6 ${
//               isSpecialProduct ? 'bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl' : ''
//             }`}
//             style={{
//               borderBottomLeftRadius: '24px',
//               borderBottomRightRadius: '24px',
//               background: '#fff',
//             }}
//           >
//             {/* Product Name */}
//             <h3
//               className={`text-lg font-semibold text-black cursor-pointer w-full mb-2 ${
//                 isSpecialProduct ? 'font-bold' : ''
//               } font-[Inter_Tight_Variable] font-inter-tight`}
//               style={{
//                 fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
//                 lineHeight: 1.2,
//                 letterSpacing: '-0.01em',
//               }}
//               onClick={() => handleProductClick(product)}
//             >
//               {product?.name}
//             </h3>
//             {/* Price, Discount, Retail Price */}
//             <div className="flex items-center gap-3 mb-2">
//               <p
//                 className={`font-semibold text-2xl ${
//                   isSpecialProduct ? 'text-blue-700' : 'text-black'
//                 } font-[Inter_Tight_Variable] font-inter-tight`}
//                 style={{
//                   fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
//                   fontWeight: 700,
//                 }}
//               >
//                 ₹{product?.sale_price}
//               </p>
//               <p
//                 className="text-gray-400 line-through text-xl font-[Inter_Tight_Variable] font-inter-tight"
//                 style={{
//                   fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
//                   fontWeight: 500,
//                 }}
//               >
//                 ₹{product?.retail_price}
//               </p>
//               {discountPercentage > 0 && (
//                 <span
//                   className={`text-sm ${
//                     isSpecialProduct
//                       ? 'bg-red-200 text-red-700 px-4 py-1'
//                       : 'bg-red-100 text-red-600 px-4 py-1'
//                   } rounded-full font-[Inter_Tight_Variable] font-inter-tight`}
//                   style={{
//                     fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
//                     fontWeight: 500,
//                     background: '#ffeaea',
//                   }}
//                 >
//                   -{discountPercentage}%
//                 </span>
//               )}
//             </div>
//             {/* Add to Cart Button */}
//             <Button
//               className={
//                 `w-full rounded-full border-2 text-lg font-semibold py-3 font-[Inter_Tight_Variable] font-inter-tight
//                 ${
//                   product?.stock_quantity === 0
//                     ? 'enquire-now-btn bg-green-600 text-white border-green-600 hover:border-green-700'
//                     : isSpecialProduct
//                     ? 'add-to-cart-btn special bg-black text-white border border-black'
//                     : 'add-to-cart-btn bg-white text-black border-black'
//                 }`
//               }
//               style={{
//                 fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
//                 border: '2px solid #e5e7eb',
//                 background: product?.stock_quantity === 0
//                   ? '#16a34a'
//                   : isSpecialProduct
//                   ? '#000'
//                   : '#fff',
//                 color: product?.stock_quantity === 0
//                   ? '#fff'
//                   : isSpecialProduct
//                   ? '#fff'
//                   : '#000',
//                 marginTop: 12,
//                 minHeight: 48,
//               }}
//               onClick={() =>
//                 product?.stock_quantity === 0
//                   ? window.open(
//                       'https://wa.me/+919995153455?text=I%20am%20interested%20in%20' +
//                         encodeURIComponent(product?.name),
//                       '_blank'
//                     )
//                   : handleAddToCart(product)
//               }
//             >
//               {product?.stock_quantity === 0
//                 ? 'Enquire Now'
//                 : isSpecialProduct
//                 ? 'Add to Cart Now'
//                 : 'Add to Cart'}
//             </Button>
//           </CardFooter>
//         </Card>
//       </div>
//     </CarouselItem>
//   );
//           })}
//         </CarouselContent>
        
//         <div className="flex justify-center mt-4">
//           <CarouselPrevious className="relative mr-4 transform-none disabled={false}"  />
//           <div className="flex items-center justify-center gap-1 my-2">
//             {Array.from({ length: count }).map((_, index) => (
//               <span
//                 key={index}
//                 className={`h-2 w-2 rounded-full ${
//                   current === index ? "bg-black" : "bg-gray-300"
//                 }`}
//               />
//             ))}
//           </div>
//           <CarouselNext className="relative transform-none disabled={false}" />
//         </div>
//       </Carousel>
//     </div>
//   );
// };


// UPDATED WITH CART COUNT DISPLAY ISSUE SOLVED

'use client'
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { makeApiCall } from "@/lib/apicaller";
import { EcomService } from "@/services/api/ecom-service";
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
// Import the LoginContext
import { useLogin } from "@/app/LoginContext";
// Supports weights 100-900
import '@fontsource-variable/inter-tight';
import '@fontsource/anton';

export default function TrendingProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  
  // Get cart functions from context
  const { setCartItemCount } = useLogin();
  
  const handleProductClick = (product: any) => {
    router.push(`/productinfo/${product.item_id || product.id}`);
  };
  
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
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
          // Filter products to only include the 5 specific item_ids
          const featuredItemIds = 
            [
            'e9e2d525-e602-48c9-9ae9-037042c31bf1',
            '71f886b4-0429-403c-b4e9-40b4e7bb63dc',
            '6683521f-78cb-49f5-b62a-ae0f34adcdb7',
            '7cd84a3a-0a1b-4cc6-82ed-38ce6cfe8c99',
            '0035ed3f-6153-465a-ab6e-2d2c133676d0'  
          ]; 
          // [
          //   '95b43395-e999-41b7-84e0-50b6662bbfdf',
          //   '27648bd7-558e-46bb-a97e-95e79e8759c5', 
          //   '2cb8d96e-19eb-4c60-8d14-cb24d4344d63',
          //   '49c1281b-876c-4c47-a821-be781084fea8',
          //   '7f5bf67a-64d6-41cf-8731-87f090592dda'
          // ];

          const filteredProducts = data.filter((product: any) => 
            featuredItemIds.includes(product.item_id)
          );

          setProducts(filteredProducts);
        }
      }
    )
  }, [])

  const handleAddToCart = async (product: any) => {
    makeApiCall(
      async () => {
        // const customized_cart = await new EcomService().get_customized_cart();
        // if (customized_cart.length !== 0) {
        //   throw { type: "customized_cart_exists" };
        // }
        const cart = await new EcomService().check_cart_exists();

        let cartId;
        if (cart.length === 0) {
          const newCart = await new EcomService().add_to_cart();
          cartId = newCart.id;
        } else {
          cartId = cart[0].id;
        }

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10);

        await new EcomService().add_to_cart_products({
          product_id: product.id,
          item_id: product.item_id,
          cart_id: cartId,
          quantity: 1,
          delivery_date: deliveryDate.toISOString()
        });

        // Return the product data for success handling
        return product;
      },
      {
        afterSuccess: () => {
          toastWithTimeout(ToastVariant.Default, "Product added to cart successfully");
          
          // Simply update the cart count - don't manually add to localStorage
          // Let the navigation component's useEffect handle fetching the updated cart
          updateCartCount();
          
          // Also dispatch the cartUpdated event for any other listeners
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        },
        afterError: (error: any) => {
          if (error?.type === "customized_cart_exists") {
            toastWithTimeout(ToastVariant.Default, "Customized cart already exists");
          } else {
            console.log(error, "error");
            toastWithTimeout(ToastVariant.Default, "Login to add to cart");
          }
        }
      }
    );
  };

  return (
    <section
      className="w-full bg-white px-4 py-12"
      style={{ fontFamily: "'Anton', sans-serif" }} // Anton as a substitute for Integral CF
    >
      <div className="mx-auto max-w-7xl">
        <h2
          className="mb-12 text-center uppercase text-4xl md:text-5xl font-black text-[#1E1E2A] tracking-tight"
          style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
        >
          NEW ARRIVALS
        </h2>
        
        {/* Product Carousel - Now always visible */}
        <ProductCarousel 
          products={products} 
          handleProductClick={handleProductClick}
          handleAddToCart={handleAddToCart}
        />
      </div>
    </section>
  );
}

// Modified ProductCarousel component with auto-sliding functionality
const ProductCarousel = ({ 
  products, 
  handleProductClick, 
  handleAddToCart 
}: { 
  products: any[], 
  handleProductClick: (product: any) => void,
  handleAddToCart: (product: any) => void
}) => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api || products.length === 0) return;
    
    // Set the count once products are available
    setCount(products.length);
    
    // Set up the auto-slide interval
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000); // Change slide every 3 seconds
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [api, products]);

  // Update current index when the carousel slides
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", handleSelect);
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <div className="w-full">
      {/* Custom styles for button hover */}
      <style>
        {`
          .add-to-cart-btn {
            transition: background 0.2s, color 0.2s;
          }
          .add-to-cart-btn:not(.special):hover {
            background: #000 !important;
            color: #fff !important;
            border-color: #000 !important;
          }
          .add-to-cart-btn.special:hover {
            background: #fff !important;
            color: #000 !important;
            border-color: #000 !important;
          }
          .enquire-now-btn {
            transition: background 0.2s, color 0.2s;
          }
          .enquire-now-btn:hover {
            background: #22c55e !important; /* Tailwind green-500 */
            color: #fff !important;
            border-color: #22c55e !important;
          }
        `}
      </style>
      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
        {products.map((product) => {
  // Calculate discount percentage
  const originalPrice = product?.retail_price || 0; // Changed from purchase_price to retail_price
  const salePrice = product?.sale_price || 0;
  const discountPercentage = originalPrice > 0 
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) 
    : 0;
  
  // Check if this is the special product that should always have zoom effect
  // const isSpecialProduct = product.item_id === '7f5bf67a-64d6-41cf-8731-87f090592dda';
  const isSpecialProduct = product.item_id === '7cd84a3a-0a1b-4cc6-82ed-38ce6cfe8c99';
  
  return (
    <CarouselItem key={product.id} className="basis-full md:basis-1/2 lg:basis-1/4">
      <div className="flex justify-center px-4">
        <Card
          className={`w-full max-w-md bg-white rounded-2xl shadow-none border-0 ${
            isSpecialProduct ? 'relative z-10' : ''
          }`}
          style={{
            borderRadius: '24px',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            border: 'none',
          }}
        >
          <CardContent
            className="p-0 flex items-center justify-center"
            style={{
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              overflow: 'hidden',
              height: 280,
              background: '#f8f8f8',
            }}
          >
            <div
              className="relative cursor-pointer w-full h-full flex items-center justify-center"
              style={{ minHeight: 220, minWidth: 220 }}
              onClick={() => handleProductClick(product)}
            >
              {isSpecialProduct && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-2xl"></div>
              )}
              <Image
                src={
                  product?.img_url ||
                  product?.images?.[0]?.url ||
                  product?.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail)?.url ||
                  "/placeholder.svg"
                }
                alt={product.name}
                width={320}
                height={280}
                className={`object-fill w-full h-full transition-all duration-300 ${
                  isSpecialProduct
                    ? 'scale-125 brightness-110 animate-[]'
                    : 'hover:scale-105'
                }`}
                style={{
                  borderTopLeftRadius: '24px',
                  borderTopRightRadius: '24px',
                  background: '#f8f8f8',
                }}
              />
              {isSpecialProduct && (
                <div
                  className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md z-10"
                  style={{ fontFamily: "Poppins", fontWeight: "bold" }}
                >
                  Featured
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter
            className={`flex flex-col items-start gap-2 w-full px-6 pt-4 pb-6 ${
              isSpecialProduct ? 'bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl' : ''
            }`}
            style={{
              borderBottomLeftRadius: '24px',
              borderBottomRightRadius: '24px',
              background: '#fff',
            }}
          >
            {/* Product Name */}
            <h3
              className={`text-lg font-semibold text-black cursor-pointer w-full mb-2 ${
                isSpecialProduct ? 'font-bold' : ''
              } font-[Inter_Tight_Variable] font-inter-tight`}
              style={{
                fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
              onClick={() => handleProductClick(product)}
            >
              {product?.name}
            </h3>
            {/* Price, Discount, Retail Price */}
            <div className="flex items-center gap-3 mb-2">
              <p
                className={`font-semibold text-2xl ${
                  isSpecialProduct ? 'text-blue-700' : 'text-black'
                } font-[Inter_Tight_Variable] font-inter-tight`}
                style={{
                  fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                  fontWeight: 700,
                }}
              >
                ₹{product?.sale_price}
              </p>
              <p
                className="text-gray-400 line-through text-xl font-[Inter_Tight_Variable] font-inter-tight"
                style={{
                  fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                  fontWeight: 500,
                }}
              >
                ₹{product?.retail_price}
              </p>
              {discountPercentage > 0 && (
                <span
                  className={`text-sm ${
                    isSpecialProduct
                      ? 'bg-red-200 text-red-700 px-4 py-1'
                      : 'bg-red-100 text-red-600 px-4 py-1'
                  } rounded-full font-[Inter_Tight_Variable] font-inter-tight`}
                  style={{
                    fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                    fontWeight: 500,
                    background: '#ffeaea',
                  }}
                >
                  -{discountPercentage}%
                </span>
              )}
            </div>
            {/* Add to Cart Button */}
            <Button
              className={
                `w-full rounded-full border-2 text-lg font-semibold py-3 font-[Inter_Tight_Variable] font-inter-tight
                ${
                  product?.stock_quantity === 0
                    ? 'enquire-now-btn bg-green-600 text-white border-green-600 hover:border-green-700'
                    : isSpecialProduct
                    ? 'add-to-cart-btn special bg-black text-white border border-black'
                    : 'add-to-cart-btn bg-white text-black border-black'
                }`
              }
              style={{
                fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                border: '2px solid #e5e7eb',
                background: product?.stock_quantity === 0
                  ? '#16a34a'
                  : isSpecialProduct
                  ? '#000'
                  : '#fff',
                color: product?.stock_quantity === 0
                  ? '#fff'
                  : isSpecialProduct
                  ? '#fff'
                  : '#000',
                marginTop: 12,
                minHeight: 48,
              }}
              onClick={() =>
                product?.stock_quantity === 0
                  ? window.open(
                      'https://wa.me/+919995153455?text=I%20am%20interested%20in%20' +
                        encodeURIComponent(product?.name),
                      '_blank'
                    )
                  : handleAddToCart(product)
              }
            >
              {product?.stock_quantity === 0
                ? 'Enquire Now'
                : isSpecialProduct
                ? 'Add to Cart Now'
                : 'Add to Cart'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </CarouselItem>
  );
          })}
        </CarouselContent>
        
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative mr-4 transform-none disabled={false}"  />
          <div className="flex items-center justify-center gap-1 my-2">
            {Array.from({ length: count }).map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full ${
                  current === index ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <CarouselNext className="relative transform-none disabled={false}" />
        </div>
      </Carousel>
    </div>
  );
};