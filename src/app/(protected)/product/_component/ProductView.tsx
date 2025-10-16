'use client'
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { makeApiCall } from "@/lib/apicaller"
import { EcomService } from "@/services/api/ecom-service"
import ProductsList from "./ProductsList"
import ProductsCat from "./ProductsCarousel"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function Products() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || "all")
  const [sortOrder, setSortOrder] = useState<string>("default")
  
  // Update selected category when URL parameter changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products first
        const productData = await new EcomService().get_all_products();
        console.log("Products fetched:", productData);
        setProducts(productData);
        setAllProducts(productData);
        
        // Fetch categories
        const categoryData = await new EcomService().get_all_categories();
        console.log("Categories fetched:", categoryData);
        
        // Filter categories that have at least one product
        const categoriesWithProducts = categoryData.filter((cat: any) => 
          productData.some((product: any) => product.item_category_id === cat.item_category_id)
        );
        setCategories(categoriesWithProducts);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.item_category_id === selectedCategory);
    }

    // Sort products
    if (sortOrder === "price-low") {
      filtered.sort((a, b) => a.sale_price - b.sale_price);
    } else if (sortOrder === "price-high") {
      filtered.sort((a, b) => b.sale_price - a.sale_price);
    }

    setProducts(filtered);
  }, [selectedCategory, sortOrder, allProducts])
  


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
      <section className="w-full bg-white px-4 md:py-12 py-4">
        <div className="mx-auto max-w-7xl relative">
          {/* Header with filters */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="hidden md:block text-3xl font-semibold" style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}>
              Our Products
            </h2>
            
            <div className="flex items-center gap-3">
              {/* Category Dropdown - Only show if at least 1 category with items */}
              {categories.length >= 1 && (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] rounded-full border-none bg-gray-100">
                    <SelectValue placeholder="Latest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.item_category_id} value={cat.item_category_id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-50">
                  <Image 
                    src="/productpage/sorticon.svg" 
                    alt="Sort" 
                    width={36} 
                    height={36}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] ">
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("default")}
                    className={sortOrder === "default" ? "bg-gray-100" : ""}
                  >
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("price-low")}
                    className={sortOrder === "price-low" ? "bg-gray-100" : ""}
                  >
                    Price: Low to High
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("price-high")}
                    className={sortOrder === "price-high" ? "bg-gray-100" : ""}
                  >
                    Price: High to Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Display products */}
          <div className="lg:block hidden">
            <ProductsCat products={products} />
          </div>
          
          <div className="lg:hidden block">
            <ProductsList products={products} />
          </div>
        </div>
      </section>
    </>
  )
}

