"use client"
import { 
  HeroSection, 
  ShopByCategory, 
  ShopByFragrance, 
  NewArrivals, 
  PerfumeCarousel 
} from './_components'
import Footer from "@/app/_components/Footer"; 
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    // console.log("Selected category:", { categoryId, categoryName });
  };

  return (
   <>
   <HeroSection />

   <ShopByCategory />
   <NewArrivals />
   <PerfumeCarousel />
   <ShopByFragrance />

   <Footer />
   </>
  );
}