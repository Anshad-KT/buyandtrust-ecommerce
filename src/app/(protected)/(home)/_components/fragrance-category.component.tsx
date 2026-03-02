'use client'

import { useRouter } from "next/navigation"
import * as React from "react"
import { ArrowRight } from 'lucide-react'
import { normalizeImageUrl } from "@/lib/image-url"
import { useAllCategoriesQuery, useAllProductsQuery } from "@/hooks/useCatalogQueries"
import { useInViewport } from "@/hooks/useInViewport"

type CategoryItem = { id: string; label: string; imageUrl?: string }
type ProductItem = {
  id: string
  slug: string
  name: string
  categoryId: string
  imageUrl?: string
}
type CategorySection = { category: CategoryItem; products: ProductItem[] }

const MAX_PRODUCTS_PER_CATEGORY = 5

interface FragranceComponentProps {
  isExiting?: boolean;
  onExitComplete?: () => void;
}

export function FragranceComponent({ isExiting = false, onExitComplete }: FragranceComponentProps) {
  const { data: categoriesData = [], isLoading: categoriesLoading } = useAllCategoriesQuery()
  const { data: productsData = [], isLoading: productsLoading } = useAllProductsQuery()
  const router = useRouter()

  // Animation state - MUST be before early returns
  const sectionRef = React.useRef<HTMLElement>(null)
  const hasEntered = useInViewport(sectionRef, {
    threshold: 0.15,
    once: true,
    enabled:
      !categoriesLoading &&
      !productsLoading &&
      ((Array.isArray(categoriesData) && categoriesData.length > 0) ||
        (Array.isArray(productsData) && productsData.length > 0)),
  })

  const sections = React.useMemo<CategorySection[]>(() => {
    const categoryItems: CategoryItem[] = (Array.isArray(categoriesData) ? categoriesData : []).map((category: any) => ({
      id: category.item_category_id,
      label: category.name,
      imageUrl: category.image_url,
    }))

    const allProducts: ProductItem[] = (Array.isArray(productsData) ? productsData : [])
      .map((product: any) => ({
        id: String(product?.item_id || product?.id || ""),
        slug: String(product?.item_code || product?.id || product?.item_id || ""),
        name: String(product?.name || product?.item_name || "Product"),
        categoryId: String(product?.item_category_id || ""),
        imageUrl: product?.images?.find((img: { url: string; is_thumbnail?: boolean }) => img.is_thumbnail)?.url || product?.images?.[0]?.url || product?.img_url || undefined,
      }))
      .filter((product: ProductItem) => Boolean(product.id && product.categoryId))

    const groupedProducts = allProducts.reduce<Map<string, ProductItem[]>>((acc, product) => {
      const existingProducts = acc.get(product.categoryId) || []
      existingProducts.push(product)
      acc.set(product.categoryId, existingProducts)
      return acc
    }, new Map())

    return categoryItems
      .map((category) => ({
        category,
        products: (groupedProducts.get(category.id) || []).slice(0, MAX_PRODUCTS_PER_CATEGORY),
      }))
      .filter((section) => section.products.length > 0)
  }, [categoriesData, productsData])

  const loading = categoriesLoading || productsLoading

  // Trigger onExitComplete callback after exit animation finishes
  React.useEffect(() => {
    if (isExiting && hasEntered) {
      const timer = setTimeout(() => {
        onExitComplete?.();
      }, 1000); // Match the longest transition duration
      return () => clearTimeout(timer);
    }
  }, [isExiting, hasEntered, onExitComplete]);

  const animationState = !isExiting && hasEntered;

  const goToCategory = (categoryId: string) => {
    router.push(`/product?category=${encodeURIComponent(categoryId)}`)
  }

  const goToProduct = (product: ProductItem) => {
    router.push(`/productinfo/${encodeURIComponent(product.slug || product.id)}`)
  }

  if (loading) return null

  if (sections.length === 0) return null

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-[#F3F3F3] py-8 px-4 relative overflow-hidden"
    >
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/4 -left-24 w-96 h-96 bg-purple-100/15 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            transform: animationState ? 'scale(1) translateX(0)' : 'scale(1.3) translateX(-50px)',
            opacity: animationState ? 0.4 : 0
          }}
        />
        <div 
          className="absolute bottom-1/4 -right-24 w-96 h-96 bg-blue-100/15 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            transform: animationState ? 'scale(1) translateY(0)' : 'scale(1.3) translateY(50px)',
            opacity: animationState ? 0.4 : 0,
            transitionDelay: animationState ? '300ms' : '0ms'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto space-y-10 mb-12 relative z-10">
        {sections.filter((section, idx) => (
          idx < 3 // Limit to first 3 categories for display
        )).map((section, sectionIndex) => ( 
          <article 
            key={section.category.id} 
            className="space-y-4 transition-all duration-700 ease-out"
            style={{
              transform: animationState ? 'translateY(0)' : 'translateY(40px)',
              opacity: animationState ? 1 : 0,
              transitionDelay: animationState ? `${sectionIndex * 200}ms` : `${(2 - sectionIndex) * 100}ms`
            }}
          >
            {/* Category Header */}
            <div className="flex items-center justify-between gap-4">
              <h3 
                className="font-playfair uppercase text-[#1B1B19] text-lg md:text-[30px] leading-tight transition-all duration-500 ease-out"
                style={{
                  transform: animationState ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: animationState ? 1 : 0,
                  transitionDelay: animationState ? `${sectionIndex * 200 + 100}ms` : `${(2 - sectionIndex) * 100}ms`
                }}
              >
                {section.category.label}
              </h3>

              <button
                type="button"
                onClick={() => goToCategory(section.category.id)}
                className="inline-flex items-center gap-1 text-[#2999ff] uppercase text-[11px] md:text-xs tracking-wide hover:opacity-80 transition-all duration-500 ease-out group"
                style={{
                  transform: animationState ? 'translateX(0)' : 'translateX(20px)',
                  opacity: animationState ? 1 : 0,
                  transitionDelay: animationState ? `${sectionIndex * 200 + 100}ms` : `${(2 - sectionIndex) * 100}ms`
                }}
              >
                VIEW ALL
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {section.products.map((product, productIndex) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => goToProduct(product)}
                  className="group text-left transition-all duration-700 ease-out"
                  style={{
                    transform: animationState ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                    opacity: animationState ? 1 : 0,
                    transitionDelay: animationState 
                      ? `${sectionIndex * 200 + 200 + productIndex * 80}ms` 
                      : `${(2 - sectionIndex) * 100 + (4 - productIndex) * 50}ms`
                  }}
                >
                  {/* Product Image with Hover Effects */}
                  <div className="
                    aspect-square w-full overflow-hidden bg-white
                    transition-all duration-500 ease-out
                    relative
                    hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]
                    hover:-translate-y-1
                    before:absolute before:inset-0 before:z-10
                    before:opacity-0 before:transition-opacity before:duration-500
                    group-hover:before:opacity-100
                    before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent
                  ">
                    {product.imageUrl ? (
                      <div className="relative w-full h-full group/image">
                        {/* Shimmer Effect */}
                        <div className="
                          absolute inset-0 z-20 overflow-hidden
                          opacity-0 group-hover/image:opacity-100
                          transition-opacity duration-500
                        ">
                          <div className="
                            absolute inset-0 -translate-x-full
                            group-hover/image:translate-x-full
                            transition-transform duration-1000 ease-out
                            bg-gradient-to-r from-transparent via-white/30 to-transparent
                            skew-x-12
                          " />
                        </div>

                        <img
                          src={normalizeImageUrl(product.imageUrl || "/productpage/noimage.svg")}
                          alt={product.name}
                          className="
                            h-full w-full object-cover 
                            transition-transform duration-500 
                            group-hover:scale-110
                          "
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                        [Product]
                      </div>
                    )}
                  </div>

                  {/* Product Name with Underline Effect */}
                  <div className="relative mt-2 overflow-hidden">
                    <p className="
                      font-poppins text-[10px] md:text-[11px] uppercase text-[#1B1B19] 
                      truncate transition-colors duration-300
                      group-hover:text-gray-900
                    ">
                      {product.name}
                    </p>

                    {/* Animated Underline */}
                    <div className="
                      absolute bottom-0 left-0
                      w-0 h-[1px] bg-gray-900
                      transition-all duration-300 ease-out
                      group-hover:w-full
                    " />
                  </div>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}


 
export default function FragranceWrapper() {
  const [isExiting, setIsExiting] = React.useState(false);
  const [showComponent, setShowComponent] = React.useState(true);

  // Example: trigger exit after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleExitComplete = () => {
    setShowComponent(false);
    
  };

  if (!showComponent) {
    return <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Next Section</h1>
    </div>;
  }

  return <FragranceComponent isExiting={isExiting} onExitComplete={handleExitComplete} />;
}
