'use client'

import { useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { makeApiCall } from '@/lib/apicaller'
import { normalizeImageUrl } from '@/lib/image-url'
import { useRouter } from 'next/navigation'
import { EcomService } from '@/services/api/ecom-service'
import { useCart } from '@/hooks/useCart'
import { ToastVariant, toastWithTimeout, toastWithAction } from '@/hooks/use-toast'
import { useCurrency } from '@/app/CurrencyContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useAllProductsQuery } from '@/hooks/useCatalogQueries'
import { useInViewport } from '@/hooks/useInViewport'

export function PerfumeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
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

  // Category IDs for perfume products
  const perfumeCategoryIds = [
    "e50d9171-9c0e-4fa3-9b1d-eaf5c7839ba7", // AMBIENCE PERFUMES (PREMIUM RANGE)
    "dd91dd23-a2cc-44a2-b40b-73a341e5b849"  // PREMIUM CAR PERFUMES
  ]

  const products = useMemo(() => {
    const all = Array.isArray(productsData) ? productsData : [];

    // Filter products that belong to the specified perfume categories
    const perfumeProducts = all.filter((product: any) =>
      perfumeCategoryIds.includes(product.item_category_id)
    );

    // Sort by newest first
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
    const getName = (product: any) => String(product?.name || product?.item_name || '').toLowerCase();
    const getPriority = (product: any) => {
      const name = getName(product);
      if (name.includes('royal john')) return 0;
      if (name.includes('roycen berg')) return 1;
      return 2;
    };

    return [...perfumeProducts].sort((a, b) => {
      const priorityDiff = getPriority(a) - getPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      return byNewest(a, b);
    });
  }, [productsData]);

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
          item_id: product.item_id || product.id,
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

  const handleProductClick = (product: any) => {
    router.push(`/productinfo/${product.item_code || product.id}`);
  };

  const getDiscountPercentage = (originalPrice: number, salePrice: number) => {
    if (originalPrice <= 0) return 0;
    const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    return discount > 0 ? discount : 0;
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, products.length - 2)
      return prevIndex >= maxIndex ? 0 : prevIndex + 2
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, products.length - 2)
      return prevIndex <= 0 ? maxIndex : prevIndex - 2
    })
  }

  if (loading) return null

  const currentProduct = products[currentIndex]

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-all duration-500"
      style={{
        backgroundImage: `url('/home/perfumebg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Ambient Overlay Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft vignette */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 transition-opacity duration-1000"
          style={{
            opacity: hasEntered ? 1 : 0
          }}
        />
        
        {/* Floating glow accents */}
        <div 
          className="absolute top-1/4 left-0 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl transition-all duration-[1500ms]"
          style={{
            transform: hasEntered ? 'scale(1) translateX(0)' : 'scale(1.3) translateX(-60px)',
            opacity: hasEntered ? 0.4 : 0
          }}
        />
        <div 
          className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl transition-all duration-[1500ms] delay-200"
          style={{
            transform: hasEntered ? 'scale(1) translateX(0)' : 'scale(1.3) translateX(60px)',
            opacity: hasEntered ? 0.3 : 0
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Tagline with Entrance Animation */}
          <div 
            className="text-center lg:text-left transition-all duration-700 ease-out"
            style={{
              transform: hasEntered ? 'translateX(0)' : 'translateX(-30px)',
              opacity: hasEntered ? 1 : 0
            }}
          >
            <p 
              className="mb-2 text-[#393939] font-shadows-into-light text-[48px] leading-[56px] transition-all duration-500"
              style={{
                transform: hasEntered ? 'translateY(0)' : 'translateY(-10px)',
                transitionDelay: '100ms'
              }}
            >
              Sellers of
            </p>

            <h2 
              className="font-recoletaLike text-[#393939] text-[48px] leading-[56px] uppercase font-normal align-middle transition-all duration-500"
              style={{
                transform: hasEntered ? 'translateY(0)' : 'translateY(-10px)',
                transitionDelay: '200ms'
              }}
            >
              World's #1
              <br />
              Premium Car
              <br />
              Perfume
            </h2>
          </div>

          {/* Right side - Products Grid */}
          <div 
            className="relative overflow-hidden transition-all duration-700 ease-out"
            style={{
              transform: hasEntered ? 'translateX(0)' : 'translateX(30px)',
              opacity: hasEntered ? 1 : 0,
              transitionDelay: '300ms'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                {products.slice(currentIndex, currentIndex + 2).map((product, index) => {
                  const originalPrice = product?.retail_price || product?.mrp || 0;
                  const salePrice = product?.sale_price || product?.price || 0;
                  const discountPercentage = getDiscountPercentage(originalPrice, salePrice);
                  const isHovered = hoveredIndex === index;

                  return (
                    <motion.div
                      key={product.item_id || product.id}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                      className="relative aspect-[3/4] rounded-none overflow-hidden cursor-pointer group"
                      onClick={() => handleProductClick(product)}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Product Image Container with Premium Effects */}
                      <div 
                        className={`
                          absolute inset-0 
                          transition-all duration-700 ease-out
                          ${isHovered ? 'scale-110' : 'scale-100'}
                        `}
                      >
                        {/* Reflective Border */}
                        <div className={`
                          absolute inset-0 z-30 pointer-events-none
                          border-2 transition-all duration-700
                          ${isHovered 
                            ? 'border-white/40 opacity-100' 
                            : 'border-white/0 opacity-0'
                          }
                        `} />

                        {/* Vignette Overlay */}
                        <div className={`
                          absolute inset-0 z-20
                          bg-gradient-to-t from-black/50 via-transparent to-transparent
                          transition-opacity duration-700
                          ${isHovered ? 'opacity-100' : 'opacity-30'}
                        `} />

                        {/* Shimmer Effect */}
                        <div className={`
                          absolute inset-0 z-25 overflow-hidden
                          transition-opacity duration-500
                          ${isHovered ? 'opacity-100' : 'opacity-0'}
                        `}>
                          <div 
                            className="
                              absolute inset-0 
                              bg-gradient-to-r from-transparent via-white/40 to-transparent
                              skew-x-12 w-1/2
                            "
                            style={{
                              animation: isHovered ? 'shimmerSweep 1.2s ease-out' : 'none',
                              transform: 'translateX(-150%)',
                            }}
                          />
                        </div>

                        {product?.images && product.images.length > 0 ? (
                          <Image
                            unoptimized
                            src={
                              normalizeImageUrl(
                                product.images.find((img: { url: string; is_thumbnail?: boolean }) => img.is_thumbnail)?.url ||
                                product.images[0].url
                              )
                            }
                            alt={product?.name || product?.item_name}
                            fill
                            className={`
                              object-cover transition-all duration-700
                              ${isHovered ? 'brightness-110' : 'brightness-100'}
                            `}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">[Product]</span>
                          </div>
                        )}
                      </div>

                      {/* Discount Badge with Premium Animation */}
                      {discountPercentage > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                          className={`
                            absolute top-3 right-3 z-10 
                            bg-black text-white 
                            font-poppins font-normal text-[11px] leading-[16px] 
                            tracking-normal text-right uppercase px-3 py-1
                            transition-all duration-500
                            ${isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
                          `}
                        >
                          SAVE {discountPercentage}%
                        </motion.div>
                      )}

                      {/* Product Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        {/* Name and Price - Hidden on Hover (Desktop Only) */}
                        <div className={`
                          bg-white/15 backdrop-blur-[21px] rounded-none p-3 
                          transition-all duration-500 ease-out
                          ${isHovered ? 'lg:opacity-0 lg:translate-y-2' : 'opacity-100 translate-y-0'}
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
                              {currencySymbol}{salePrice.toFixed(2)}
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
                                {currencySymbol}{originalPrice.toFixed(2)}
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
                          ${isHovered 
                            ? 'lg:opacity-100 lg:translate-y-0' 
                            : 'lg:opacity-0 lg:translate-y-2 lg:pointer-events-none'
                          }
                        `}>
                          {cartProducts.find(p => p.item_id === String(product.item_id || product.id)) ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDecrement(String(product.item_id || product.id));
                                }}
                              >
                                -
                              </Button>
                              <span className="text-sm font-medium">
                                {cartProducts.find(p => p.item_id === String(product.item_id || product.id))?.localQuantity || 1}
                              </span>
                              <Button
                                className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIncrement(String(product.item_id || product.id));
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
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Next Button with Hover Effect */}
            <div 
              className="absolute bottom-44 right-4 transition-all duration-700 ease-out"
              style={{
                transform: hasEntered ? 'scale(1) translateX(0)' : 'scale(0.8) translateX(20px)',
                opacity: hasEntered ? 1 : 0,
                transitionDelay: '500ms'
              }}
            >
              <button
                onClick={nextSlide}
                aria-label="Next products"
                className="transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <img src="/home/nextbutton.svg" alt="Next" />
              </button>
            </div>
          </div>
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
      `}</style>
    </section>
  )
}
