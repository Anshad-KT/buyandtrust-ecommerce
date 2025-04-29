'use client'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect } from "react"
import { useState } from "react"
import { makeApiCall } from "@/lib/apicaller"
import { EcomService } from "@/services/api/ecom-service"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
 
declare const Object: any;

export default function TrendingProducts() {
  const [products, setProducts] = useState<any[]>([])
  useEffect(() => {
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
          setProducts(data)
        }
      }
    )
  }, [])
  // const products: Product[] = Array(8).fill({
  //   id: 1,
  //   name: "Nikolic Men's Round Collar Football Jersey Multicolored",
  //   category: "Men JerJersey",
  //   price: 299.99,
  //   sizes: "M L-XXL XXl",
  //   image: "/home/shirt.jpg",
  //   stockStatus: "Out of Stock",
  // }).map((product, index) => ({
  //   ...product,
  //   id: index + 1,
  //   stockStatus: index % 3 === 1 ? "Low Stock" : "Out of Stock",
  // }))
  return (
    <section className="w-full bg-[#222222]  px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="lg:mb-20 mb-12 text-center text-2xl md:text-5xl  font-bold text-white">
          MEET OUR <span className="text-red-600">TRENDING</span> PRODUCTS
        </h2>
        <ProductsDesktop products={products} />
        <ProductsMobile products={products} />
      </div>
    </section>
  )
}

const ProductsDesktop = ({products}: any) => {
  const handleAddToCart = async (product: any) => {
   try{
    const customized_cart = await new EcomService().get_customized_cart()
    if(customized_cart.length !== 0){
      toastWithTimeout(ToastVariant.Default,"Customized cart already exists")
      return
    }
    const cart = await new EcomService().check_cart_exists()
    
    if(cart.length == 0){
    const newCart = await new EcomService().add_to_cart()
  
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 10);
    await new EcomService().add_to_cart_products({product_id:product.id,cart_id:newCart.id,quantity:10,delivery_date:deliveryDate.toISOString()})
    }
    else{
     
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 10);
      await new EcomService().add_to_cart_products({product_id:product.id,cart_id:cart[0].id,quantity:10,delivery_date:deliveryDate.toISOString()})
    }
    toastWithTimeout(ToastVariant.Default,"Product added to cart successfully")
   }catch(error:any){
    console.log(error,"error")
    toastWithTimeout(ToastVariant.Default,"Error adding product to cart")
 
   }      
  };
 
 
  return(
    <div className="">
   <CardsCarousel products={products} />
    
  </div>
  )
}

const ProductsMobile = ({products}:any) => {
  const handleAddToCart = async (product: any) => {
    try{
     const customized_cart = await new EcomService().get_customized_cart()
     if(customized_cart.length !== 0){
       toastWithTimeout(ToastVariant.Default,"Customized cart already exists")
       return
     }
     const cart = await new EcomService().check_cart_exists()
 
     if(cart.length == 0){
     const newCart = await new EcomService().add_to_cart()
    
     const deliveryDate = new Date();
     deliveryDate.setDate(deliveryDate.getDate() + 10);
     await new EcomService().add_to_cart_products({product_id:product.id,cart_id:newCart.id,quantity:10,delivery_date:deliveryDate.toISOString()})
     }
     else{
       const deliveryDate = new Date();
       deliveryDate.setDate(deliveryDate.getDate() + 10);
       await new EcomService().add_to_cart_products({product_id:product.id,cart_id:cart[0].id,quantity:10,delivery_date:deliveryDate.toISOString()})
     }
     toastWithTimeout(ToastVariant.Default,"Product added to cart successfully")
    }catch(error:any){
      console.log(error,"error")
     toastWithTimeout(ToastVariant.Default,"Error adding product to cart")
   
    }      
   };

  return(
    <div className="overflow-x-auto snap-x snap-mandatory lg:hidden block">
    <div className="flex gap-6">
      {products?.map((product:any) => (
        <div key={product.id} className="flex-shrink-0 w-full snap-center">
          <Card className="bg-[#222222] text-white border-0">
            <CardContent className="p-0">
              <div className="relative">
                <Badge
                  variant={
                    Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) === 0 ? "destructive" : Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) < 20 ? "default" : "destructive"
                  }
                  className={`absolute left-2 top-2 z-10 ${
                    Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) < 50 && Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) > 0 ? "bg-yellow-400" : ""
                  }`}
                >
                  {Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) === 0 ? "Out of Stock" : Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) < 50 ? "Low Stock" : "In Stock"}
                </Badge>
                <Image
                  src={"https://iqwgvylkgjaqitnqjldp.supabase.co/storage/v1/object/public/"+product.img_url || "/placeholder.svg"}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="h-auto w-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 w-full p-0">
              <Button
                variant="destructive"
                className="w-full p-0 rounded-none"
                disabled={Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) === 0}
                onClick={() => handleAddToCart(product)}
              >
                ADD TO CART
              </Button>
              <div className="space-y-1 w-full">
                <p className="text-sm text-red-500">{product.category_name}</p>
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-sm text-zinc-400">Size: {product.size.join(", ")}</p>
                <p className="font-semibold">₹{product.purchase_price}</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  </div>
  )
}
interface Product {
  id: string;
  name: string;
  stock: number;
  img_url: string;
  category_name: string;
  jersey_color: string;
  size_based_stock: any;
  size: string[];
  purchase_price: number;
}

const CardsCarousel = ({ products }: { products: Product[] }) => {
   const handleAddToCart = async (product: any) => {
    try{
     const customized_cart = await new EcomService().get_customized_cart()
     if(customized_cart.length !== 0){
       toastWithTimeout(ToastVariant.Default,"Customized cart already exists")
       return
     }
     const cart = await new EcomService().check_cart_exists()
 
     if(cart.length == 0){
     const newCart = await new EcomService().add_to_cart()
    
     const deliveryDate = new Date();
     deliveryDate.setDate(deliveryDate.getDate() + 10);
     await new EcomService().add_to_cart_products({product_id:product.id,cart_id:newCart.id,quantity:10,delivery_date:deliveryDate.toISOString()})
     }
     else{
       const deliveryDate = new Date();
       deliveryDate.setDate(deliveryDate.getDate() + 10);
       await new EcomService().add_to_cart_products({product_id:product.id,cart_id:cart[0].id,quantity:10,delivery_date:deliveryDate.toISOString()})
     }
     toastWithTimeout(ToastVariant.Default,"Product added to cart successfully")
    }catch(error:any){
      console.log(error,"error")
     toastWithTimeout(ToastVariant.Default,"Error adding product to cart")
   
    }      
   };

  // Display all products in a single carousel if there are not enough for two rows
  const showTwoCarousels = products?.length > 14;
  const firstHalfProducts = showTwoCarousels ? products.slice(0, Math.ceil(products.length / 2)) : products;
  const secondHalfProducts = showTwoCarousels ? products.slice(Math.ceil(products.length / 2)) : [];

  const renderCarousel = (carouselProducts: Product[], className: string = "") => (
    <Carousel className={`w-full lg:block hidden ${className}`} opts={{ slidesToScroll: 1, align: "start" }}>
      <CarouselContent className="-ml-2">
        {carouselProducts?.map((product) => (
          <CarouselItem key={product.id} className="pl-2 basis-1/4 md:basis-1/4 sm:basis-1/2">
            <Card className="bg-[#222222] text-white border-0">
              <CardContent className="p-0">
                <div className="relative">
                  <Badge
                    variant={
                      Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) === 0 ? "destructive" : Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) < 20 ? "default" : "destructive"
                    }
                    className={`absolute left-2 top-2 z-10 ${
                      Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) < 50 && Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) > 0 ? "bg-yellow-400" : ""
                    }`}
                  >
                    {Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) === 0 ? "Out of Stock" : Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) < 50 ? "Low Stock" : "In Stock"}
                  </Badge>
                  <Image
                    src={"https://iqwgvylkgjaqitnqjldp.supabase.co/storage/v1/object/public/"+product.img_url || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-auto w-full"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 w-full p-0">
                <Button
                  variant="destructive"
                  className="w-full p-0 rounded-none"
                  disabled={Object?.values(product?.size_based_stock).reduce((sum:any, qty:any) => sum + qty, 0) === 0}
                  onClick={() => handleAddToCart(product)}
                >
                  ADD TO CART
                </Button>
                <div className="space-y-1 w-full">
                  <p className="text-sm text-red-500">{product.category_name}</p>
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <p className="text-sm text-zinc-400">Size: {product.size.join(", ")}</p>
                  <p className="font-semibold">₹{product.purchase_price}</p>
                </div>
              </CardFooter>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
  
  return (
    <>
      {renderCarousel(firstHalfProducts, showTwoCarousels ? "mb-10" : "")}
      {showTwoCarousels && renderCarousel(secondHalfProducts)}
    </>
  );
};