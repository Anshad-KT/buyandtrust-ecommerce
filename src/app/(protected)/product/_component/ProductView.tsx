'use client'
import { useEffect, useState } from "react"
import { makeApiCall } from "@/lib/apicaller"
import { EcomService } from "@/services/api/ecom-service"
import ProductsList from "./ProductsList"
import ProductsCat from "./ProductsCarousel"
// import Footer from "@/app/_components/Footer"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"


export default function Products() {
  // const [categories, setCategories] = useState<Category[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  // const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  useEffect(() => {
    // Fetch all products directly without categorization
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (productData: any) => {
          console.log("Products fetched:", productData.length);
          setProducts(productData);
          setLoading(false);
        },
        afterError: (error: any) => {
          console.error("Failed to fetch products:", error);
          setLoading(false);
        }
      }
    );


  }, [])
  


  if (loading) {
    // Show a grid of skeleton cards matching the product card layout
    return (
      <section className="w-full bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold mb-8" style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}>Our Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white border-0 shadow-none overflow-hidden rounded-md flex flex-col h-full">
                <div className="p-0">
                  <Skeleton className="h-64 w-full rounded-md mb-4" />
                </div>
                <div className="flex flex-col items-start gap-2 w-full p-4 flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex items-center gap-2 flex-wrap pb-2 w-full">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }



  return (
    <>
      <section className="w-full bg-white px-4 py-12  ">
        <div className="mx-auto max-w-7xl relative">

          
          {/* Display all products without categorization */}
          <div className="lg:block hidden">
            <ProductsCat products={products} />
          </div>
          
          <div className="lg:hidden block">
            <ProductsList products={products} />
          </div>

        </div>
      </section>
      {/* <Footer /> */}
    </>
  )
}

