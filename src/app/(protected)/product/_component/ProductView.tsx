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
          {/* <h2 className="lg:mb-16 mb-10 text-center text-2xl md:text-5xl font-bold text-[#1E1E2A]">
            OUR PRODUCTS
          </h2> */}
          
          {/* <div className="absolute top-0 right-10 opacity-10">
            <Image
              src="/Vector.png"
              alt="Premium Product"
              width={95}
              height={104}
              className="rounded-2xl object-cover"
            />
          </div>
           */}

          
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



// 'use client'
// import { useEffect, useState } from "react"
// import { makeApiCall } from "@/lib/apicaller"
// import { EcomService } from "@/services/api/ecom-service"
// import ProductsList from "./ProductsList"
// import ProductsCat from "./ProductsCarousel"

// export default function Products() {
//   const [products, setProducts] = useState<any[]>([])
  
//   useEffect(() => {
//     makeApiCall(
//       () => new EcomService().get_all_products(),
//       {
//         afterSuccess: (data: any) => {
//           setProducts(data)
//         }
//       }
//     )
//   }, [])

//   return (
//     <section className="w-full bg-[#222222] px-4 py-12">
//       <div className="mx-auto max-w-7xl">
//         <h2 className="lg:mb-20 mb-12 text-center text-2xl md:text-5xl font-bold text-white">
//           MEET OUR <span className="text-red-600">TRENDING</span> PRODUCTS
//         </h2>
//         <div className="lg:block hidden">
//           <ProductsCat products={products} />
//         </div>
//         <div className="lg:hidden block">
//           <ProductsList products={products} />
//         </div>
//       </div>
//     </section>
//   )
// }