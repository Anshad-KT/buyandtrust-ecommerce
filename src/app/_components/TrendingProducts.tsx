'use client'
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { makeApiCall } from "@/lib/apicaller";
import { EcomService } from "@/services/api/ecom-service";
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function TrendingProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  
  const handleProductClick = (product: any) => {
    router.push(`/productinfo/${product.item_id || product.id}`);
  };
  
  useEffect(() => {
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
          // Filter products to only include the 5 specific item_ids
          const featuredItemIds =[
            'e9e2d525-e602-48c9-9ae9-037042c31bf1',
            '71f886b4-0429-403c-b4e9-40b4e7bb63dc',
            '6683521f-78cb-49f5-b62a-ae0f34adcdb7',
            '7cd84a3a-0a1b-4cc6-82ed-38ce6cfe8c99',
            '0035ed3f-6153-465a-ab6e-2d2c133676d0'  
          ]; 
          // [
          //   '95b43395-e999-41b7-84e0-50b6662bbfdf',
          //   '27648bd7-558e-46bb-a97e-95e79e8759c5', 
          //   '2cb8d96e-19eb-4c60-8d14-cb24d4344d63',
          //   '49c1281b-876c-4c47-a821-be781084fea8',
          //   '7f5bf67a-64d6-41cf-8731-87f090592dda'
          // ];

          const filteredProducts = data.filter((product: any) => 
            featuredItemIds.includes(product.item_id)
          );

          setProducts(filteredProducts);
        }
      }
    )
  }, [])

  return (
    <section className="w-full bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-center text-2xl md:text-5xl font-bold text-black">
          NEW ARRIVALS
        </h2>
        
        {/* Product Carousel - Now always visible */}
        <ProductCarousel products={products} handleProductClick={handleProductClick} />
      </div>
    </section>
  );
}

const handleAddToCart = async (product: any) => {
  try {
    const customized_cart = await new EcomService().get_customized_cart();
    if (customized_cart.length !== 0) {
      toastWithTimeout(ToastVariant.Default, "Customized cart already exists");
      return;
    }
    const cart = await new EcomService().check_cart_exists();
    
    if (cart.length == 0) {
      const newCart = await new EcomService().add_to_cart();
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 10);
      await new EcomService().add_to_cart_products({
        product_id: product.id,
        item_id: product.item_id, // Added item_id
        cart_id: newCart.id,
        quantity: 1,
        delivery_date: deliveryDate.toISOString()
      });
    } else {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 10);
      await new EcomService().add_to_cart_products({
        product_id: product.id,
        item_id: product.item_id, // Added item_id
        cart_id: cart[0].id,
        quantity: 1,
        delivery_date: deliveryDate.toISOString()
      });
    }
    toastWithTimeout(ToastVariant.Default, "Product added to cart successfully");
  } catch (error) {
    console.log(error, "error");
    toastWithTimeout(ToastVariant.Default, "Login to add to cart");
  }
};

// Modified ProductCarousel component with auto-sliding functionality
const ProductCarousel = ({ products, handleProductClick }: { products: any[], handleProductClick: (product: any) => void }) => {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api || products.length === 0) return;
    
    // Set the count once products are available
    setCount(products.length);
    
    // Set up the auto-slide interval
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000); // Change slide every 3 seconds
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [api, products]);

  // Update current index when the carousel slides
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", handleSelect);
    
    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <div className="w-full">
      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
        {products.map((product) => {
  // Calculate discount percentage
  const originalPrice = product?.retail_price || 0; // Changed from purchase_price to retail_price
  const salePrice = product?.sale_price || 0;
  const discountPercentage = originalPrice > 0 
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) 
    : 0;
  
  // Check if this is the special product that should always have zoom effect
  const isSpecialProduct = product.item_id === '7cd84a3a-0a1b-4cc6-82ed-38ce6cfe8c99';
  
  return (
    <CarouselItem key={product.id} className="basis-full md:basis-1/2 lg:basis-1/3">
      <div className="flex justify-center px-4">
        <Card className={`border-0 shadow-none rounded-lg w-full h-[500px] ${
          isSpecialProduct ? 'relative z-10' : ''
        }`}>
          <CardContent className="p-0 h-[350px] flex items-center justify-center">
            <div 
              className="relative cursor-pointer w-full h-full flex items-center justify-center"
              onClick={() => handleProductClick(product)}
            >
              {isSpecialProduct && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-500/10 rounded-lg"></div>
              )}
              
              <Image
                src={product?.img_url || (product?.images?.[0]?.url || product?.images?.find((img: { is_thumbnail: boolean }) => img.is_thumbnail)?.url) || "/placeholder.svg"}
                alt={product.name}
                width={400}
                height={400}
                className={`h-64 w-full object-contain transition-all duration-300 ${
                  isSpecialProduct 
                    ? 'scale-125 brightness-110 animate-[]' 
                    : 'hover:scale-105'
                }`}
              />
              
              {isSpecialProduct && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                  Featured
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className={`flex flex-col items-start gap-2 p-4 w-full ${
            isSpecialProduct ? 'bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-lg' : ''
          }`}>
            <h3 
              className={`text-xl font-medium text-black cursor-pointer truncate w-full ${
                isSpecialProduct ? 'font-bold' : ''
              }`}
              onClick={() => handleProductClick(product)}
            >
              {product?.name}
            </h3>
            <div className="flex items-center gap-3">
              <p className={`font-semibold ${isSpecialProduct ? 'text-lg text-blue-700' : 'text-black'}`}>
                ₹{product?.sale_price}
              </p>
              <p className="text-gray-500 line-through">₹{product?.retail_price}</p>
              {discountPercentage > 0 && (
                <span className={`text-xs ${
                  isSpecialProduct ? 'bg-red-200 text-red-700 px-3 py-1' : 'bg-red-100 text-red-600 px-2 py-1'
                } rounded-full`}>
                  -{discountPercentage}%
                </span>
              )}
            </div>
            <Button
              className={`w-full rounded-full ${
                product?.stock_quantity === 0
                  ? 'bg-green-600 text-white hover:bg-green-700 border-green-600 hover:border-green-700'
                  : isSpecialProduct 
                    ? 'bg-black text-white hover:bg-blue-700 hover:border-blue-700 border border-black' 
                    : 'bg-white text-black hover:bg-black hover:text-white border border-black'
              } mt-2`}
              onClick={() => 
                product?.stock_quantity === 0
                  ? window.open('https://wa.me/+919995153455?text=I%20am%20interested%20in%20' + encodeURIComponent(product?.name), '_blank')
                  : handleAddToCart(product)
              }
            >
              {product?.stock_quantity === 0 
                ? 'Enquire Now' 
                : isSpecialProduct 
                  ? 'Add to Cart Now' 
                  : 'Add to Cart'
              }
            </Button>
          </CardFooter>
        </Card>
      </div>
    </CarouselItem>
  );
          })}
        </CarouselContent>
        
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative mr-4 transform-none" />
          <div className="flex items-center justify-center gap-1 my-2">
            {Array.from({ length: count }).map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full ${
                  current === index ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <CarouselNext className="relative transform-none" />
        </div>
      </Carousel>
    </div>
  );
};
