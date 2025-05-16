"use client"

import { ArrowLeft, Package, Box, Truck, Home } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { makeApiCall } from "@/lib/apicaller"
import { EcomService } from '@/services/api/ecom-service'
import { useParams, useSearchParams } from "next/navigation"

interface ProductDetail {
    id?: string;
    sale_item_id?: string;
    item_name?: string;
    description?: string;
    sale_price?: number;
    unit_price?: number;
    quantity?: number;
    img_url?: string;
    category?: string;
    item_code?: string;
    total_price?: number;
    item?: {
        name?: string;
        rich_text?: string;
        item_code?: string;
        item_category?: {
            name?: string;
        };
        images?: Array<{
            url: string;
        }>;
    };
}

interface OrderData {
    sale_id?: string;
    order_id?: string;
    order_date?: string;
    created_at?: string;
    order_status?: string;
    total_price?: number;
    notes?: string;
    customer?: {
        name?: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    customer_name?: string;
    customer_address?: string;
    customer_phone?: string;
    customer_email?: string;
    product_details?: ProductDetail[];
    sale_items?: Array<{
        item_id?: string;
        sale_item_id?: string;
        unit_price?: number;
        quantity?: number;
        total_price?: number;
        item?: {
            name?: string;
            rich_text?: string;
            item_code?: string;
            item_category?: {
                name?: string;
            };
            images?: Array<{
                url: string;
            }>;
        };
    }>;
}

export default function OrderDetails() {
    const {id} = useParams()
    console.log("id",id)
    const [orderData, setOrderData] = useState<OrderData | null>(null)
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        if (id) {
            makeApiCall(
                async () => new EcomService().get_customer_orders(),
                {
                    // change the data: any to data
                    afterSuccess: (data: any) => {
                        console.log("dataorder",data)
                        const orderDetails = data.find((item: OrderData) => item.sale_id === id)
                        console.log("orderDetails0",orderDetails)
                        if (orderDetails) {
                            console.log("orderDetails1",orderDetails)
                            // Use the product_details directly if it exists in the response
                            if (orderDetails.product_details && Array.isArray(orderDetails.product_details)) {
                                setOrderData(orderDetails)
                            } else {
                                // Otherwise create product_details from sale_items
                                setOrderData({
                                    ...orderDetails,
                                    // chnage the item: any to item
                                    product_details: orderDetails.sale_items?.map((item: any) => ({ 
                                        id: item.item_id,
                                        sale_item_id: item.sale_item_id,
                                        item_name: item.item?.name,
                                        description: item.item?.rich_text || "",
                                        sale_price: item.unit_price,
                                        unit_price: item.unit_price,
                                        quantity: item.quantity,
                                        img_url: item.item?.images?.[0]?.url || "",
                                        category: item.item?.item_category?.name || "Product",
                                        item_code: item.item?.item_code,
                                        total_price: item.total_price,
                                        item: item.item
                                    })) || []
                                })
                            }
                        }
                        console.log("orderDetails",orderDetails)
                        setLoading(false)
                    },
                    afterError: () => {
                        setLoading(false)
                    }
                }
            )
        }
    }, [id])
    
    if (loading) {
        return <div className="flex items-center justify-center p-8 h-full">
            <div className="animate-pulse text-gray-500">Loading order details...</div>
        </div>
    }
    
    if (!orderData) {
        return <div className="flex items-center justify-center p-8 h-full">
            <div className="text-gray-500">Order not found</div>
        </div>
    }
  
    function mapOrderStatus(status?: string) {
        switch (status?.toUpperCase()) {
            case "COMPLETED":
                return "delivered";
            case "PROCESSING":
            case "BOOKED":
                return "packaging";
            case "SHIPPING":
                return "shipping";
            default:
                return "placed";
        }
    }

    const orderStatus = mapOrderStatus(orderData.order_status || "placed")
    const getStatusIndex = (status: string) => {
        const statuses = ["placed", "packaging", "shipping", "delivered"]
        return statuses.indexOf(status)
    }

    const statusIndex = getStatusIndex(orderStatus)
    
    // Format date if available
    const formattedDate = orderData.order_date ? 
        new Date(orderData.order_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : orderData.created_at
  
    return (
        <div className="w-full bg-white">
            {/* Back button and Order Details Header - Improved responsive layout */}
            <div className="text-center relative p-4 sm:px-6 sm:py-4 border-b border-gray-200 mb-4 sm:mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Link href="/profile/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="sm:inline hidden">Back</span>
                    </Link>
                </div>
                <h1 className="text-lg font-medium">ORDER DETAILS</h1>
            </div>

            <div className="px-4 sm:px-6">
                {/* Order Summary */}
                <div className="bg-amber-50 p-4 rounded-md mb-6">
                    <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                            <h2 className="text-lg font-medium text-gray-800">#{orderData.order_id || orderData.sale_id}</h2>
                            <p className="text-sm text-gray-600">
                                {orderData.product_details?.length || 0} Products • Order Placed on {formattedDate}
                            </p>
                        </div>
                        <div className="text-2xl font-bold text-blue-500 mt-2 sm:mt-0">₹{orderData.total_price || 
                            orderData.product_details?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0}</div>
                    </div>
                </div>

                {/* Order Tracking - Improved responsiveness */}
                <div className="mb-8 sm:mb-12">
                    <div className="relative px-2">
                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-200 absolute top-4 left-0 right-0 z-0">
                            <div
                                className="h-2 bg-orange-500 absolute top-0 left-0 z-10 transition-all duration-300"
                                style={{ width: `${(statusIndex / 3) * 100}%` }}
                            ></div>
                        </div>

                        {/* Status Points - Improved mobile display */}
                        <div className="flex justify-between relative z-20">
                            {/* Order Placed */}
                            <div className="flex flex-col items-center w-16 sm:w-24">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        statusIndex >= 0 ? "bg-orange-500" : "bg-gray-200"
                                    } transition-colors duration-300`}
                                >
                                    {statusIndex >= 0 ? (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    ) : (
                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    )}
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                </div>
                                <p className="text-xs mt-1 text-center">Order Placed</p>
                            </div>

                            {/* Packaging */}
                            <div className="flex flex-col items-center w-16 sm:w-24">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        statusIndex >= 1 ? "bg-orange-500" : "bg-gray-200"
                                    } transition-colors duration-300`}
                                >
                                    {statusIndex >= 1 ? (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    ) : (
                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    )}
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <Box className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                                </div>
                                <p className="text-xs mt-1 text-center">Packaging</p>
                            </div>

                            {/* On The Road */}
                            <div className="flex flex-col items-center w-16 sm:w-24">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        statusIndex >= 2 ? "bg-orange-500" : "bg-gray-200"
                                    } transition-colors duration-300`}
                                >
                                    {statusIndex >= 2 ? (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    ) : (
                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    )}
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                                </div>
                                <p className="text-xs mt-1 text-center">On The Road</p>
                            </div>

                            {/* Delivered */}
                            <div className="flex flex-col items-center w-16 sm:w-24">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        statusIndex >= 3 ? "bg-orange-500" : "bg-gray-200"
                                    } transition-colors duration-300`}
                                >
                                    {statusIndex >= 3 ? (
                                        <div className="w-3 h-3 bg-white rounded-full"></div>
                                    ) : (
                                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    )}
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <Home className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                </div>
                                <p className="text-xs mt-1 text-center">Delivered</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="mb-8">
                    <h2 className="text-lg font-medium mb-4">Products ({orderData.product_details?.length || 0})</h2>

                    {/* Desktop View */}
                    <div className="hidden md:block bg-white rounded-md overflow-hidden border border-gray-200">
                        <div className="grid grid-cols-12 p-4 border-b bg-gray-100 text-sm font-medium text-gray-600">
                            <div className="col-span-6">PRODUCTS</div>
                            <div className="col-span-2 text-right">PRICE</div>
                            <div className="col-span-2 text-center">QUANTITY</div>
                            <div className="col-span-2 text-right">SUB-TOTAL</div>
                        </div>

                        {orderData.product_details && orderData.product_details.length > 0 ? (
                            orderData.product_details.map((product, index) => (
                                <div key={product.sale_item_id || index} className="grid grid-cols-12 p-4 border-b items-center">
                                    <div className="col-span-6">
                                        <div className="flex items-center">
                                            <div className="w-16 h-16 mr-4 bg-white border rounded-md overflow-hidden flex-shrink-0">
                                                {product.item?.images?.[0]?.url ? (
                                                    <Image
                                                        src={product.item.images[0].url}
                                                        alt={product.item?.name || "Product"}
                                                        width={64}
                                                        height={64}
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <Package className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-500 font-medium mb-1">
                                                    {product.item?.item_category?.name || product.item?.item_code || "Product"}
                                                </p>
                                                <h3 className="text-sm font-medium mb-1">{product.item?.name || "Product"}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {product.item?.rich_text ? 
                                                        (typeof product.item.rich_text === 'string' && product.item.rich_text.startsWith('[') ? 
                                                            JSON.parse(product.item.rich_text)[0]?.insert || "No description available" 
                                                            : product.item.rich_text) 
                                                        : "No description available"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-right">₹{product.unit_price || 0}</div>
                                    <div className="col-span-2 text-center">x{product.quantity || 1}</div>
                                    <div className="col-span-2 text-right font-medium">
                                        ₹{product.total_price || ((product.unit_price || 0) * (product.quantity || 1))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <Package className="w-16 h-16 mb-4 text-gray-400" />
                                    <p>No product details available</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Improved Mobile View */}
                    <div className="md:hidden space-y-4">
                        {orderData.product_details && orderData.product_details.length > 0 ? (
                            orderData.product_details.map((product, index) => (
                                <div key={product.sale_item_id || index} className="bg-white rounded-md p-4 border border-gray-200">
                                    <div className="flex mb-3">
                                        <div className="w-20 h-20 mr-3 bg-white border rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {product.item?.images?.[0]?.url ? (
                                                <Image
                                                    src={product.item.images[0].url}
                                                    alt={product.item?.name || "Product"}
                                                    width={80}
                                                    height={80}
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package className="w-10 h-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-blue-500 font-medium">
                                                {product.item?.item_category?.name || product.item?.item_code || "Product"}
                                            </p>
                                            <h3 className="text-sm font-medium">{product.item?.name || "Product"}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {product.item?.rich_text ? 
                                                    (typeof product.item.rich_text === 'string' && product.item.rich_text.startsWith('[') ? 
                                                        JSON.parse(product.item.rich_text)[0]?.insert || "No description available" 
                                                        : product.item.rich_text) 
                                                    : "No description available"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-t pt-3">
                                        <div>
                                            <p className="text-gray-500 text-xs">Price</p>
                                            <p className="font-medium">₹{product.unit_price || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Quantity</p>
                                            <p className="font-medium">x{product.quantity || 1}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Sub-total</p>
                                            <p className="font-medium">
                                                ₹{product.total_price || ((product.unit_price || 0) * (product.quantity || 1))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 bg-white rounded-md border border-gray-200">
                                <div className="flex flex-col items-center justify-center">
                                    <Package className="w-12 h-12 mb-3 text-gray-400" />
                                    <p>No product details available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary - Mobile Friendly */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-md">
                        <h2 className="text-lg font-medium mb-4">Billing Address</h2>
                        <div className="text-sm">
                            <p className="font-medium mb-2">{orderData.customer?.name || orderData.customer_name}</p>
                            <p className="text-gray-600 mb-4">
                                {orderData.customer?.address || orderData.customer_address || "No address provided"}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">Phone Number:</span> {orderData.customer?.phone || orderData.customer_phone || "N/A"}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Email:</span> {orderData.customer?.email || orderData.customer_email || "No email provided"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
                        <div className="text-sm">
                            <p className="font-medium mb-2">{orderData.customer?.name || orderData.customer_name}</p>
                            <p className="text-gray-600 mb-4">
                                {orderData.customer?.address || orderData.customer_address || "No address provided"}
                            </p>
                            <p className="text-gray-600 mb-1">
                                <span className="font-medium">Phone Number:</span> {orderData.customer?.phone || orderData.customer_phone || "N/A"}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Email:</span> {orderData.customer?.email || orderData.customer_email || "No email provided"}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md">
                        <h2 className="text-lg font-medium mb-4">Order Notes</h2>
                        <p className="text-sm text-gray-600">{orderData.notes || "No notes provided."}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}