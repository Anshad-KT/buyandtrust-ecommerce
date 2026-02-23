import {
  HeroSection,
  ShopByCategory,
 FragranceComponent,
  NewArrivals,
  PerfumeCarousel
} from './_components'

import Footer from "@/app/_components/Footer";

export default function HomePage() {
  return (
    <>
     <HeroSection />
      <ShopByCategory /> 
      <NewArrivals />
      <PerfumeCarousel /> 
      <FragranceComponent />
      <Footer />
    </>
  );
}
