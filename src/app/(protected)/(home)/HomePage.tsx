'use client'

import { useEffect, useState } from 'react'
import ZipaaraLoader from '../_components/zipaara-loader';
import {
  HeroSection,
  ShopByCategory,
  FragranceComponent,
  NewArrivals,
  PerfumeCarousel
} from './_components'

import Footer from "@/app/_components/Footer";
import { useAllCategoriesQuery, useAllProductsQuery } from '@/hooks/useCatalogQueries';

export default function HomePage() {
  const { isLoading: categoriesLoading } = useAllCategoriesQuery()
  const { isLoading: productsLoading } = useAllProductsQuery()
  const isLoading = categoriesLoading || productsLoading
  const [showLoader, setShowLoader] = useState(true)
  const [isExitingLoader, setIsExitingLoader] = useState(false)

  useEffect(() => {
    if (!isLoading && showLoader) {
      setIsExitingLoader(true)
    }
  }, [isLoading, showLoader])

  const handleLoaderExitComplete = () => {
    setShowLoader(false)
  }

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
      <HeroSection />
      <ShopByCategory />
      <NewArrivals />
      <PerfumeCarousel />
      <FragranceComponent />
      <Footer />
    </>
  );
}
