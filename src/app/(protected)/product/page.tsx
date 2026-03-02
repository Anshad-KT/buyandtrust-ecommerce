'use client'
import { Suspense } from "react"
import ProductView from "./_component/ProductView"

export default function ProductPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <ProductView />
      </Suspense>
    </main>
  )
}
