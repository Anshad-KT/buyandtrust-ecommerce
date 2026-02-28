'use client'

import { EcomService } from "@/services/api/ecom-service"
import { useRouter } from "next/navigation"
import * as React from "react"
import { ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

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

export function FragranceComponent() {
  const [sections, setSections] = React.useState<CategorySection[]>([])
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          new EcomService().get_all_categories(),
          new EcomService().get_all_products(),
        ])

        const categoryItems: CategoryItem[] = (categoriesData || []).map((category: any) => ({
          id: category.item_category_id,
          label: category.name,
          imageUrl: category.image_url,
        }))

        const allProducts: ProductItem[] = (productsData || [])
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

        const sectionsWithProducts = categoryItems
          .map((category) => ({
            category,
            products: (groupedProducts.get(category.id) || []).slice(0, MAX_PRODUCTS_PER_CATEGORY),
          }))
          .filter((section) => section.products.length > 0)

        setSections(sectionsWithProducts)
      } catch (error) {
        console.error("Failed to fetch category sections:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const goToCategory = (categoryId: string) => {
    router.push(`/product?category=${encodeURIComponent(categoryId)}`)
  }

  const goToProduct = (product: ProductItem) => {
    router.push(`/productinfo/${encodeURIComponent(product.slug || product.id)}`)
  }

  if (loading) {
    return (
      <section className="w-full bg-[#F3F3F3] py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {[1, 2].map((index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5].map((card) => (
                  <div key={card}>
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="mt-2 h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (sections.length === 0) return null

  return (
    <section className="w-full bg-[#F3F3F3] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10 mb-12">
        {sections.filter((section,idx) => (
          idx < 3 // Limit to first 2 categories for display
        )).map((section) => ( 
          <article key={section.category.id} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-playfair uppercase text-[#1B1B19] text-lg md:text-[30px] leading-tight">
                {section.category.label}
              </h3>

              <button
                type="button"
                onClick={() => goToCategory(section.category.id)}
                className="inline-flex items-center gap-1 text-[#2999ff] uppercase text-[11px] md:text-xs tracking-wide hover:opacity-80 transition-opacity"
              >
                VIEW ALL
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
              {section.products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => goToProduct(product)}
                  className="group text-left"
                >
                  <div className="aspect-square w-full overflow-hidden bg-white">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl?.replace(/([a-z0-9-]+\.supabase\.co|api\.duxbe\.(?:com|app))/, 'duxbe.jiobase.com')}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                        [Product]
                      </div>
                    )}
                  </div>
                  <p className="mt-2 font-poppins text-[10px] md:text-[11px] uppercase text-[#1B1B19] truncate">
                    {product.name}
                  </p>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

