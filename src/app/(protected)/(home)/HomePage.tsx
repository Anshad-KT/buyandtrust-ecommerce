"use client"

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
      <ShopByCategory />
      <NewArrivals />
      <PerfumeCarousel />
      <ShopByFragrance />
      <Footer />
    </>
  );
}
