'use client'
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { makeApiCall } from "@/lib/apicaller";
import { ToastVariant, toastWithTimeout, toastWithAction } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useLogin } from "@/app/LoginContext";
import '@fontsource-variable/inter-tight';
import '@fontsource/anton';
import { Skeleton } from "@/components/ui/skeleton";
import QuantityCounter from "@/components/common/quantity-counter";
import { useCart } from "@/hooks/useCart";

import { EcomService } from "@/services/api/ecom-service";
 



export default function TrendingProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  const { cartProducts, handleIncrement, handleDecrement, updateCartCount, fetchCartProducts } = useCart();
  
  const { setCartItemCount } = useLogin();
  
  const handleProductClick = (product: any) => {
    router.push(`/productinfo/${product.item_id || product.id}`);
  };
  
  useEffect(() => {
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
          const featuredItemIds = 
          // [
          //   'c4008fd1-b4fa-4664-8fea-54ff36e5eb31',
          //   '838f7b2a-97ca-49e9-ae7b-0ee89e61e6e4', 
          //   '39fc163f-3e1d-4aaf-afe6-3ae9812f672f',
          //   '553ccc99-f570-46fa-bd46-978862677e4b',
          //   '83583591-cd4c-441e-847f-fdefc7fe9486'
          // ];
          [
            '387b13e5-4fa2-4750-9780-db1346b241f1',
            '5625ff85-1d68-4242-bd8b-8dbc2502fbd4', 
            'fcc9a7a2-ff4e-4e3a-8fb2-10e9bf3a2969',
            'ab0d2ff7-a1da-4434-bbf0-e4e994de7c7c',
            'a12b1cc1-b2dc-4bb8-87fa-c27aef186bb2'
          ];

          const filteredProducts = data.filter((product: any) => 
            featuredItemIds.includes(product.item_id)
          );
          // console.log("filteredProducts",filteredProducts );
          setProducts(filteredProducts);
        }
      }
    )
  }, [])

  const handleAddToCart = async (product: any) => {
    makeApiCall(
      async () => {

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

        return product;
      },
      {
        afterSuccess: () => {
          toastWithAction(
            ToastVariant.Default, 
            "Product added to cart successfully",
            "View Cart",
            () => router.push('/cart')
          );
          
          updateCartCount();
          // Refresh cartProducts so the UI switches to QuantityCounter immediately
          fetchCartProducts();
          
          window.dispatchEvent(new CustomEvent('cartUpdated'));
        },
        afterError: (error: any) => {
          if (error?.type === "customized_cart_exists") {
            toastWithTimeout(ToastVariant.Default, "Customized cart already exists");
          } else {
            toastWithTimeout(ToastVariant.Default, "Error adding product to cart");
          }
        }
      }
    );
  };

  return (
    <section
      className="w-full bg-white px-4 py-12"
      style={{ fontFamily: "'Anton', sans-serif" }}
    >
      <div className="mx-auto max-w-7xl">
        <h2
          className="mb-12 text-center uppercase text-4xl md:text-5xl font-black text-[#1E1E2A] tracking-tight"
          style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
        >
          NEW ARRIVALS
        </h2>
        {/* Product Carousel - Now always visible */}
        {products.length === 0 ? <TrendingProductsSkeleton /> : (
          <ProductCarousel 
            products={products} 
            cartProducts={cartProducts}
            handleProductClick={handleProductClick}
            handleAddToCart={handleAddToCart}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
          />
        )}
      </div>
    </section>
  );
}

function TrendingProductsSkeleton() {
  return (
    <div className="w-full">
      <div className="flex justify-center gap-8">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="w-full max-w-[270px] bg-white rounded-2xl shadow-none border-0 flex flex-col" style={{ borderRadius: '24px', minWidth: 0 }}>
            <div className="p-0 flex items-center justify-center" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px', overflow: 'hidden', height: 250, background: '#f8f8f8' }}>
              <Skeleton className="w-full h-full rounded-2xl" />
            </div>
            <div className="flex flex-col items-start gap-2 w-full px-4 pt-3 pb-4" style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', background: '#fff' }}>
              <Skeleton className="h-5 w-3/4 mb-1 rounded-md" />
              <div className="flex items-center gap-2 mb-1 w-full">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-full mt-2" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-black' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
  );
}

const ProductCarousel = ({
  products,
  cartProducts,
  handleProductClick,
  handleAddToCart,
  handleIncrement,
  handleDecrement,
}: {
  products: any[],
  cartProducts: any[],
  handleProductClick: (product: any) => void,
  handleAddToCart: (product: any) => void
  handleIncrement: (productId: string) => void,
  handleDecrement: (productId: string) => void,
}) => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);

      if (api) {
        api.reInit();
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [api]);

  useEffect(() => {
    if (!api || products.length === 0) return;
    setCount(products.length);

    const interval = setInterval(() => {
      api.scrollNext();
    }, 2000);

    return () => clearInterval(interval);
  }, [api, products]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    handleSelect();

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <div className="w-full">
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
            background: #22c55e !important;
            color: #fff !important;
            border-color: #22c55e !important;
          }
        `}
      </style>
      <Carousel
        className="w-full touch-pan-y"
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
          dragFree: isMobile,
          containScroll: "trimSnaps",
          slidesToScroll: 1,
          skipSnaps: false
        }}
      >
        <CarouselContent>
          {products.map((product) => {
            const originalPrice = product?.retail_price || 0;
            const salePrice = product?.sale_price || 0;
            const discountPercentage = originalPrice > 0
              ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
              : 0;

            // const isSpecialProduct = product.item_id === '83583591-cd4c-441e-847f-fdefc7fe9486';
              const isSpecialProduct = product.item_id === 'a12b1cc1-b2dc-4bb8-87fa-c27aef186bb2';

            return (
              <CarouselItem
                key={product.id}
                // Show 3 at a time on desktop, 2 on tablet, 1 on mobile
                className="basis-[95%] sm:basis-1/2 md:basis-1/3 lg:basis-1/3 px-1"
              >
                <div className="flex justify-center px-1">
                  <Card
                    className={`w-full max-w-[270px]  bg-white rounded-2xl shadow-none border-0 ${isSpecialProduct ? 'relative z-10' : ''}`}
                    style={{
                      borderRadius: '24px',
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                      border: 'none',
                      width: 260,
                      minWidth: 0,
                    }}
                  >
                    <CardContent
                      className="p-0 flex items-center justify-center"
                      style={{
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        overflow: 'hidden',
                        height: 250,
                        background: '#f8f8f8',
                      }}
                    >
                      <div
                        className="relative cursor-pointer w-full h-full flex items-center justify-center"
                        style={{ minHeight: 210, minWidth: 160 }}
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
                            "/productpage/noimage.svg"
                          }
                          alt={product.name}
                          width={200}
                          height={230}
                          className={`object-cover w-full h-full transition-all duration-300 ${
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
                      className={`flex flex-col items-start gap-2 w-full px-4 pt-3 pb-4 ${
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
                        className={`text-base font-semibold text-black cursor-pointer w-full mb-1 ${
                          isSpecialProduct ? 'font-bold' : ''
                        } font-[Inter_Tight_Variable] font-inter-tight`}
                        style={{
                          fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                          lineHeight: 1.2,
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                        }}
                        onClick={() => handleProductClick(product)}
                        title={product?.name}
                      >
                        {product?.name}
                      </h3>
                      {/* Price, Discount, Retail Price */}
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`font-semibold text-lg ${
                            isSpecialProduct ? 'text-blue-700' : 'text-black'
                          } font-[Inter_Tight_Variable] font-inter-tight`}
                          style={{
                            fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          ₹{product?.sale_price}
                        </p>
                        {typeof product?.retail_price === 'number' && product.retail_price > 0 && (
                          <p
                            className="text-gray-400 line-through text-base font-[Inter_Tight_Variable] font-inter-tight"
                            style={{
                              fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                              fontWeight: 500,
                            }}
                          >
                            ₹{product?.retail_price}
                          </p>
                        )}
                        {typeof product?.retail_price === 'number' && product.retail_price > 0 && discountPercentage > 0 && (
                          <span
                            className={`text-xs ${
                              isSpecialProduct
                                ? 'bg-red-200 text-red-700 px-2 py-0.5'
                                : 'bg-red-100 text-red-600 px-2 py-0.5'
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
                      {cartProducts.find(p => p.item_id === product.item_id) ? (
                        <QuantityCounter
                          quantity={cartProducts.find(p => p.item_id === product.item_id)?.localQuantity}
                          onIncrement={() => handleIncrement(product.item_id)}
                          onDecrement={() => handleDecrement(product.item_id)}
                        />
                      ) : (
                        <Button
                          className={
                            `w-full rounded-full border-2 text-base font-semibold py-2 font-[Inter_Tight_Variable] font-inter-tight
                            ${
                              product?.stock_quantity <= 0
                                ? 'enquire-now-btn bg-green-600 text-white border-green-600 hover:border-green-700'
                                : isSpecialProduct
                                ? 'add-to-cart-btn special bg-black text-white border border-black'
                                : 'add-to-cart-btn bg-white text-black border-black'
                            }`
                          }
                          style={{
                            fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif",
                            border: '2px solid #e5e7eb',
                            background: product?.stock_quantity <= 0
                              ? '#16a34a'
                              : isSpecialProduct
                              ? '#000'
                              : '#fff',
                            color: product?.stock_quantity === 0
                              ? '#fff'
                              : isSpecialProduct
                              ? '#fff'
                              : '#000',
                            marginTop: 8,
                            minHeight: 40,
                          }}
                          onClick={() =>
                            product?.stock_quantity <= 0
                              ? window.open(
                                  'https://wa.me/+919995303951?text=I%20am%20interested%20in%20' +
                                    encodeURIComponent(product?.name),
                                  '_blank'
                                )
                              : handleAddToCart(product)
                          }
                        >
                          {product?.stock_quantity <= 0
                            ? 'Enquire Now'
                            : isSpecialProduct
                            ? 'Add to Cart Now'
                            : 'Add to Cart'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="flex justify-center mt-4">
          <button
            className="relative mr-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              if (api) api.scrollPrev();
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex items-center justify-center gap-2 my-2">
            {Array.from({ length: count }).map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full ${
                  current === index ? "bg-black" : "bg-gray-300"
                }`}
                onClick={() => api?.scrollTo(index)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
          <button
            className="relative ml-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              if (api) api.scrollNext();
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </Carousel>
    </div>
  );
};