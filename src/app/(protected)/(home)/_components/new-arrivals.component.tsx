'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useMemo, useState, useRef } from 'react'
import { makeApiCall } from '@/lib/apicaller'
import { normalizeImageUrl } from '@/lib/image-url'
import { useRouter } from 'next/navigation'
import { EcomService } from '@/services/api/ecom-service'
import { useCurrency } from '@/app/CurrencyContext'
import { useCart } from '@/hooks/useCart'
import { ToastVariant, toastWithTimeout, toastWithAction } from '@/hooks/use-toast'
import { useAllProductsQuery } from '@/hooks/useCatalogQueries'
import { useInViewport } from '@/hooks/useInViewport'

interface Product {
  id: string
  name: string
  originalPrice: number
  discountedPrice: number
  discount: string
  image: string
  backgroundColor: string
}

export function NewArrivals() {
  const router = useRouter()
  const { currencySymbol } = useCurrency()
  const { cartProducts, handleIncrement, handleDecrement, updateCartCount, fetchCartProducts } = useCart()
  const { data: productsData = [], isLoading: loading } = useAllProductsQuery()
  
  // Animation state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const hasEntered = useInViewport(sectionRef, {
    threshold: 0.15,
    once: true,
    enabled: !loading && Array.isArray(productsData) && productsData.length > 0,
  })

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

  const products = useMemo(() => {
    const parseCreatedAt = (value: any) => {
      if (!value) return 0;
      let s = String(value);
      s = s.replace(' ', 'T');
      if (/\+\d{2}$/.test(s)) {
        s = `${s}:00`;
      }
      const t = Date.parse(s);
      return Number.isNaN(t) ? 0 : t;
    };

    const byNewest = (a: any, b: any) => parseCreatedAt(b?.created_at) - parseCreatedAt(a?.created_at);
    const featuredItemIds = [
      'bb26eadd-1fde-49fa-894a-3b2a9fb358cb',
      'cc8183c5-4693-4c11-86fe-e0eb608e8339',
      'b181097d-d49b-4427-b6a4-96578bf90a10',
    ];

    const getPriority = (product: any) => {
      const itemId = String(product?.item_id || product?.id || '').toLowerCase();
      const index = featuredItemIds.findIndex((featuredId) => featuredId === itemId);
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };

    const all = Array.isArray(productsData) ? productsData : [];
    const orderedProducts = [...all].sort((a: any, b: any) => {
      const priorityDiff = getPriority(a) - getPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      return byNewest(a, b);
    });

    return orderedProducts.slice(0, 3);
  }, [productsData]);

  const handleProductClick = (product: any) => {
    router.push(`/productinfo/${product.item_code || product.id}`);
  };

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const getDiscountPercentage = (originalPrice: number, salePrice: number) => {
    if (originalPrice <= 0) return 0;
    const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    return discount > 0 ? discount : 0;
  };

  const getBackgroundColor = (index: number) => {
    const colors = ['bg-amber-100', 'bg-amber-900', 'bg-purple-100'];
    return colors[index % colors.length];
  };

  if (loading) return null

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-white py-6 px-4 transition-colors duration-500 relative overflow-hidden"
    >
      {/* Ambient Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div 
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-amber-200/30 via-amber-100/15 to-transparent rounded-full blur-3xl transition-all duration-[1500ms] ease-out"
          style={{
            transform: hasEntered ? 'scale(1) translate(20%, -20%)' : 'scale(1.4) translate(40%, -40%)',
            opacity: hasEntered ? 1 : 0
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-purple-200/25 via-purple-100/10 to-transparent rounded-full blur-3xl transition-all duration-[1500ms] ease-out delay-300"
          style={{
            transform: hasEntered ? 'scale(1) translate(-20%, 20%)' : 'scale(1.4) translate(-40%, 40%)',
            opacity: hasEntered ? 1 : 0
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Drop Animation */}
        <h2 
          className="text-2xl text-gray-900 mb-8 transition-all duration-700 ease-out"
          style={{
            transform: hasEntered ? 'translateY(0)' : 'translateY(-20px)',
            opacity: hasEntered ? 1 : 0
          }}
        >
          <span className="
            font-playfair
            font-normal
            uppercase
            md:text-[40px]
            text-[24px]
            md:leading-[40px]
            leading-[24px]
          ">
            NEW ARRIVALS
          </span>
        </h2>

        {/* Products Grid with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {products.map((product, index) => {
            const originalPrice = product?.retail_price || product?.mrp || 0;
            const salePrice = product?.sale_price || product?.price || 0;
            const discountPercentage = getDiscountPercentage(originalPrice, salePrice);
            const backgroundColor = getBackgroundColor(index);

            return (
              <div
                key={product.item_id || product.id}
                className="relative md:aspect-[6/7] aspect-[3/4] rounded-none overflow-hidden cursor-pointer group transition-all duration-700 ease-out"
                style={{
                  transform: hasEntered ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
                  opacity: hasEntered ? 1 : 0,
                  transitionDelay: `${(index + 1) * 120}ms`
                }}
                onClick={() => handleProductClick(product)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Product Image Container with Premium Hover Effects */}
                <div 
                  className={`
                    absolute inset-0 w-full h-full 
                    transition-all duration-700 ease-out
                    ${hoveredIndex === index ? 'scale-105' : 'scale-100'}
                  `}
                >
                  {/* Reflective Border Effect */}
                  <div className={`
                    absolute inset-0 z-30 pointer-events-none
                    border-2 transition-all duration-700
                    ${hoveredIndex === index 
                      ? 'border-white/40 opacity-100' 
                      : 'border-white/0 opacity-0'
                    }
                  `} />

                  {/* Vignette Overlay */}
                  <div className={`
                    absolute inset-0 z-20
                    bg-gradient-to-t from-black/40 via-transparent to-transparent
                    transition-opacity duration-700
                    ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}
                  `} />

                  {/* Shimmer Effect */}
                  <div className={`
                    absolute inset-0 z-25 overflow-hidden
                    transition-opacity duration-500
                    ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}
                  `}>
                    <div 
                      className="
                        absolute inset-0 
                        bg-gradient-to-r from-transparent via-white/30 to-transparent
                        skew-x-12 w-1/2
                      "
                      style={{
                        animation: hoveredIndex === index ? 'shimmerSweep 1.2s ease-out' : 'none',
                        transform: 'translateX(-150%)',
                      }}
                    />
                  </div>

                  {product?.images && product.images.length > 0 ? (
                    <Image
                      src={normalizeImageUrl(
                        product.images.find(
                          (img: { url: string; is_thumbnail?: boolean }) => img.is_thumbnail
                        )?.url || product.images[0].url
                      )}
                      alt={product?.name || product?.item_name}
                      fill
                      className={`
                        object-cover object-center
                        transition-all duration-700 ease-out
                        ${hoveredIndex === index ? 'brightness-110' : 'brightness-100'}
                      `}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">[Product]</span>
                    </div>
                  )}
                </div>

                {/* Discount Badge with Entry Animation */}
                {discountPercentage > 0 && (
                  <span 
                    className="absolute top-3 right-3 z-10 bg-black text-white font-poppins font-normal text-[11px] leading-[16px] tracking-normal text-right uppercase px-3 py-1 transition-all duration-500"
                    style={{
                      transform: hasEntered ? 'translateX(0) rotate(0deg)' : 'translateX(20px) rotate(5deg)',
                      opacity: hasEntered ? 1 : 0,
                      transitionDelay: `${(index + 1) * 120 + 200}ms`
                    }}
                  >
                    SAVE {discountPercentage}%
                  </span>
                )}

                {/* Product Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  {/* Name and Price - Hidden on Hover (Desktop Only) */}
                  <div className={`
                    bg-white/35 backdrop-blur-[21px] rounded-none p-3 
                    transition-all duration-500 ease-out
                    ${hoveredIndex === index ? 'lg:opacity-0 lg:translate-y-2' : 'opacity-100 translate-y-0'}
                  `}>
                    {/* Product Name */}
                    <h3 className="
                      font-poppins
                      font-normal
                      uppercase
                      text-[#1B1B19]
                      text-[15px]
                      leading-[25px]
                      align-middle
                      mb-1
                    ">
                      {product?.name || product?.item_name}
                    </h3>

                    {/* Price */}
                    <div className="flex gap-2 items-baseline">
                      <span className="
                        font-poppins
                        font-normal
                        uppercase
                        text-[#1B1B19]
                        text-[15px]
                        leading-[25px]
                        align-middle
                      ">
                        {currencySymbol}{formatPrice(salePrice)}
                      </span>

                      {originalPrice > 0 && originalPrice > salePrice && (
                        <span className="
                          font-poppins
                          font-normal
                          uppercase
                          text-gray-500
                          text-[14px]
                          leading-[20px]
                          line-through
                          align-middle
                        ">
                          {currencySymbol}{formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button - Shows on Hover (Desktop) / Always Visible (Mobile) */}
                  <div className={`
                    lg:absolute lg:inset-4 
                    bg-white/15 backdrop-blur-[21px] rounded-none p-3 
                    flex items-center justify-center
                    transition-all duration-500 ease-out
                    ${hoveredIndex === index 
                      ? 'lg:opacity-100 lg:translate-y-0' 
                      : 'lg:opacity-0 lg:translate-y-2 lg:pointer-events-none'
                    }
                  `}>
                    {cartProducts.find(p => p.item_id === product.item_id) ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecrement(product.item_id);
                          }}
                        >
                          -
                        </Button>
                        <span className="text-sm font-medium">
                          {cartProducts.find(p => p.item_id === product.item_id)?.localQuantity || 1}
                        </span>
                        <Button
                          className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIncrement(product.item_id);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-white/15 backdrop-blur-[21px] text-gray-900 rounded-none hover:bg-gray-800 hover:text-white transition-all duration-300 hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                      >
                        ADD TO CART
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shop All Button with Entrance Animation */}
        <div 
          className="flex justify-center transition-all duration-700 ease-out"
          style={{
            transform: hasEntered ? 'translateY(0)' : 'translateY(20px)',
            opacity: hasEntered ? 1 : 0,
            transitionDelay: '600ms'
          }}
        >
          <Button
            variant="outline"
            className="
              px-10 py-2 text-sm font-poppins font-normal 
              md:w-auto w-full 
              border-gray-400 rounded-none
              transition-all duration-300 
              hover:scale-105 hover:border-gray-900 hover:shadow-lg
              active:scale-100
            "
            onClick={() => router.push('/product')}
          >
            SHOP ALL
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmerSweep {
          0% {
            transform: translateX(-150%) skewX(12deg);
          }
          100% {
            transform: translateX(250%) skewX(12deg);
          }
        }

        @keyframes gradient-radial {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
      `}</style>
    </section>
  )
}
