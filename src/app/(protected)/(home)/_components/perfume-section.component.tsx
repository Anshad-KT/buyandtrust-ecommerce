'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { makeApiCall } from '@/lib/apicaller'
import { useRouter } from 'next/navigation'
import { EcomService } from '@/services/api/ecom-service'
import { useLogin } from '@/app/LoginContext'
import { useCart } from '@/hooks/useCart'
import { ToastVariant, toastWithTimeout, toastWithAction } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrency } from '@/app/CurrencyContext'
import { motion, AnimatePresence } from 'framer-motion'

export function PerfumeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { currencySymbol } = useCurrency()
  const { cartProducts, handleIncrement, handleDecrement, updateCartCount, fetchCartProducts } = useCart()

  // Category IDs for perfume products
  const perfumeCategoryIds = [
    "e50d9171-9c0e-4fa3-9b1d-eaf5c7839ba7", // AMBIENCE PERFUMES (PREMIUM RANGE)
    "dd91dd23-a2cc-44a2-b40b-73a341e5b849"  // PREMIUM CAR PERFUMES
  ]

  useEffect(() => {
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
          const all = Array.isArray(data) ? data : [];

          // Filter products that belong to the specified perfume categories
          const perfumeProducts = all.filter(product =>
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
          const newest = [...perfumeProducts].sort(byNewest);

          setProducts(newest);
          setLoading(false);
        },
        afterError: (error: any) => {
          console.error('Failed to fetch perfume products:', error);
          setLoading(false);
        }
      }
    );
  }, []);

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

  if (loading) {
    return (
      <section
        className="py-16 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: `url('/home/perfumebg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Tagline */}
            <div className="text-center lg:text-left">
              <p className="text-[#393939] mb-2 perfume-text" style={{ fontWeight: 400, fontStyle: 'normal', fontSize: '48px', lineHeight: '56px', letterSpacing: '0%', verticalAlign: 'middle' }}>
                Perfume
              </p>
              <h2 className="text-[#393939] leading-tight" style={{ fontFamily: 'Recoleta', fontWeight: 400, fontStyle: 'normal', fontSize: '48px', lineHeight: '56px', letterSpacing: '0%', verticalAlign: 'middle', textTransform: 'uppercase' }}>
                CRAFTED FOR
                <br />
                LASTING
                <br />
                IMPRESSIONS
              </h2>
            </div>

            {/* Right side - Loading Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-none" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const currentProduct = products[currentIndex]

  return (
    <section
      className="py-16 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `url('/home/perfumebg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Tagline */}
          <div className="text-center lg:text-left">
            <p className="mb-2 text-[#393939] font-shadows-into-light text-[48px] leading-[56px]">
              Perfume
            </p>

            <h2 className="font-recoletaLike text-[#393939] text-[48px] leading-[56px] uppercase font-normal align-middle ">              CRAFTED FOR
              <br />
              LASTING
              <br />
              IMPRESSIONS
            </h2>
          </div>

          {/* Right side - Products Grid */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                {products.slice(currentIndex, currentIndex + 2).map((product, index) => {
                  const originalPrice = product?.retail_price || product?.mrp || 0;
                  const salePrice = product?.sale_price || product?.price || 0;
                  const discountPercentage = getDiscountPercentage(originalPrice, salePrice);

                  return (
                    <motion.div
                      key={product.item_id || product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative aspect-[3/4] rounded-none overflow-hidden cursor-pointer group"
                      onClick={() => handleProductClick(product)}
                    >
                      {/* Product Image - Full Background */}
                      <div className="absolute inset-0 hover:scale-105 transition-all duration-200">
                        {product?.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0].url}
                            alt={product?.name || product?.item_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">[Product]</span>
                          </div>
                        )}
                      </div>

                      {/* Discount Badge */}
                      {discountPercentage > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.2 }}
                          className="absolute top-3 right-3 z-10 bg-black text-white font-poppins font-normal text-[11px] leading-[16px] tracking-normal text-right uppercase px-3 py-1"
                        >
                          SAVE {discountPercentage}%
                        </motion.div>
                      )}

                      {/* Product Info Overlay on Image */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {/* Name and Price - Hidden on Hover (Desktop Only) */}
                        <div className="bg-white/15 backdrop-blur-[21px] rounded-none p-3 transition-all duration-300 opacity-100 lg:group-hover:opacity-0">

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


                        {/* Add to Cart Button - Always Visible on Mobile, Shows on Hover on Desktop */}
                        <div className="lg:absolute lg:inset-4 lg:opacity-0 lg:group-hover:opacity-100 bg-white/15 backdrop-blur-[21px] rounded-none p-3 flex items-center justify-center">
                          {cartProducts.find(p => p.item_id === String(product.item_id || product.id)) ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-colors"
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
                                className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-colors"
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
                              className="w-full bg-white/15 backdrop-blur-[21px] text-gray-900 rounded-none hover:bg-gray-800 hover:text-white transition-colors"
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

            {/* Next Button - Positioned at bottom right */}
            <div className="absolute bottom-44 right-4">
              <button
                onClick={nextSlide}
                aria-label="Next products"
              >
                <img src="/home/nextbutton.svg" alt="Next" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
