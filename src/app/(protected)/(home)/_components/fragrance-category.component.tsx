'use client'

import { EcomService } from "@/services/api/ecom-service"
import { useRouter } from "next/navigation"
import * as React from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'

// TODO: This component currently fetches regular categories as fragrance data.
// When backend is updated with fragrance-specific data, update the API call
// and data structure to handle fragrance types properly. The UI structure
// is already set up to handle fragrance-specific features.
//DUXBE - TODO: Update to fragrance-specific API when backend supports it

type FragranceType = {
  id: string
  name: string
  imageUrl?: string
}

export function ShopByFragrance() {
  const [fragrances, setFragrances] = React.useState<FragranceType[]>([])
  const [loading, setLoading] = React.useState(true)
  const [scrollPosition, setScrollPosition] = React.useState(0)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const router = useRouter()

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Update to fragrance-specific API when backend supports it
        // For now, using regular categories as placeholder data
        const categoriesData = await new EcomService().get_all_categories()
        const fragranceItems = categoriesData.map((cat: any) => ({
          id: cat.item_category_id,
          name: cat.name,
          imageUrl: cat.image_url,
        }))
        
        const productsData = await new EcomService().get_all_products()

        const fragrancesWithProducts = fragranceItems.filter((fragrance: FragranceType) =>
          productsData.some((product: any) => product.item_category_id === fragrance.id),
        )

        setFragrances(fragrancesWithProducts)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch fragrance data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFragranceClick = (item: FragranceType) => {
    // TODO: Update to fragrance-specific routing when backend supports it
    router.push(`/product?category=${encodeURIComponent(item.id)}`)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200
      const newScrollPosition = direction === 'left'
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
      setScrollPosition(newScrollPosition)
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft)
    }
  }

  if (loading || fragrances.length === 0) return null

  return (
    <section className="w-full bg-white py-12 px-4 md:mb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="flex items-baseline gap-2 text-gray-900">

            <span className="
      font-poppins
      font-extralight
      uppercase
      md:text-[40px]
      text-[24px]
      md:leading-[40px]
      leading-[24px]
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
                        ">
              FRAGRANCE
            </span>

          </h2>
        </div>


        {/* Fragrance Container */}
        <div className="relative">
          {/* Desktop Navigation Buttons - Only show when more than 6 fragrances */}
          {fragrances.length > 6 && (
            <div className="hidden lg:flex">
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition-colors"
                disabled={scrollPosition <= 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Fragrance Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide lg:overflow-x-hidden lg:grid lg:grid-cols-6 lg:gap-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {fragrances.map((fragrance) => (
              <div
                key={fragrance.id}
                className="flex flex-col items-center cursor-pointer group flex-shrink-0 w-32 lg:w-auto"
                onClick={() => handleFragranceClick(fragrance)}
              >
                {/* Fragrance Image */}
                <div className="w-full aspect-square rounded-none overflow-hidden mb-3 transition-all">
                  {fragrance.imageUrl ? (
                    <img
                      src={fragrance.imageUrl}
                      alt={fragrance.name}
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">[Fragrance]</span>
                    </div>
                  )}
                </div>

                {/* Fragrance Name */}
                <p className="
                              font-poppins
                              font-normal
                              uppercase
                              text-center
                              text-[#1B1B19]
                              text-[14px]
                              leading-[20px]
                              align-middle
                              group-hover:text-gray-900
                              transition-colors
                            ">
                  {fragrance.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
