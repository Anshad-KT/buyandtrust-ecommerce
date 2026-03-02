'use client'
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { EcomService } from "@/services/api/ecom-service"
import ProductsList from "./ProductsMobileList"
import ProductsCat from "./ProductsWebCarousel"
import Image from "next/image"
import ZipaaraLoader from "@/app/(protected)/_components/zipaara-loader"
import { useInViewport } from "@/hooks/useInViewport"
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
  const [showLoader, setShowLoader] = useState(true)
  const [isExitingLoader, setIsExitingLoader] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || "all")
  const [sortOrder, setSortOrder] = useState<string>("latest")
  const sectionRef = useRef<HTMLElement>(null)
  const hasEntered = useInViewport(sectionRef, {
    threshold: 0.1,
    once: true,
    enabled: !showLoader && !loading,
  })

  const parseCreatedAt = (value: any) => {
    if (!value) return 0;
    let s = String(value).replace(' ', 'T');
    if (/\+\d{2}$/.test(s)) {
      s = `${s}:00`;
    }
    const t = Date.parse(s);
    return Number.isNaN(t) ? 0 : t;
  };
  
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
      
        setProducts(productData);
        setAllProducts(productData);
        
        // Fetch categories
        const categoryData = await new EcomService().get_all_categories();
    
        
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

  useEffect(() => {
    if (!loading && showLoader) {
      setIsExitingLoader(true)
    }
  }, [loading, showLoader])

  const handleLoaderExitComplete = () => {
    setShowLoader(false)
  }

  // Filter and sort products
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.item_category_id === selectedCategory);
    }

    // Sort products
    if (sortOrder === "latest") {
      filtered.sort((a, b) => parseCreatedAt(b?.created_at) - parseCreatedAt(a?.created_at));
    } else if (sortOrder === "price-low") {
      filtered.sort((a, b) => a.sale_price - b.sale_price);
    } else if (sortOrder === "price-high") {
      filtered.sort((a, b) => b.sale_price - a.sale_price);
    }

    setProducts(filtered);
  }, [selectedCategory, sortOrder, allProducts])
  
  if (showLoader) {
    return (
      <ZipaaraLoader
        isExiting={isExitingLoader}
        onExitComplete={handleLoaderExitComplete}
      />
    )
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="w-full bg-white px-4 md:py-12 py-4 transition-all duration-700 ease-out"
        style={{
          transform: hasEntered ? "translateY(0)" : "translateY(20px)",
          opacity: hasEntered ? 1 : 0,
        }}
      >
        <div className="mx-auto max-w-7xl relative">
          {/* Header with filters */}
          <div
            className="flex items-center justify-between mb-8 transition-all duration-700 ease-out"
            style={{
              transform: hasEntered ? "translateY(0)" : "translateY(-16px)",
              opacity: hasEntered ? 1 : 0,
            }}
          >
            <h2
              className="hidden md:block text-3xl font-semibold"
              style={{ fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif" }}
            >
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
                  unoptimized
                    src="/productpage/sorticon.svg" 
                    alt="Sort" 
                    width={36} 
                    height={36}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] ">
                  <DropdownMenuItem 
                    onClick={() => setSortOrder("latest")}
                    className={sortOrder === "latest" ? "bg-gray-100" : ""}
                  >
                    Latest
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
          <div
            className="lg:block hidden transition-all duration-700 ease-out"
            style={{
              transform: hasEntered ? "translateY(0)" : "translateY(20px)",
              opacity: hasEntered ? 1 : 0,
              transitionDelay: "120ms",
            }}
          >
            <ProductsCat products={products} />
          </div>
          
          <div
            className="lg:hidden block transition-all duration-700 ease-out"
            style={{
              transform: hasEntered ? "translateY(0)" : "translateY(20px)",
              opacity: hasEntered ? 1 : 0,
              transitionDelay: "120ms",
            }}
          >
            <ProductsList products={products} />
          </div>
        </div>
      </section>
    </>
  )
}

