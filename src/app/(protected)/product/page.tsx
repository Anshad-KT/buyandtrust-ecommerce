'use client'
import { Suspense } from "react"
import ProductView from "./_component/ProductView"
import { Skeleton } from "@/components/ui/skeleton"

function ProductViewFallback() {
  return (
    <section className="w-full bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-white border-0 shadow-none overflow-hidden rounded-md flex flex-col h-full">
              <Skeleton className="h-64 w-full rounded-md mb-4" />
              <div className="flex flex-col items-start gap-2 w-full p-4 flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ProductPage() {
  return (
    <main>
      <Suspense fallback={<ProductViewFallback />}>
        <ProductView />
      </Suspense>
    </main>
  )
}