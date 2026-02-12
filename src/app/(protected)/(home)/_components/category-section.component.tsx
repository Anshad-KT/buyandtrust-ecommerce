'use client'

import Image from 'next/image'
import { cn } from "@/lib/utils"
import { EcomService } from "@/services/api/ecom-service"
import { useRouter } from "next/navigation"
import * as React from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'

type CategoryItem = { id: string; label: string; imageUrl?: string }

interface Category {
  id: string
  name: string
  image: string
}

export function ShopByCategory() {
  const [fetchedCategories, setFetchedCategories] = React.useState<CategoryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [categoriesWithItems, setCategoriesWithItems] = React.useState<CategoryItem[]>([])
  const router = useRouter()

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await new EcomService().get_all_categories()
        const categoryItems = categoriesData.map((cat: any) => ({
          id: cat.item_category_id,
          label: cat.name,
          imageUrl: cat.image_url,
        }))
        setFetchedCategories(categoryItems)

        const productsData = await new EcomService().get_all_products()

        const categoriesWithProducts = categoryItems.filter((cat: CategoryItem) =>
          productsData.some((product: any) => product.item_category_id === cat.id),
        )

        setCategoriesWithItems(categoriesWithProducts)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const normalized = React.useMemo<CategoryItem[]>(() => {
    return categoriesWithItems.map((c: CategoryItem | string) => {
      if (typeof c === "string") {
        return { id: c.toLowerCase().replace(/\s+/g, "-"), label: c }
      }
      return c
    })
  }, [categoriesWithItems])

  const handleCategoryClick = (item: CategoryItem) => {
    router.push(`/product?category=${encodeURIComponent(item.id)}`)
  }

  if (loading || normalized.length === 0) return null

  return (
    <section className="w-full bg-white py-6 px-4">
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
              CATEGORY
            </span>

          </h2>
        </div>


        {/* Categories Container */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {normalized.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleCategoryClick(category)}
            >
              {/* Category Image */}
              <div className="w-full aspect-square rounded-none overflow-hidden mb-3 transition-all">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.label}
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">[Category]</span>
                  </div>
                )}
              </div>

              {/* Category Name */}
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
                {category.label}
              </p>

            </div>
          ))}
        </div>
      </div>
    </section>
  )
}




// SCROLL METHOD
// 'use client'

// import Image from 'next/image'
// import { cn } from "@/lib/utils"
// import { EcomService } from "@/services/api/ecom-service"
// import { useRouter } from "next/navigation"
// import * as React from "react"
// import { ChevronLeft, ChevronRight } from 'lucide-react'

// type CategoryItem = { id: string; label: string; imageUrl?: string }

// interface Category {
//   id: string
//   name: string
//   image: string
// }

// export function ShopByCategory() {
//   const [fetchedCategories, setFetchedCategories] = React.useState<CategoryItem[]>([])
//   const [loading, setLoading] = React.useState(true)
//   const [categoriesWithItems, setCategoriesWithItems] = React.useState<CategoryItem[]>([])
//   const [scrollPosition, setScrollPosition] = React.useState(0)
//   const scrollContainerRef = React.useRef<HTMLDivElement>(null)
//   const router = useRouter()

//   React.useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const categoriesData = await new EcomService().get_all_categories()
//         const categoryItems = categoriesData.map((cat: any) => ({
//           id: cat.item_category_id,
//           label: cat.name,
//           imageUrl: cat.image_url,
//         }))
//         setFetchedCategories(categoryItems)

//         const productsData = await new EcomService().get_all_products()

//         const categoriesWithProducts = categoryItems.filter((cat: CategoryItem) =>
//           productsData.some((product: any) => product.item_category_id === cat.id),
//         )

//         setCategoriesWithItems(categoriesWithProducts)
//         setLoading(false)
//       } catch (error) {
//         console.error("Failed to fetch data:", error)
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])

//   const normalized = React.useMemo<CategoryItem[]>(() => {
//     return categoriesWithItems.map((c: CategoryItem | string) => {
//       if (typeof c === "string") {
//         return { id: c.toLowerCase().replace(/\s+/g, "-"), label: c }
//       }
//       return c
//     })
//   }, [categoriesWithItems])

//   const handleCategoryClick = (item: CategoryItem) => {
//     router.push(`/product?category=${encodeURIComponent(item.id)}`)
//   }

//   const scroll = (direction: 'left' | 'right') => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = 200
//       const newScrollPosition = direction === 'left'
//         ? scrollPosition - scrollAmount
//         : scrollPosition + scrollAmount

//       scrollContainerRef.current.scrollTo({
//         left: newScrollPosition,
//         behavior: 'smooth'
//       })
//       setScrollPosition(newScrollPosition)
//     }
//   }

//   const handleScroll = () => {
//     if (scrollContainerRef.current) {
//       setScrollPosition(scrollContainerRef.current.scrollLeft)
//     }
//   }

//   if (loading || normalized.length === 0) return null

//   return (
//     <section className="w-full bg-white py-6 px-4">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h2 className="flex items-baseline gap-2 text-gray-900">

//             <span className="
//       font-poppins
//       font-extralight
//       uppercase
//       md:text-[40px]
//       text-[24px]
//       md:leading-[40px]
//       leading-[24px]
//     ">
//               SHOP BY
//             </span>

//             <span className="
//       font-playfair
//       font-normal
//       uppercase
//       md:text-[40px]
//       text-[24px]
//       md:leading-[40px]
//       leading-[24px]
//     ">
//               CATEGORY
//             </span>

//           </h2>
//         </div>


//         {/* Categories Container */}
//         <div className="relative">
//           {/* Desktop Navigation Buttons - Only show when more than 6 categories */}
//           {normalized.length > 6 && (
//             <div className="hidden lg:flex">
//               <button
//                 onClick={() => scroll('left')}
//                 className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition-colors"
//                 disabled={scrollPosition <= 0}
//               >
//                 <ChevronLeft className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => scroll('right')}
//                 className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 transition-colors"
//               >
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//           )}

//           {/* Categories Scroll Container */}
//           <div
//             ref={scrollContainerRef}
//             onScroll={handleScroll}
//             className="flex gap-4 overflow-x-auto scrollbar-hide lg:overflow-x-hidden lg:grid lg:grid-cols-6 lg:gap-4 scroll-smooth"
//             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//           >
//             {normalized.map((category) => (
//               <div
//                 key={category.id}
//                 className="flex flex-col items-center cursor-pointer group flex-shrink-0 w-32 lg:w-auto"
//                 onClick={() => handleCategoryClick(category)}
//               >
//                 {/* Category Image */}
//                 <div className="w-full aspect-square rounded-none overflow-hidden mb-3 transition-all">
//                   {category.imageUrl ? (
//                     <img
//                       src={category.imageUrl}
//                       alt={category.label}
//                       className="w-full h-full object-cover hover:scale-105 transition-all duration-200"
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-gray-100 flex items-center justify-center">
//                       <span className="text-gray-400 text-sm">[Category]</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Category Name */}
//                 <p className="
//                               font-poppins
//                               font-normal
//                               uppercase
//                               text-center
//                               text-[#1B1B19]
//                               text-[14px]
//                               leading-[20px]
//                               align-middle
//                               group-hover:text-gray-900
//                               transition-colors
//                             ">
//                   {category.label}
//                 </p>

//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }
