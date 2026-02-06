import { 
  HeroSection, 
  ShopByCategory, 
  ShopByFragrance, 
  NewArrivals, 
  PerfumeCarousel 
} from './_components'

import Footer from "@/app/_components/Footer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <NewArrivals />
      <ShopByCategory />
      <PerfumeCarousel />
      <ShopByFragrance />
      <Footer />
    </>
  );
}
