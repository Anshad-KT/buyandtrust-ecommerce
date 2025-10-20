"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { EcomService } from "@/services/api/ecom-service"
import { makeApiCall } from "@/lib/apicaller"
import { useRouter } from "next/navigation"

type CategoryItem = { id: string; label: string }

export interface CategoryStripProps {
    title?: string
    categories?: Array<string | CategoryItem>
    className?: string
    onSelect?: (categoryId: string, categoryName: string) => void
}

export default function CategoryStrip({
    title = "Categories",
    categories,
    className,
    onSelect,
}: CategoryStripProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [fetchedCategories, setFetchedCategories] = React.useState<CategoryItem[]>([])
    const [loading, setLoading] = React.useState(true)
    const [categoriesWithItems, setCategoriesWithItems] = React.useState<CategoryItem[]>([])
    const router = useRouter()

    // Fetch categories and products from database on mount
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoriesData = await new EcomService().get_all_categories()
                const categoryItems = categoriesData.map((cat: any) => ({
                    id: cat.item_category_id,
                    label: cat.name
                }))
                setFetchedCategories(categoryItems)

                // Fetch products to check which categories have items
                const productsData = await new EcomService().get_all_products()
                
                // Filter categories that have at least one product
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
        // If categories prop is provided, use it; otherwise use categories with items
        const categoriesToUse = categories || categoriesWithItems
        return categoriesToUse.map((c) =>
            typeof c === "string"
                ? { id: c.toLowerCase().replace(/\s+/g, "-"), label: c }
                : c
        )
    }, [categories, categoriesWithItems])

    const scrollBy = (dir: number) => {
        if (!scrollRef.current) return
        scrollRef.current.scrollBy({ left: dir * 280, behavior: "smooth" })
    }


    // Hide component if loading or no categories with items
    if (loading || normalized.length === 0) {
        return null
    }

    return (
        <section className={cn("bg-none rounded-2xl p-6 md:p-8", className)} aria-label={title}>
            <h2
                className="hidden md:block text-center uppercase text-4xl md:text-5xl font-black tracking-wider text-foreground/90"
                style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
            >
                {title}
            </h2>


            <div className="mt-5 md:mt-6 flex items-center gap-3">
                {/* Left control */}
                {/* <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll categories left"
          className="h-9 w-9 md:h-20 md:w-14 shrink-0 text-foreground/70 hover:bg-accent hover:text-foreground transition"
        >
          <span aria-hidden>‹</span>
        </button> */}

                {/* Scroll area */}
                <div
                    ref={scrollRef}
                    className="overflow-x-auto scroll-smooth hide-scrollbar flex-1"
                    role="group"
                    aria-roledescription="carousel"
                >
                    <div className="flex items-stretch gap-3 md:gap-4 min-w-max md:justify-center"
                    style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
                    >
                        {normalized.map((item) => (
                            <button
                                key={item.id ?? item.label}
                                type="button"
                                onClick={() => {
                                    // Call onSelect callback if provided
                                    onSelect?.(item.id, item.label)
                                    // Navigate to product page with category query
                                    router.push(`/product?category=${encodeURIComponent(item.id)}`)
                                }}
                                className={cn(
                                    "whitespace-nowrap rounded-xl bg-[#0099FF1A] px-5 py-3 md:px-10 md:py-8",
                                    "text-foreground/90 hover:bg-[#0099FF2A] hover:text-foreground transition shadow-sm",
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right control */}
                {/* <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll categories right"
          className="h-9 w-9 md:h-20 md:w-14 shrink-0 text-foreground/70 hover:bg-accent hover:text-foreground transition"
        >
          <span aria-hidden>›</span>
        </button> */}
            </div>
        </section>
    )
}
