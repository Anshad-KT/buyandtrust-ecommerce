import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import Footer from '@/app/_components/Footer'
import Breadcrumbs from '@/app/_components/breadcrumps'

const Error404 = () => {
  return (
    <>
    {/* <Breadcrumbs items={[{label: "error", href: "/404", isCurrent: true}]} /> */}
    <Breadcrumbs currentPath="/404" pathMap={{"/404": "error"}} />
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
  
      <div className="max-w-md mx-auto text-center">
        <div className="relative mb-8">
          
          <img
            src="/404.svg"
            alt="404 Error"
            className="w-full h-auto"
          />

        </div>
        
        <h1 className="text-2xl font-bold mb-4">404, Page not found</h1>
        <p className="text-gray-600 mb-8">
          Something went wrong. It looks like your requested could not be found. 
          The link is broken or the page is removed.
        </p>
        
        <div className="flex justify-center gap-4 rounded-none">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/">GO BACK</Link>
          </Button>
          <Button asChild variant="outline" className="border-[#FFE7D6]">
            <Link href="/" className="flex text-orange-500 text-bold items-center gap-2">
                <img src="House.svg" alt="Home" />
                GO TO HOME
            </Link>
            </Button>
        </div>
      </div>
    </div>
    
    <Footer />
    </>
  )
}

export default Error404
