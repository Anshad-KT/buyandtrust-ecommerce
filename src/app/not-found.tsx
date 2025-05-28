import React from 'react'
import { Button } from '@/components/ui/button'
import Footer from '@/app/_components/Footer'
//import Breadcrumbs from '@/app/_components/breadcrumps'

const Error404 = () => {
  return (
    <>
      {/* <Breadcrumbs currentPath="/404" pathMap={{ "/404": "error" }} /> */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12">
        <div className="max-w-md w-full mx-auto flex flex-col items-center text-center">
          {/* Center the image above the texts */}
          <img
            src="/404.svg"
            alt="404 Error"
            className="w-60 h-60 mb-8 mx-auto block"
            style={{ display: 'block' }}
          />
          <h1 className="text-2xl  mb-4"
          style={{
            fontWeight: "700",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
          >404, Page not found</h1>
          <p className="text-gray-600 mb-8"
          style={{
            fontWeight: "400",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
          >
            Something went wrong. It looks like your request could not be found.
            The link is broken or the page is removed.
          </p>
          <div className="flex justify-center gap-4 rounded-none">
            <Button asChild className="bg-orange-500 hover:bg-orange-600"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
            >
              <a href="/">GO BACK</a>
            </Button>
            <Button asChild variant="outline" className="border-[#FFE7D6]"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
            >
              <a href="/" className="flex text-orange-500  items-center gap-2">
                <img src="House.svg" alt="Home" />
                GO TO HOME
              </a>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Error404
