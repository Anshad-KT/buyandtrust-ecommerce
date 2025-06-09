"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Minus, Plus, Star, StarHalf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { EcomService } from "@/services/api/ecom-service"
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { makeApiCall } from "@/lib/apicaller"
import '@fontsource-variable/inter-tight';
import { useLogin } from "@/app/LoginContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductProps {
  id: string
  name: string
//   rating: number
  price: number
  originalPrice?: number
  discount?: number
  rich_text: string
  images: Array<{url: string, is_thumbnail?: boolean}>
  inStock?: boolean
  item_id?: string
  sale_price?: number
  purchase_price?: number
  retail_price?: number
  stock_quantity?: number
}

interface RelatedProductProps {
  id: string
  name: string
//   rating: number
  price: number
  originalPrice?: number
  discount?: number
  image: string
  item_id?: string
}

export default function ProductDetail() {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [product, setProduct] = useState<ProductProps | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductProps[]>([])
  const router = useRouter()
  const {cartItemCount, setCartItemCount} = useLogin();
  const {id} = useParams()
  const itemId = id;

  
  const style = {
    fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif"
  }
  // Get product images and thumbnail index
  const getProductImages = () => {
    if (!product || !product.images || product.images.length === 0) {
      return [{ url: "/placeholder.svg" }];
    }
    return product.images;
  }

  const getThumbnailIndex = () => {
    if (!product || !product.images || product.images.length === 0) return 0;
    
    const thumbnailIndex = product.images.findIndex(img => img.is_thumbnail === true);
    return thumbnailIndex >= 0 ? thumbnailIndex : 0;
  }

  useEffect(() => {
    if (!itemId) return;
    // Use makeApiCall to fetch products
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
          // Find the product with matching item_id
          const foundProduct = data.find((item: any) => item.item_id === itemId);

          if (foundProduct) {
            // Transform the product data to match our interface
            const transformedProduct: ProductProps = {
              id: foundProduct.id,
              name: foundProduct.name,
              // rating: foundProduct.rating || 4.5,
              price: foundProduct.sale_price ?? foundProduct.retail_price ?? 0,
              originalPrice: foundProduct.retail_price ?? foundProduct.sale_price ?? 0,
              discount: (typeof foundProduct.retail_price === "number" && typeof foundProduct.sale_price === "number" && foundProduct.retail_price > foundProduct.sale_price)
                ? Math.round(((foundProduct.retail_price - foundProduct.sale_price) / foundProduct.retail_price) * 100)
                : undefined,
              rich_text: foundProduct.rich_text || "No description available",
              images: foundProduct.images || [{ url: "/placeholder.svg" }],
              inStock: foundProduct.stock_quantity > 0,
              item_id: foundProduct.item_id,
              sale_price: foundProduct.sale_price,
              purchase_price: foundProduct.purchase_price,
              retail_price: foundProduct.retail_price,
              stock_quantity: foundProduct.stock_quantity
            };

            setProduct(transformedProduct);

            // Set related products from the same data
            const otherProducts = data
              .filter((item: any) => item.item_id !== itemId)
              .slice(0, 4)
              .map((item: any) => ({
                id: item.id,
                name: item.name,
                // rating: item.rating || 4,
                price: item.sale_price || 0,
                originalPrice: item.retail_price || 0,
                discount: (typeof item.retail_price === "number" && typeof item.sale_price === "number" && item.retail_price > item.sale_price)
                  ? Math.round(((item.retail_price - item.sale_price) / item.retail_price) * 100)
                  : undefined,
                image: item.images?.[0]?.url || "/placeholder.svg",
                item_id: item.item_id
              }));

            setRelatedProducts(otherProducts);
          }
        },
        afterError: (error: any) => {
          console.error("Error fetching product:", error);
        }
      }
    );
  }, [itemId]);

  
  // Set the initial selected image to the thumbnail when product changes
  useEffect(() => {
    if (product) {
      const index = getThumbnailIndex();
      setSelectedImage(index);
    }
  }, [product]);

  if (!product) return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Product Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Images Skeleton */}
        <div className="flex">
          <div className="flex flex-col gap-2 mr-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="w-16 h-20 rounded-md mb-2" />
            ))}
          </div>
          <div className="flex-1 rounded-lg overflow-hidden bg-gray-100 relative">
            <Skeleton className="w-full h-[350px] rounded-lg" />
          </div>
        </div>
        {/* Product Details Skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-1/3 rounded-md" /> {/* Stock status */}
          <Skeleton className="h-10 w-2/3 rounded-md" /> {/* Title */}
          <Skeleton className="h-8 w-1/4 rounded-md" /> {/* Price */}
          <Skeleton className="h-6 w-full rounded-md" /> {/* Divider */}
          <div className="flex items-center w-full gap-4 my-6">
            <Skeleton className="h-12 w-1/3 rounded-full" /> {/* Quantity selector */}
            <Skeleton className="h-12 w-2/3 rounded-full" /> {/* Add to Cart button */}
          </div>
          <Skeleton className="h-6 w-full rounded-md" /> {/* Divider */}
          <Skeleton className="h-24 w-full rounded-md" /> {/* Description */}
        </div>
      </div>
      {/* Related Products Skeleton */}
      <div className="mt-10">
        <Skeleton className="h-8 w-1/4 mb-6 rounded-md" /> {/* Section title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-md overflow-hidden shadow-sm flex flex-col">
              <Skeleton className="w-full h-64 sm:h-72 md:h-60 lg:h-64 xl:h-72 rounded-md" />
              <div className="p-4 flex flex-col flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex items-center mb-3 gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-8 w-full rounded-full mt-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  console.log("product",product)
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
      setCartItemCount(cartItemCount - 1);
    }
  }

  const handleAddToCart = async () => {
    try {
      // const customized_cart = await new EcomService().get_customized_cart();
      // if (customized_cart.length !== 0) {
      //   toastWithTimeout(ToastVariant.Default, "Customized cart already exists");
      //   return;
      // }
      const cart = await new EcomService().check_cart_exists();
      
      if (cart.length === 0) {
        const newCart = await new EcomService().add_to_cart();
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10);
        await new EcomService().add_to_cart_products({
          product_id: product.id,
          item_id: product.item_id,
          cart_id: newCart.id,
          quantity: quantity,
          delivery_date: deliveryDate.toISOString()
        });
      } else {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10);
        await new EcomService().add_to_cart_products({
          product_id: product.id,
          item_id: product.item_id,
          cart_id: cart[0].id,
          quantity: quantity,
          delivery_date: deliveryDate.toISOString()
        });
      }
      toastWithTimeout(ToastVariant.Default, "Product added to cart successfully");
      setCartItemCount(cartItemCount + 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toastWithTimeout(ToastVariant.Default, "Login to add to cart");
    }
  };

  // Add to cart handler for related products
  const handleAddRelatedToCart = async (relatedProduct: RelatedProductProps) => {
    try {
      // const customized_cart = await new EcomService().get_customized_cart();
      // if (customized_cart.length !== 0) {
      //   toastWithTimeout(ToastVariant.Default, "Customized cart already exists");
      //   return;
      // }
      const cart = await new EcomService().check_cart_exists();
      if (cart.length === 0) {
        const newCart = await new EcomService().add_to_cart();
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10);
        await new EcomService().add_to_cart_products({
          product_id: relatedProduct.id,
          item_id: relatedProduct.item_id,
          cart_id: newCart.id,
          quantity: 1,
          delivery_date: deliveryDate.toISOString()
        });
      } else {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10);
        await new EcomService().add_to_cart_products({
          product_id: relatedProduct.id,
          item_id: relatedProduct.item_id,
          cart_id: cart[0].id,
          quantity: 1,
          delivery_date: deliveryDate.toISOString()
        });
      }
      toastWithTimeout(ToastVariant.Default, "Product added to cart successfully");
      setCartItemCount(cartItemCount + 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toastWithTimeout(ToastVariant.Default, "Login to add to cart");
    }
  };

  const handleRelatedProductClick = (product: RelatedProductProps) => {
    router.push(`/productinfo/${product.item_id || product.id}`)
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1)
    setCartItemCount(cartItemCount + 1);
  }

  const productImages = getProductImages();
  const thumbnailIndex = getThumbnailIndex();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Images */}
        <div className="flex">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 mr-4">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "w-16 h-20 rounded-md overflow-hidden cursor-pointer border-2",
                  selectedImage === index ? "border-gray-800" : "border-transparent",
                )}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={`₹{product?.name} thumbnail ₹{index + 1}`}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 rounded-lg overflow-hidden bg-gray-100 relative group">

            <Image
              src={productImages[selectedImage]?.url || "/placeholder.svg"}
              alt={product?.name}
              width={350}
              height={350}
              className="object-fill w-full h-full transform group-hover:scale-105 transition-transform duration-300  "
            />
          </div>
        </div>

        {/* Product Details */}
        <div>
          {product?.inStock ? (
            <p className="text-[#00660C] bg-[#ECFFEF] text-bold px-4 py-2 rounded-md inline-block"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
            >Stock Available</p>
          ) : (
            <p className="text-gray-500 bg-gray-200 text-bold px-4 py-2 rounded-md inline-block"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
            >Out of Stock</p>
          )}
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              fontWeight: "700",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
          >
            {product?.name}
          </h1>

          {/* <div className="mb-4">{renderStarRating(product?.rating || 0)}</div> */}

          <div className="flex items-center mb-6">
            <span className="text-2xl font-bold"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
            >₹{product?.sale_price || product?.price}</span>
            {typeof product?.retail_price === "number" && typeof product?.sale_price === "number" && product.retail_price > product.sale_price && (
              <>
                <span className="text-gray-400 line-through ml-2">₹{product?.retail_price}</span>
                <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded">-{product?.discount}%</span>
              </>
            )}
          </div>

          {/* Horizontal divider lines */}
          <div className="w-full h-px bg-gray-200 my-4"></div>
          <div className="flex items-center w-full gap-4 my-6">
            {/* Quantity Selector - Takes up roughly 1/3 of space */}
            <div className="flex items-center bg-gray-100 rounded-full w-1/3">
              <button
                onClick={decrementQuantity}
                className="px-4 py-3 text-gray-800 focus:outline-none"
                aria-label="Decrease quantity"
                disabled={!product?.inStock}
              >
                <span className="text-xl font-medium">−</span>
              </button>
              <span className="flex-1 text-center font-normal text-lg">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="px-4 py-3 text-gray-800 focus:outline-none"
                aria-label="Increase quantity"
                disabled={!product?.inStock}
              >
                <span className="text-xl font-medium">+</span>
              </button>
            </div>
            
            {/* Add to Cart Button - Takes up roughly 2/3 of space */}
            {product?.inStock ? (
              <button
                className="bg-black text-white rounded-full py-3 px-6 w-2/3 font-normal text-lg"
                style={{
                  fontWeight: "400",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}
                disabled={!product?.inStock}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            ) : (
              <button
                className="bg-green-600 text-white rounded-full py-3 px-6 w-2/3 font-normal text-lg"
                style={{
                  fontWeight: "400",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}
                onClick={() =>
                  window.open(
                    "https://wa.me/+919999515345?text=I'm%20interested%20in%20" +
                      encodeURIComponent(product?.name || "your product"),
                    "_blank"
                  )
                }
              >
                Enquire Now
              </button>
            )}
          </div>
          {/* Horizontal divider lines */}
          <div className="w-full h-px bg-gray-200 my-4"></div>

          <div className="mb-6" style={{
            fontWeight: "400",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            <h2 className="text-lg text-gray-700 font-bold mb-2">Product Description</h2>
            <p className="text-gray-600 text-sm">
              {(() => {
                try {
                  // Parse the JSON string if it's in the expected format
                  if (product?.rich_text && product.rich_text.startsWith('[{')) {
                    const parsedText = JSON.parse(product.rich_text);
                    const plainText = parsedText.map((block: any) => block.insert).join('');
                    
                    return isDescriptionExpanded 
                      ? plainText 
                      : plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
                  } else {
                    // Fallback to original text if not in JSON format
                    return isDescriptionExpanded 
                      ? product?.rich_text 
                      : product?.rich_text.substring(0, 200) + (product?.rich_text.length > 200 ? '...' : '');
                  }
                } catch (e) {
                  // If JSON parsing fails, use the original text
                  return isDescriptionExpanded 
                    ? product?.rich_text 
                    : product?.rich_text.substring(0, 200) + (product?.rich_text.length > 200 ? '...' : '');
                }
              })()}
              {product?.rich_text && product?.rich_text.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-[#00000099] font-bold ml-1"
                >
                  {isDescriptionExpanded ? "Read Less" : "Read More"}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-6"
        style={{
          fontWeight: "550",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
        }}
        >Other Products in Store</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-md overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow flex flex-col"
              onClick={() => handleRelatedProductClick(product)}
            >
              <div className="relative w-full h-64 sm:h-72 md:h-60 lg:h-64 xl:h-72 flex-shrink-0">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={800}
                  height={600}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 rounded-md"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-medium text-sm mb-1 truncate" style={style}>{product.name}</h3>
                {/* <div className="flex items-center mb-1">
                  {renderStarRating(product.rating)}
                  <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                </div> */}
                <div className="flex items-center mb-3">
                  <span className="text-base font-bold" style={style}>₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-gray-400 text-sm line-through ml-2" style={style}>₹{product.originalPrice}</span>
                      <span className="ml-2 text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-sm">
                        -{product.discount}%
                      </span>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs py-2 h-auto border-gray-300 hover:bg-black hover:text-white rounded-full mt-auto"
                  style={style}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await handleAddRelatedToCart(product);
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
