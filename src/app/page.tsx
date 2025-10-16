"use client"
import { HeroContent } from "@/app/_components/Hero-section";
import "@fontsource/jost"; // Defaults to weight 400
import "@fontsource/jost/600.css"; // Specify weight
import "@fontsource/jost/600-italic.css"; // Specify weight and style


import TrendingProducts from "./_components/TrendingProducts";
import CategoryStrip from "./_components/category-component";
import Footer from "./_components/Footer"; 
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    console.log("Selected category:", { categoryId, categoryName });
    // You can navigate to a filtered products page or filter products here
    // Example: router.push(`/product?category=${categoryId}`);
  };

  return (
   <>
   <HeroContent />  

  
    <div className="container mx-auto mt-12 max-w-7xl">
   <CategoryStrip onSelect={handleCategorySelect} />
   </div>
   <TrendingProducts/>

   <Footer />
   </>
  );
}


