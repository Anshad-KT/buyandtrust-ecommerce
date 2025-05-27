'use client'
import { useEffect, useState } from "react"
import { makeApiCall } from "@/lib/apicaller"
import { EcomService } from "@/services/api/ecom-service"
import ProductsList from "./ProductsList"
import ProductsCat from "./ProductsCarousel"
// import Footer from "@/app/_components/Footer"
import Image from "next/image"

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
    return (
      <section className="w-full bg-white px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-gray-500">Loading products...</p>
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

