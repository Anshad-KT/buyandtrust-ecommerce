"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { EcomService } from "@/services/api/ecom-service"
import { useRouter } from "next/navigation"

type CategoryItem = { id: string; label: string }

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
  const scrollRef = React.useRef<HTMLDivElement>(null)
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
        }))
        setFetchedCategories(categoryItems)

        const productsData = await new EcomService().get_all_products()

        const categoriesWithProducts = categoryItems.filter((cat: CategoryItem) =>
          productsData.some((product: any) => product.item_category_id === cat.id)
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
      typeof c === "string"
        ? { id: c.toLowerCase().replace(/\s+/g, "-"), label: c }
        : c
    )
  }, [categories, categoriesWithItems])

  if (loading || normalized.length === 0) return null

  return (
    <section className={cn("bg-none rounded-2xl p-6 md:p-8", className)} aria-label={title}>
      <h2
        className="hidden md:block text-center uppercase text-4xl md:text-5xl font-black tracking-wider text-foreground/90"
        style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
      >
        {title}
      </h2>

      <div className="relative mt-6">
        {/* Scroll area */}
        <div
          ref={scrollRef}
          className={cn(
            "overflow-x-auto flex gap-3 md:gap-4 min-w-full hide-scrollbar scroll-smooth",
            "pl-4 pr-8 md:pl-0"
          )}
        >
          {normalized.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect?.(item.id, item.label)
                router.push(`/product?category=${encodeURIComponent(item.id)}`)
              }}
              className={cn(
                "whitespace-nowrap rounded-xl bg-[#0099FF1A] px-6 py-4 md:px-10 md:py-8",
                "text-foreground/90 hover:bg-[#0099FF2A] hover:text-foreground transition shadow-sm",
                "shrink-0" // ✅ Ensures partial next item visible
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Edge fade indicators */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-white"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-white"></div>

      </div>
    </section>
  )
}
