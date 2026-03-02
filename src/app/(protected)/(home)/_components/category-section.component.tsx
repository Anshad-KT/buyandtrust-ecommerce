'use client'

import { normalizeImageUrl } from "@/lib/image-url"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useAllCategoriesQuery, useAllProductsQuery } from '@/hooks/useCatalogQueries'
import { useInViewport } from "@/hooks/useInViewport"

type CategoryItem = { id: string; label: string; imageUrl?: string }

interface Category {
  id: string
  name: string
  image: string
}

export function ShopByCategory() {
  const { data: categoriesData = [], isLoading: categoriesLoading } = useAllCategoriesQuery()
  const { data: productsData = [], isLoading: productsLoading } = useAllProductsQuery()
  const router = useRouter()
  
  const categoryItems = React.useMemo<CategoryItem[]>(
    () =>
      (Array.isArray(categoriesData) ? categoriesData : []).map((cat: any) => ({
        id: cat.item_category_id,
        label: cat.name,
        imageUrl: cat.image_url,
      })),
    [categoriesData],
  )

  const categoriesWithItems = React.useMemo<CategoryItem[]>(
    () =>
      categoryItems.filter((cat: CategoryItem) =>
        (Array.isArray(productsData) ? productsData : []).some(
          (product: any) => product.item_category_id === cat.id,
        ),
      ),
    [categoryItems, productsData],
  )

  const normalized = React.useMemo<CategoryItem[]>(() => {
    return categoriesWithItems.map((c: CategoryItem | string) => {
      if (typeof c === "string") {
        return { id: c.toLowerCase().replace(/\s+/g, "-"), label: c }
      }
      return c
    })
  }, [categoriesWithItems])

  const loading = categoriesLoading || productsLoading

  // Animation state - MUST be before early returns
  const sectionRef = React.useRef<HTMLElement>(null)
  const hasEntered = useInViewport(sectionRef, {
    threshold: 0.15,
    once: true,
    enabled: !loading && normalized.length > 0,
  })

  const handleCategoryClick = (item: CategoryItem) => {
    router.push(`/product?category=${encodeURIComponent(item.id)}`)
  }

  if (loading || normalized.length === 0) return null

  return (
    <section 
      ref={sectionRef}
      className="w-full bg-white py-6 px-4 transition-colors duration-500 relative overflow-hidden"
    >
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl transition-all duration-1000"
          style={{
            transform: hasEntered ? 'scale(1) translateX(0)' : 'scale(1.3) translateX(-50px)',
            opacity: hasEntered ? 0.3 : 0
          }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl transition-all duration-1000 delay-200"
          style={{
            transform: hasEntered ? 'scale(1) translateY(0)' : 'scale(1.3) translateY(50px)',
            opacity: hasEntered ? 0.3 : 0
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Drop-down Animation */}
        <div 
          className="mb-8 transition-all duration-700 ease-out"
          style={{
            transform: hasEntered ? 'translateY(0)' : 'translateY(-20px)',
            opacity: hasEntered ? 1 : 0
          }}
        >
          <h2 className="flex items-baseline gap-2 text-gray-900">
            <span className="
              font-poppins
              font-extralight
              uppercase
              md:text-[40px]
              text-[24px]
              md:leading-[40px]
              leading-[24px]
              transition-all duration-500
            ">
              SHOP BY
            </span>

            <span className="
              font-playfair
              font-normal
              uppercase
              md:text-[40px]
              text-[24px]
              md:leading-[40px]
              leading-[24px]
              transition-all duration-500
            ">
              CATEGORY
            </span>
          </h2>
        </div>

        {/* Categories Container with Staggered Animation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {normalized.map((category, index) => (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group transition-all duration-700 ease-out"
              style={{ 
                transform: hasEntered ? 'translateY(0)' : 'translateY(30px)',
                opacity: hasEntered ? 1 : 0,
                transitionDelay: `${(index + 1) * 100}ms`
              }}
              onClick={() => handleCategoryClick(category)}
            >
              {/* Category Image with Lift & Glow Effect */}
              <div className="
                w-full aspect-square rounded-none overflow-hidden mb-3 
                transition-all duration-700 ease-out
                relative
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                hover:-translate-y-2
                before:absolute before:inset-0 before:z-10
                before:opacity-0 before:transition-opacity before:duration-700
                hover:before:opacity-100
                before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent
              ">
                {category.imageUrl ? (
                  <div className="relative w-full h-full group/image">
                    {/* Shimmer Effect Overlay */}
                    <div className="
                      absolute inset-0 z-20 overflow-hidden
                      opacity-0 group-hover/image:opacity-100
                      transition-opacity duration-500
                    ">
                      <div className="
                        absolute inset-0 -translate-x-full
                        group-hover/image:translate-x-full
                        transition-transform duration-1000 ease-out
                        bg-gradient-to-r from-transparent via-white/40 to-transparent
                        skew-x-12
                      " />
                    </div>
                    
                    <img
                      src={normalizeImageUrl(category.imageUrl)}
                      alt={category.label}
                      className="
                        w-full h-full object-cover 
                        transition-all duration-700 ease-out
                        group-hover:scale-110
                      "
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center transition-all duration-700">
                    <span className="text-gray-400 text-sm">[Category]</span>
                  </div>
                )}
              </div>

              {/* Category Name with Metallic Shine */}
              <div className="relative overflow-hidden">
                <p className="
                  font-poppins
                  font-normal
                  uppercase
                  text-center
                  text-[#1B1B19]
                  text-[14px]
                  leading-[20px]
                  align-middle
                  transition-all duration-500
                  group-hover:text-gray-900
                  relative z-10
                ">
                  {category.label}
                </p>
                
                {/* Animated Underline */}
                <div className="
                  absolute bottom-0 left-1/2 -translate-x-1/2
                  w-0 h-[1px] bg-gray-900
                  transition-all duration-500 ease-out
                  group-hover:w-full
                " />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .group:hover .animate-shimmer {
          animation: shimmer 2s linear infinite;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
        }
      `}</style>
    </section>
  )
}
