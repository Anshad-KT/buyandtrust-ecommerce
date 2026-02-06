'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { makeApiCall } from '@/lib/apicaller'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { EcomService } from '@/services/api/ecom-service'
import { useCurrency } from '@/app/CurrencyContext'
import { useLogin } from '@/app/LoginContext'
import { useCart } from '@/hooks/useCart'
import { ToastVariant, toastWithTimeout, toastWithAction } from '@/hooks/use-toast'

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
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { currencySymbol } = useCurrency()
  const { cartProducts, handleIncrement, handleDecrement, updateCartCount, fetchCartProducts } = useCart()

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

  useEffect(() => {
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
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

          const all = Array.isArray(data) ? data : [];
          const newest = [...all].sort(byNewest);

          // Get only the 3 newest products
          const selected = newest.slice(0, 3);

          setProducts(selected);
          setLoading(false);
        },
        afterError: (error: any) => {
          console.error('Failed to fetch products:', error);
          setLoading(false);
        }
      }
    );
  }, []);

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

  if (loading) {
    return (
      <section className="w-full bg-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-none" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-2xl text-gray-900 mb-8">
          <span className="
      font-playfair
      font-normal
      uppercase
      md:text-[40px]
      text-[24px]
      md:leading-[40px]
      leading-[24px]
    ">NEW ARRIVALS</span>
        </h2>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {products.map((product, index) => {
            const originalPrice = product?.retail_price || product?.mrp || 0;
            const salePrice = product?.sale_price || product?.price || 0;
            const discountPercentage = getDiscountPercentage(originalPrice, salePrice);
            const backgroundColor = getBackgroundColor(index);

            return (
              <div
                key={product.item_id || product.id}
                className="relative aspect-[3/4] rounded-none overflow-hidden cursor-pointer group"
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image - Full Background */}
                <div className="absolute inset-0 md:hover:scale-105 transition-all duration-200">
                  {product?.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product?.name || product?.item_name}
                      fill
                      // width={800}
                      // height={700}
                      className="object-fill"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">[Product]</span>
                    </div>
                  )}
                </div>

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <span className="absolute top-3 right-3 z-10 bg-black text-white text-xs font-semibold px-3 py-1">
                    -{discountPercentage}%
                  </span>
                )}

                {/* Product Info Overlay on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {/* Name and Price - Hidden on Hover (Desktop Only) */}
                  <div className="bg-white/35 backdrop-blur-[21px] rounded-none p-3 transition-all duration-300 opacity-100 lg:group-hover:opacity-0">

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


                  {/* Add to Cart Button - Always Visible on Mobile, Shows on Hover on Desktop */}
                  <div className="lg:absolute lg:inset-4 lg:opacity-0 lg:group-hover:opacity-100 bg-white/15 backdrop-blur-[21px] rounded-none p-3 flex items-center justify-center">
                    {cartProducts.find(p => p.item_id === product.item_id) ? (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-colors"
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
                          className="bg-gray-200 text-black rounded-none hover:bg-gray-300 transition-colors"
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
              </div>
            );
          })}
        </div>

        {/* Shop All Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="px-10 py-2 text-sm font-poppins font-normal md:w-auto w-full hover:scale-105 transition-all duration-200 border-gray-400 rounded-none"
            onClick={() => router.push('/product')}
          >
            SHOP ALL
          </Button>
        </div>
      </div>
    </section>
  )
}
