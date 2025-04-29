"use client"

import { AlertTriangle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { EcomService } from '@/services/api/ecom-service'
import { makeApiCall } from '@/lib/apicaller'
import { ChevronRight, Trash, X } from 'lucide-react'
import { TextField } from '@mui/material'
import { ToastVariant, toastWithTimeout } from '@/hooks/use-toast'

import { ArrowLeft } from "lucide-react"
import Link from 'next/link'

const Page = () => {
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [changed, setChanged] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [iscancel, setIscancel] = useState<any>(false)
  
  useEffect(() => {
    makeApiCall(
      async () => new EcomService().get_all_orders(),
      {
        afterSuccess: (data: any) => {
          setOrderItems(data)
        }
      }
    )
  }, [changed])
  
  const handleCancelRequest = (order: any) => {
    setSelectedOrder(order)
    setIscancel(true)
  }
  
  return (
    <>
      <div className="flex flex-col items-center justify-center px-4 py-4 lg:hidden">
        {orderItems.length ? 
          !iscancel ? 
          <OrderSummaryMobile 
          setIscancel={handleCancelRequest}
          setChanged={setChanged} 
          changed={changed} 
          orderItems={orderItems} 
        /> :  
             <ContactSupportMobile 
            setIscancel={setIscancel} 
            item={selectedOrder}
          /> 
          : (
          <>
            <div className="w-64 h-64 mb-6">
              <img
                src="/newsletter.png"
                alt="Illustration of a person sitting in an armchair"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Orders</h2>
            <p className="text-gray-500 text-center">
              You haven&apos;t placed any order yet.
            </p>
          </>
        )}
      </div>
      
      {orderItems.length ? 
        !iscancel ? 
          <section className='lg:block flex flex-col items-start justify-start w-full'>
            <OrderSummary 
              setChanged={setChanged} 
              changed={changed} 
              setIscancel={handleCancelRequest}
              orderItems={orderItems} 
            />
          </section> : 
          <ContactSupport 
            setIscancel={setIscancel} 
            item={selectedOrder}
          /> 
        : (
        <>
          <div className="lg:flex hidden w-48 h-56 mx-auto mb-8">
            <img
              src="/newsletter.png"
              alt="No Orders Illustration"
              className="w-full h-full"
            />
          </div>
          <h2 className="text-xl lg:flex hidden font-semibold text-gray-900 mb-1">No Orders</h2>
          <p className="text-gray-500 lg:flex hidden">You haven&apos;t placed any orders yet.</p>
        </>
      )}
    </>
  )
}

export default Page

function OrderSummaryMobile({setChanged,changed,orderItems,setIscancel}:any) {
 
   return (
     // <div className="max-w-2xl mx-auto p-4 space-y-4">
     <>
       {orderItems.map((item:any, index:number) => (
         <Card key={index} className={`bg-[rgba(214, 214, 214, 0.17)] relative rounded-sm ${index == 0 ?"" :" mt-5" } w-[97%]  `}>
           <CardContent className="flex  items-start gap-4 p-4"> 
             <div className="relative w-24 h-[6rem]   flex-shrink-0"> 
               <Image
                 src={item.is_customized_product ? "/customized.svg" : "/trending.svg"}
                 alt={item.name}
                 width={100}
                 height={100}
                 className="object-contain"
               />
             </div>
             
             <div className="flex-1 min-w-0 ">
               <div className="flex justify-between items-start ">
                {/* {(item?.order_status == "ORDER RECEIVED" ) && ( */}
                  <X className='absolute cursor-pointer top-0 right-0 text-red-600' onClick={() => {
                    setIscancel(item)
                     
                    }}
                 />
                {/* )}  */}
                 <div>
                   <h3 className="font-semibold text-md">{item.is_customized_product ? "Customized Product" : ""}</h3>
                   <p className='text-sm text-left text-muted-foreground'>{"Order Id: "+item?.order_uuid}</p>
                  {!item.is_customized_product ? <p className='text-sm text-left text-muted-foreground'>{"Product Code: "+item?.order_details?.playerDetails?.map((product:any)=>product.product_code).join(", ")}</p> :null}
                    
                 </div>
                 <div className="text-[11px] absolute lg:bottom-0 bottom-0 lg:right-0 right-2 text-red-600">
                  Order updates: <span className="text-primary text-red-600 font-bold">{item?.order_status}</span>
                </div>
               </div>
               <div className=" flex flex-col justify-between items-start">
                 <p className="text-sm">Qty: {item.is_customized_product ? item?.order_details?.playerDetails?.length : item?.product_details?.reduce((acc:number,curr:any)=>acc+curr.quantity,0)}</p>
                 <p className="font-semibold">₹ {item.is_customized_product ? "2000" : item?.product_details?.reduce((acc:number,curr:any)=>acc+curr.price * curr.quantity,0)}</p>
               </div> 
             </div>
           </CardContent>
         </Card>
       ))}
      
       </>
     // </div>
   )
 }

function OrderSummary({setChanged,changed,orderItems,setIscancel}:any) {
 
   
  return (
    <> 
      <div className="overflow-y-auto max-h-[90vh] w-full  pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
       
      {orderItems?.map((item:any,index:number)=>(
        <Card key={index} className="lg:block hidden  rounded-none shadow-none mr-auto w-[90%] bg-[#f8f8f8] mt-4">
          <CardContent className="p-6   h-full">
            <div className="flex gap-6 h-full ">
              <div className="w-32 h-[90%] relative  bg-white">
                <Image 
                  src={item.is_customized_product ? "/customized.svg" : "/trending.svg"}
                  alt="Men's Round Collar Football Jersey"
                  width={100}
                  height={100}
                  className="h-full w-full"
                />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl text-left font-semibold">{item.is_customized_product ? "Customized Product" : "Trending Product"}</h1>
                    <p className="text-sm text-left text-muted-foreground">Order Id: {item?.order_uuid}</p>
                    <p className='text-sm text-left text-muted-foreground'>{"Product Code: "+item?.product_details?.map((product:any)=>product.product_code).join(", ")}</p>
                  
                  </div>
                  
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    
                    <TextField
                      className='w-36'
                      label="QTY"
                      
                      type="number"
                      value={item.is_customized_product ?item?.order_details?.playerDetails?.length :  item?.product_details?.reduce((acc:number,curr:any)=>acc+curr.quantity,0)}
                      // onChange={handleChange}
                      InputLabelProps={{
                        shrink: true, // Keeps the label visible when the input is empty
                      }}
                      InputProps={{
                        inputProps: { min: 0, max: 100 }, // Optional: set min and max values
                      }}
                      variant="outlined" // Change variant if needed: "filled" | "standard"
                      fullWidth
                      
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#BEC8E0" },
                          "&:hover fieldset": { borderColor: "#BEC8E0" },
                          "&.Mui-focused fieldset": { borderColor: "#BEC8E0" },
                        },
                        "width": "50%"
                      }}
                    />
                    {/* {(item?.order_status == "ORDER RECEIVED" ) && ( */}
                  <button 
                    className="flex items-center gap-1 px-3 py-3 border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                    onClick={() => {
           
                      setIscancel(item)
                      
                    }}
                  >
                    <X size={16} />
                    <span className="text-sm">Cancel Order</span>
                  </button>
                  {/* )}  */}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    
                    <span className="text-lg lg:text-2xl font-bold">₹ {item.is_customized_product ? "2000" : item?.product_details?.reduce((acc:number,curr:any)=>acc+curr.price * curr.quantity,0)}</span>
                    <div className="text-sm text-red-600">
                     <span className='lg:block hidden'>Order updates:</span> <span className={`text-primary text-red-600 font-bold`}>{ item?.order_status }</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </>
  )
}

function ContactSupportMobile({setIscancel, item}: any) {
 
  
  return (
    <div className="lg:hidden block mx-auto p-6 bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-gray-700 cursor-pointer" onClick={() => setIscancel(false)}>
            <ArrowLeft size={20} />
          </div>
          <h1 className="text-xl font-medium text-gray-800">Contact Our Support Team</h1>
        </div>

        

        <p className="text-gray-600 text-left">Have a concern? Our support team is just a message away.</p>

        <p className='text-gray-600 text-left'>Email: <span className="font-medium">support@example.com</span></p>
        <p className='text-gray-600 text-left'>Phone: <span className="font-medium">+91-XXXXXXXXXX</span></p>

        {item && item.order_id && item?.order_status == "ORDER RECEIVED" && (
          <div className="pt-3">
            <CancelOrderDialog data={item} setChanged={() => setIscancel(false)} />
          </div>
        )}

        <p className="text-sm text-gray-600">
          Please take a moment to review our{" "}
          <Link href="https://sites.google.com/view/bega-sportswear-refund-policy/home" target="_blank" className="text-gray-700 underline">
            Cancellation Policy
          </Link>
          , which outlines our terms and conditions for order cancellations.
        </p>
      </div>
    </div>
  )
}

function ContactSupport({setIscancel, item}: any) {
 
  
  return (
    <div className="lg:block hidden mx-auto p-6 bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="text-gray-700 cursor-pointer" onClick={() => setIscancel(false)}>
            <ArrowLeft size={20} />
          </div>
          <h1 className="text-xl font-medium text-gray-800">Contact Our Support Team</h1>
        </div>

        

        <p className="text-gray-600 text-left">Have a concern? Our support team is just a message away.</p>

        <p className='text-gray-600 text-left'>Email: <span className="font-medium">support@example.com</span></p>
        <p className='text-gray-600 text-left'>Phone: <span className="font-medium">+91-XXXXXXXXXX</span></p>

        {item && item.order_id && item?.order_status == "ORDER RECEIVED" && (
          <div className="pt-3">
            <CancelOrderDialog data={item} setChanged={() => setIscancel(false)} />
          </div>
        )}

        <p className="text-sm text-gray-600">
          Please take a moment to review our{" "}
          <Link href="https://sites.google.com/view/bega-sportswear-refund-policy/home" target="_blank" className="text-gray-700 underline">
            Cancellation Policy
          </Link>
          , which outlines our terms and conditions for order cancellations.
        </p>
      </div>
    </div>
  )
}

function CancelOrderDialog({data, setChanged}: any) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  
  
  if (!data || !data.order_id) {
    console.error("Invalid order data:", data)
    return <div className="text-red-500">Cannot cancel: missing order information</div>
  }
  
  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            className="w-full lg:w-1/3  py-2 px-4 border border-red-300 text-red-500 rounded hover:bg-red-50 transition-colors"
            onClick={() => setOpen(true)}
          >
            Cancel this Order #{data.order_id}
          </button>
        </AlertDialogTrigger>
        
        {submitted ? (
          <div className='text-center text-gray-600'>Order cancellation requested</div>
        ) : (
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-8 border-red-100 bg-red-500 text-white">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <AlertDialogTitle className="text-center text-xl">
                Are you sure you want to cancel this order?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Cancelling order #{data.order_id} will send your request to our support team for further assistance. Do you
                want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-3 sm:justify-center">
              <AlertDialogCancel className="mt-0 flex-1 bg-gray-200 hover:bg-gray-300">
                Keep Order
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                
                  makeApiCall(
                    async () => new EcomService().cancel_order(data.order_id),
                    {
                      afterSuccess: (response: any) => {
                        if(!data.is_customized_product){ 
                            makeApiCall(
                              () => new EcomService().changeStock(data.product_details),{
                                afterSuccess: () => {

                                }
                              }
                            )
                        }
                      
                        toastWithTimeout(ToastVariant.Default, "Order Cancelled Successfully")
                        setSubmitted(true)
                        if (setChanged) {
                          setTimeout(() => setChanged(), 1000)
                        }
                      },
                      afterError: (error: any) => {
                        console.error("Error cancelling order:", error)
                        toastWithTimeout(ToastVariant.Destructive, "Failed to cancel order")
                      }
                    }
                  )
                }} 
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  )
}

