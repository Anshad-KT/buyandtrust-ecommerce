"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { EcomService } from "@/services/api/ecom-service"
import { useRouter } from "next/navigation"
import { normalizeImageUrl } from "@/lib/image-url"

type CategoryItem = { id: string; label: string; imageUrl?: string }

export default function CategoryStrip({
  title = "Categories",
  categories,
  className,
  onSelect,
}: {
  title?: string
  categories?: Array<string | CategoryItem>
  className?: string
  onSelect?: (categoryId: string, categoryName: string) => void
}) {
  const [fetchedCategories, setFetchedCategories] = React.useState<CategoryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [categoriesWithItems, setCategoriesWithItems] = React.useState<CategoryItem[]>([])
  const [showAll, setShowAll] = React.useState(false)
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
    const categoriesToUse = categories || categoriesWithItems
    return categoriesToUse.map((c) =>
      typeof c === "string" ? { id: c.toLowerCase().replace(/\s+/g, "-"), label: c } : c,
    )
  }, [categories, categoriesWithItems])

  const visibleCategories = React.useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile
      ? (showAll ? normalized : normalized.slice(0, 4))
      : (showAll ? normalized : normalized.slice(0, 6))
  }, [normalized, showAll])


  const handleCategoryClick = (item: CategoryItem) => {
    onSelect?.(item.id, item.label)
    router.push(`/product?category=${encodeURIComponent(item.id)}`)
  }

  if (loading || normalized.length === 0) return null

  return (
    <section className={cn("bg-none rounded-2xl p-6 md:p-8", className)} aria-label={title}>
      <h2
        className="text-center uppercase text-2xl md:text-4xl font-black tracking-wider text-foreground/90 mb-6 md:mb-8"
        style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
      >
        {title}
      </h2>

      <div className="flex flex-col space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
        {visibleCategories.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => handleCategoryClick(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCategoryClick(item)
              }
            }}
            style={{ backgroundImage: `url(${normalizeImageUrl(item.imageUrl || "")})` }}
            className={cn(
              "relative rounded-xl px-6 py-4 w-full",
              "text-white transition shadow-sm cursor-pointer",
              "bg-cover bg-center h-24 md:h-28 flex items-center justify-center",
              "hover:scale-105 hover:shadow-md hover:bg-black/40"
            )}
          >
            <div className="absolute inset-0 bg-black opacity-40 rounded-xl"></div>
            <span className="relative z-10 font-semibold text-sm md:text-base text-center text-balance">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const limit = isMobile ? 4 : 6;
        return normalized.length > limit;
      })() && (
          <div className="text-center mt-6 md:mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm md:text-base text-foreground/70 hover:text-foreground transition font-medium"
            >
              {showAll ? 'Show Less' : 'View All'}
            </button>
          </div>
        )}

    </section>
  )
}
