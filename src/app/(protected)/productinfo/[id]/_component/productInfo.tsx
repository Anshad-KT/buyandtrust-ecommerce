"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Minus, Plus, Star, StarHalf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter, useParams } from "next/navigation"
import { EcomService } from "@/services/api/ecom-service"
import { ToastVariant, toastWithTimeout, toastWithAction } from "@/hooks/use-toast"
import { makeApiCall } from "@/lib/apicaller"
import '@fontsource-variable/inter-tight';
import { useLogin } from "@/app/LoginContext";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/app/CurrencyContext";
import { useCart } from "@/hooks/useCart";
import QuantityCounter from "@/components/common/quantity-counter";

interface ProductProps {
  id: string
  name: string
  //   rating: number
  price: number
  originalPrice?: number
  discount?: number
  rich_text: string
  images: Array<{ url: string, is_thumbnail?: boolean }>
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
  item_code?: string
}

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [product, setProduct] = useState<ProductProps | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductProps[]>([])
  const router = useRouter()
  const { cartItemCount, setCartItemCount } = useLogin();
  const { id } = useParams()
  const itemId = id;
  const { cartProducts, handleIncrement, handleDecrement, updateCartCount, fetchCartProducts } = useCart();
  const { currencySymbol } = useCurrency();


  const style = {
    fontFamily: "'Inter Tight Variable', 'Inter Tight', 'Inter', sans-serif"
  }
  const productImages = useMemo(() => {
    const rawImages = Array.isArray(product?.images) ? product.images : [];
    if (rawImages.length === 0) return [{ url: "/placeholder.svg" }];

    const deduped: Array<{ url: string, is_thumbnail?: boolean }> = [];
    const indexByUrl = new Map<string, number>();

    rawImages.forEach((img) => {
      const url = typeof img?.url === "string" ? img.url.trim() : "";
      if (!url) return;

      const key = url.toLowerCase();
      const existingIndex = indexByUrl.get(key);

      if (existingIndex === undefined) {
        indexByUrl.set(key, deduped.length);
        deduped.push({ url, is_thumbnail: img?.is_thumbnail === true });
      } else if (img?.is_thumbnail) {
        deduped[existingIndex] = { ...deduped[existingIndex], is_thumbnail: true };
      }
    });

    return deduped.length > 0 ? deduped : [{ url: "/placeholder.svg" }];
  }, [product?.images]);

  const thumbnailIndex = useMemo(() => {
    const index = productImages.findIndex(img => img.is_thumbnail === true);
    return index >= 0 ? index : 0;
  }, [productImages]);

  const parseRichTextDescription = (richText: string) => {
    if (!richText) return "";

    const parseIfJson = (value: unknown) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      if (!trimmed) return "";
      try {
        return JSON.parse(trimmed);
      } catch {
        return value;
      }
    };

    const collectInsertText = (ops: any[]) =>
      ops
        .map((entry) => (typeof entry?.insert === "string" ? entry.insert : ""))
        .join("");

    // Handles plain text, JSON array, Quill { ops: [] }, and double-encoded JSON strings.
    let parsedValue: unknown = richText;
    for (let i = 0; i < 2; i += 1) {
      const next = parseIfJson(parsedValue);
      if (next === parsedValue) break;
      parsedValue = next;
    }

    if (Array.isArray(parsedValue)) {
      return collectInsertText(parsedValue);
    }

    if (
      parsedValue &&
      typeof parsedValue === "object" &&
      Array.isArray((parsedValue as { ops?: any[] }).ops)
    ) {
      return collectInsertText((parsedValue as { ops: any[] }).ops);
    }

    return typeof parsedValue === "string" ? parsedValue : "";
  };

  const plainDescription = useMemo(
    () => parseRichTextDescription(product?.rich_text || ""),
    [product?.rich_text]
  );

  const hasDescription =
    plainDescription.trim().length > 0 &&
    plainDescription.trim() !== "No description available";

  useEffect(() => {
    if (!itemId) return;
    // Use makeApiCall to fetch products
    makeApiCall(
      () => new EcomService().get_all_products(),
      {
        afterSuccess: (data: any) => {
          // Find the product with matching item_code
          const foundProduct = data.find((item: any) => item.item_code === itemId);

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
              images: foundProduct.images,
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
              .filter((item: any) => item.item_code !== itemId)
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
                item_id: item.item_id,
                item_code: item.item_code
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
    if (product) setSelectedImage(thumbnailIndex);
  }, [product, thumbnailIndex]);

  if (!product) return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Product Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-8 mb-16">
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
  console.log("product", product)
  const handleAddToCart = () => {
    if (!product) return;

    makeApiCall(
      async () => {
        const cart = await new EcomService().check_cart_exists();
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 10);

        if (cart.length === 0) {
          const newCart = await new EcomService().add_to_cart();
          await new EcomService().add_to_cart_products({
            product_id: product.id,
            item_id: product.item_id,
            cart_id: newCart.id,
            quantity: 1,
            delivery_date: deliveryDate.toISOString(),
          });
        } else {
          await new EcomService().add_to_cart_products({
            product_id: product.id,
            item_id: product.item_id,
            cart_id: cart[0].id,
            quantity: 1,
            delivery_date: deliveryDate.toISOString(),
          });
        }
        return true;
      },
      {
        afterSuccess: () => {
          toastWithAction(
            ToastVariant.Default,
            "Product added to cart successfully",
            "View Cart",
            () => router.push('/cart')
          );
          // Use the functions from useCart hook
          updateCartCount();
          fetchCartProducts();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }
        },
        afterError: (error: any) => {
          if (error?.message === "Customized cart already exists") {
            toastWithTimeout(ToastVariant.Default, "Customized cart already exists")
          } else {
            console.error("Error adding to cart:", error);
            toastWithTimeout(ToastVariant.Default, "Error adding product to cart");
          }
        },
      }
    );
  };


  const handleBuyNow = async () => {
    if (!product) return;

    try {
      const cart = await new EcomService().check_cart_exists();
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 10);

      if (cart.length === 0) {
        const newCart = await new EcomService().add_to_cart();
        await new EcomService().add_to_cart_products({
          product_id: product.id,
          item_id: product.item_id,
          cart_id: newCart.id,
          quantity: 1,
          delivery_date: deliveryDate.toISOString(),
        });
      } else {
        await new EcomService().add_to_cart_products({
          product_id: product.id,
          item_id: product.item_id,
          cart_id: cart[0].id,
          quantity: 1,
          delivery_date: deliveryDate.toISOString(),
        });
      }

      // Update cart count and products
      updateCartCount();
      await fetchCartProducts();

      // Dispatch cart updated event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }

      // Redirect to cart page after successful addition
      router.push('/cart');
    } catch (error) {
      console.error("Error in Buy Now:", error);
      toastWithTimeout(ToastVariant.Default, "Error processing your order");
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
      toastWithAction(
        ToastVariant.Default,
        "Product added to cart successfully",
        "View Cart",
        () => router.push('/cart')
      );
      setCartItemCount(cartItemCount + 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toastWithTimeout(ToastVariant.Default, "Error adding product to cart");
    }
  };

  const handleRelatedProductClick = (product: RelatedProductProps) => {
    router.push(`/productinfo/${product.item_code || product.id}`)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-8 mb-16">
        {/* Product Images */}
        <div className="flex">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 mr-4">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "w-16 h-20 rounded-md overflow-hidden cursor-pointer border-2",
                  selectedImage === index ? "border-gray-300" : "border-transparent",
                )}
                onClick={() => setSelectedImage(index)}
              >
                {image.url && image.url !== "/placeholder.svg" ? (
                  <Image
                    src={image.url}
                    alt={`${product?.name} thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Image
                    src="/productpage/noimage.svg"
                    alt={`${product?.name} thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1 rounded-lg overflow-hidden bg-gray-100 relative group">
            {productImages[selectedImage]?.url && productImages[selectedImage]?.url !== "/placeholder.svg" ? (
              <Image
                src={productImages[selectedImage]?.url}
                alt={product?.name}
                width={320}
                height={320}
                className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300  "
              />
            ) : (
              <Image
                src="/productpage/noimage.svg"
                alt={`${product?.name}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            )}
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
            >{currencySymbol}{product?.sale_price || product?.price}</span>
            {typeof product?.retail_price === "number" && typeof product?.sale_price === "number" && product.retail_price > product.sale_price && (
              <>
                <span className="text-gray-400 line-through ml-2">{currencySymbol}{product?.retail_price}</span>
                <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded">-{product?.discount}%</span>
              </>
            )}
          </div>

          {/* Horizontal divider lines */}
          <div className="w-full h-px bg-gray-200 my-4"></div>
          <div className="flex items-center w-full gap-4 my-6">
            {product?.inStock ? (
              (() => {
                const inCart = cartProducts.some(p => p.item_id === product.item_id);
                return inCart && product.item_id ? (
                  <QuantityCounter
                    quantity={cartProducts.find(p => p.item_id === product.item_id)?.localQuantity}
                    onIncrement={() => handleIncrement(product.item_id!)}
                    onDecrement={() => handleDecrement(product.item_id!)}
                  />
                ) : (
                  // <button
                  //   className="bg-black text-white rounded-full py-3 px-6 w-full font-normal text-lg"
                  //   style={{
                  //     fontWeight: "400",
                  //     fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                  //   }}
                  //   onClick={handleAddToCart}
                  // >
                  //   Add to Cart
                  // </button>
                  <div className="flex items-center w-full gap-4 my-6">
                    <div className="flex-1">
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-black text-white rounded-full py-3 px-6 font-normal text-lg"
                        style={{
                          fontWeight: "400",
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                        }}
                        disabled={!product?.inStock}
                      >
                        Add to Cart
                      </button>
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={handleBuyNow}
                        className="w-full bg-white text-black border border-black rounded-full py-3 px-6 font-normal text-lg hover:bg-black hover:text-white transition-colors"
                        style={{
                          fontWeight: "400",
                          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                        }}
                        disabled={!product?.inStock}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <button
                className="bg-green-600 text-white rounded-full py-3 px-6 w-full font-normal text-lg"
                style={{
                  fontWeight: "400",
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                }}
                onClick={() =>
                  window.open(
                    "https://wa.me/+919995303951?text=I'm%20interested%20in%20" +
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

          {/* Only show Product Description section if there's valid description */}
          {hasDescription && (
            <div className="mb-6" style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              <h2 className="text-lg text-gray-700 font-bold mb-2">Product Description</h2>
              <p className="text-gray-600 text-sm whitespace-pre-line break-words">
                {isDescriptionExpanded
                  ? plainDescription
                  : plainDescription.substring(0, 200) + (plainDescription.length > 200 ? "..." : "")}
                {(plainDescription.length > 200) && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-[#00000099] font-bold ml-1"
                  >
                    {isDescriptionExpanded ? "Read Less" : "Read More"}
                  </button>
                )}
              </p>
            </div>
          )}
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
                {product.image && product.image !== "/placeholder.svg" ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105 rounded-md"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <Image
                    src="/productpage/noimage.svg"
                    alt={`${product?.name}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-medium text-sm mb-1 truncate" style={style}>{product.name}</h3>
                {/* <div className="flex items-center mb-1">
                  {renderStarRating(product.rating)}
                  <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                </div> */}
                <div className="flex items-center mb-3">
                  <span className="text-base font-bold" style={style}>{currencySymbol}{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-gray-400 text-sm line-through ml-2" style={style}>{currencySymbol}{product.originalPrice}</span>
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
