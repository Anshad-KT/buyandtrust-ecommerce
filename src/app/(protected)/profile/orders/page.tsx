"use client"

import Orders from "./_component/orders"

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Orders />
    </div>
  )
}





// "use client"

// import { AlertTriangle } from "lucide-react"
// import {
//   Package,
//   CreditCard,
//   User,
//   LogOut,
//   ChevronRight,
//   ChevronLeft,
//   Box,
//   Clock,
//   CheckSquare,
//   ArrowRight,
// } from "lucide-react"

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog"
// import { Button } from "@/components/ui/button"
// import React, { useEffect, useState } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import Image from 'next/image'
// import { EcomService } from '@/services/api/ecom-service'
// import { makeApiCall } from '@/lib/apicaller'
// import { Trash, X } from 'lucide-react'
// import { TextField } from '@mui/material'
// import { ToastVariant, toastWithTimeout } from '@/hooks/use-toast'
// // import Footer from '@/app/_components/Footer'

// import { ArrowLeft } from "lucide-react"
// import Link from 'next/link'
// import { useRouter } from "next/navigation"

// const Page = () => {
//   const [orderItems, setOrderItems] = useState<any[]>([])
//   const [changed, setChanged] = useState(false)
//   const [selectedOrder, setSelectedOrder] = useState<any>(null)
//   const [iscancel, setIscancel] = useState<any>(false)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [activeTab, setActiveTab] = useState("Order History")
//   const itemsPerPage = 10
  
//   useEffect(() => {
//     makeApiCall(
//       async () => new EcomService().get_customer_orders(),
//       {
//         afterSuccess: (data: any) => {
//           console.log("data orders:",data)
//           setOrderItems(data)
          
//         }
//       }
//     )
//   }, [changed])
  
//   const handleCancelRequest = (order: any) => {
//     setSelectedOrder(order)
//     setIscancel(true)
//   }

//   // Calculate pagination
//   const indexOfLastItem = currentPage * itemsPerPage
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage
//   const currentItems = orderItems.slice(indexOfFirstItem, indexOfLastItem)
//   const totalPages = Math.ceil(orderItems.length / itemsPerPage)

//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber)
//   }

//   const menuItems = [
//     { name: "Order History", icon: <Package className="h-5 w-5" /> },
//     { name: "Cards & Address", icon: <CreditCard className="h-5 w-5" /> },
//     { name: "My Profile", icon: <User className="h-5 w-5" /> },
//     { name: "Log-out", icon: <LogOut className="h-5 w-5" /> },
//   ]

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//       case "Completed":
//       case "Delivered":
//         return "text-green-500"
//       case "PENDING":
//       case "PROCESSING":
//       case "Booked":
//       case "In Process":
//       case "PACKAGING":
//         return "text-orange-500"
//       case "CANCELLED":
//         return "text-red-500"
//       default:
//         return "text-blue-500"
//     }
//   }
//   const router = useRouter()
  
//   // Calculate counts for status summary
//   const pendingOrders = orderItems.filter(item => 
//     item.order_status === "Booked" || 
//     item.order_status === "In Process" || 
//     item.order_status === "PACKAGING").length;
    
//   const completedOrders = orderItems.filter(item => 
//     item.order_status === "Completed" || 
//     item.order_status === "Delivered").length;
    
//   return (
//     <>
//       {/* Mobile View */}
//       <div className="flex flex-col items-center justify-center px-4 py-4 lg:hidden">
//         {orderItems.length ? (
//           <>
//             {/* Order Summary Cards for Mobile/Medium */}
//             <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
//               <div className="bg-blue-50 p-3 rounded-md flex items-center">
//                 <div className="p-2 mr-2">
//                   <img src="/totorders.svg" alt="Total Orders" className="h-6 w-6 text-blue-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-bold">{orderItems.length}</h2>
//                   <p className="text-sm text-gray-600">Total Orders</p>
//                 </div>
//               </div>

//               <div className="bg-orange-50 p-3 rounded-md flex items-center">
//                 <div className="p-2 mr-2">
//                   <img src="/pndgorders.svg" alt="Pending Orders" className="h-6 w-6 text-orange-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-bold">{pendingOrders}</h2>
//                   <p className="text-sm text-gray-600">Pending</p>
//                 </div>
//               </div>

//               <div className="bg-green-50 p-3 rounded-md flex items-center">
//                 <div className="p-2 mr-2">
//                   <img src="/cmltdorders.svg" alt="Completed Orders" className="h-6 w-6 text-green-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-bold">{completedOrders}</h2>
//                   <p className="text-sm text-gray-600">Completed</p>
//                 </div>
//               </div>
//             </div>
            
//             <OrderSummaryMobile 
//               setChanged={setChanged} 
//               changed={changed} 
//               orderItems={orderItems} 
//               currentPage={currentPage}
//               totalPages={totalPages}
//               setCurrentPage={setCurrentPage}
//             /> 
//           </>
//         ) : (
//           <>
//             <div className="w-64 h-64 mb-6">
//               <img
//                 src="/newsletter.png"
//                 alt="Illustration of a person sitting in an armchair"
//                 className="w-full h-full object-contain"
//               />
//             </div>
//             <h2 className="text-xl font-semibold mb-2">No Orders</h2>
//             <p className="text-gray-500 text-center">
//               You haven&apos;t placed any order yet.
//             </p>
//           </>
//         )}
//       </div>
      
//       {/* Desktop View */}
//       <div className="hidden lg:block">
//         {orderItems.length ? 
//           <section className='flex flex-col items-start justify-start w-full'>
//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
//               <div className="bg-blue-50 p-4 rounded-md flex items-center">
//                 <div className="p-2 mr-4">
//                   <img src="/totorders.svg" alt="Check" className="h-56px w-56px text-blue-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold">{orderItems.length}</h2>
//                   <p className="text-gray-600">Total Orders</p>
//                 </div>
//               </div>

//               <div className="bg-orange-50 p-4 rounded-md flex items-center">
//                 <div className="p-2 mr-4">
//                   <img src="/pndgorders.svg" alt="Check" className="h-56px w-56px text-orange-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold">{pendingOrders}</h2>
//                   <p className="text-gray-600">Pending Orders</p>
//                 </div>
//               </div>

//               <div className="bg-green-50 p-4 rounded-md flex items-center">
//                 <div className="p-2 mr-4">
//                   <img src="/cmltdorders.svg" alt="Check" className="h-56px w-56px text-green-500" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-bold">{completedOrders}</h2>
//                   <p className="text-gray-600">Completed Orders</p>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white shadow rounded-none overflow-hidden mb-6 w-full">
//               <h2 className="p-4 border-b font-medium">ORDER HISTORY</h2>
//               <div className="overflow-auto scrollbar-none max-h-[60vh] min-h-[50vh]">
//                 <table className="w-full">
//                   <thead className="bg-gray-50 text-gray-600 text-sm">
//                     <tr>
//                       <th className="py-3 px-4 text-left font-medium">ORDER ID</th>
//                       <th className="py-3 px-4 text-left font-medium">STATUS</th>
//                       <th className="py-3 px-4 text-left font-medium">DATE</th>
//                       <th className="py-3 px-4 text-left font-medium">TOTAL</th>
//                       <th className="py-3 px-4 text-left font-medium">ACTION</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {currentItems.map((item, index) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="py-3 px-4 font-medium">{item.sale_id || `#ORDER${index + 1}`}</td>
//                         <td className="py-3 px-4">
//                           <span className={getStatusColor(item.order_status)}>
//                             {item.order_status || 'PROCESSING'}
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 text-gray-600">{item.order_date || 'Dec 30, 2023 03:45'}</td>
//                         <td className="py-3 px-4 font-medium">
//                           ₹{item?.sub_total || item?.total_price || '0.00'} 
//                           {item?.product_details && item.product_details.length > 1 && 
//                             `(${item.product_details.length} Products)`
//                           }
//                         </td>
//                         <td className="py-3 px-4">
//                           <button 
//                             onClick={() => router.push(`/profile/viewdetails?id=${item.sale_id}`)}
//                             className="text-blue-500 hover:text-blue-700 flex items-center"
//                           >
//                             View Details <ArrowRight className="ml-1 h-4 w-4" />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
            
//             {orderItems.length > itemsPerPage && (
//               <div className="flex justify-center items-center mt-6 mb-4 gap-2 mx-auto max-w-md">
//                 <button 
//                   onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
//                   disabled={currentPage === 1}
//                   className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 disabled:opacity-50"
//                 >
//                   <ChevronLeft className="h-5 w-5" />
//                 </button>
//                 <div className="flex justify-center items-center gap-2 flex-1">
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => handlePageChange(page)}
//                       className={`w-10 h-10 flex items-center justify-center rounded-full ${
//                         currentPage === page 
//                           ? 'bg-orange-500 text-white' 
//                           : 'border border-gray-300 hover:bg-gray-100'
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}
//                 </div>
//                 <button 
//                   onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
//                   disabled={currentPage === totalPages}
//                   className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 disabled:opacity-50"
//                 >
//                   <ChevronRight className="h-5 w-5" />
//                 </button>
//               </div>
//             )}
//           </section> 
//         : (
//         <>
//           <div className="w-48 h-56 mx-auto mb-8">
//             <img
//               src="/newsletter.png"
//               alt="No Orders Illustration"
//               className="w-full h-full"
//             />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-1">No Orders</h2>
//           <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
//         </>
//       )}
//       </div>
//       {/* <Footer /> */}
//     </>
//   )
// }

// export default Page

// function OrderSummaryMobile({setChanged, changed, orderItems, currentPage, totalPages, setCurrentPage}: any) {
//   // Get status color function - copied from parent component
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//       case "Completed":
//       case "Delivered":
//         return "text-green-500"
//       case "PENDING":
//       case "PROCESSING":
//       case "Booked":
//       case "In Process":
//       case "PACKAGING":
//         return "text-orange-500"
//       case "CANCELLED":
//         return "text-red-500"
//       default:
//         return "text-blue-500"
//     }
//   }

//   const router = useRouter()
  
//   const handlePageChange = (pageNumber: number) => {
//     setCurrentPage(pageNumber)
//   }

//   // Calculate items per page and pagination
//   const itemsPerPage = 5
//   const indexOfLastItem = currentPage * itemsPerPage
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage
//   const currentItems = orderItems.slice(indexOfFirstItem, indexOfLastItem)
//   const calculatedTotalPages = Math.ceil(orderItems.length / itemsPerPage)

//   return (
//     <div className="overflow-y-auto max-h-[80vh] w-full pr-2 scrollbar-none">
//       {orderItems.length > 0 ? (
//         <>
//           <h2 className="text-lg font-medium p-3 border-b mb-4">ORDER HISTORY</h2>
          
//           {currentItems.map((item: any, index: number) => (
//             <Card key={index} className="bg-white relative rounded-sm mb-4 w-full transition-all duration-300 hover:shadow-md">
//               <CardContent className="p-4">
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="font-medium text-xs sm:text-sm break-all">{item.sale_id || `#ORDER${index + 1}`}</span>
//                   <span className={`${getStatusColor(item.order_status)} text-xs sm:text-sm`}>
//                     {item.order_status || 'PROCESSING'}
//                   </span>
//                 </div>
                
//                 <div className="grid grid-cols-2 gap-y-2 text-xs sm:text-sm">
//                   <div className="text-gray-500">Date:</div>
//                   <div className="text-right">
//                     {item.order_date || 'Dec 30, 2023 03:45'}
//                   </div>
                  
//                   <div className="text-gray-500">Total:</div>
//                   <div className="font-medium text-right">
//                     ₹{item.total_price || '0.00'}
//                   </div>
//                 </div>
                
//                 <div className="mt-4 pt-3 border-t flex justify-end">
//                   <button 
//                     onClick={() => router.push(`/profile/viewdetails?id=${item.sale_id}`)}
//                     className="text-blue-500 hover:text-blue-700 flex items-center text-xs sm:text-sm"
//                   >
//                     View Details <ArrowRight className="ml-1 h-4 w-4" />
//                   </button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
          
//           {/* Fixed Pagination for Mobile */}
//           {orderItems.length > itemsPerPage && (
//             <div className="flex justify-center items-center my-4 w-full sticky bottom-2 z-10">
//               <div className="bg-white shadow-lg rounded-none flex items-center py-1 px-2 border border-gray-200">
//                 <button 
//                   onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
//                   disabled={currentPage === 1}
//                   className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-50"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </button>
                
//                 {/* Show limited page numbers on very small screens */}
//                 <div className="flex space-x-1">
//                   {calculatedTotalPages <= 5 ? (
//                     // If 5 or fewer pages, show all
//                     Array.from({ length: calculatedTotalPages }, (_, i) => i + 1).map((page) => (
//                       <button
//                         key={page}
//                         onClick={() => handlePageChange(page)}
//                         className={`w-8 h-8 flex items-center justify-center rounded-full ${
//                           currentPage === page 
//                             ? 'bg-orange-500 text-white' 
//                             : 'hover:bg-gray-100'
//                         }`}
//                       >
//                         <span className="text-xs">{page}</span>
//                       </button>
//                     ))
//                   ) : (
//                     // If more than 5 pages, show current, first, last, and neighbors
//                     <>
//                       {currentPage > 2 && (
//                         <button
//                           onClick={() => handlePageChange(1)}
//                           className="w-8 h-8 flex items-center justify-center rounded-full"
//                         >
//                           <span className="text-xs">1</span>
//                         </button>
//                       )}
                      
//                       {currentPage > 3 && <span className="text-xs self-center">...</span>}
                      
//                       {currentPage > 1 && (
//                         <button
//                           onClick={() => handlePageChange(currentPage - 1)}
//                           className="w-8 h-8 flex items-center justify-center rounded-full"
//                         >
//                           <span className="text-xs">{currentPage - 1}</span>
//                         </button>
//                       )}
                      
//                       <button
//                         className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 text-white"
//                       >
//                         <span className="text-xs">{currentPage}</span>
//                       </button>
                      
//                       {currentPage < calculatedTotalPages && (
//                         <button
//                           onClick={() => handlePageChange(currentPage + 1)}
//                           className="w-8 h-8 flex items-center justify-center rounded-full"
//                         >
//                           <span className="text-xs">{currentPage + 1}</span>
//                         </button>
//                       )}
                      
//                       {currentPage < calculatedTotalPages - 2 && <span className="text-xs self-center">...</span>}
                      
//                       {currentPage < calculatedTotalPages - 1 && (
//                         <button
//                           onClick={() => handlePageChange(calculatedTotalPages)}
//                           className="w-8 h-8 flex items-center justify-center rounded-full"
//                         >
//                           <span className="text-xs">{calculatedTotalPages}</span>
//                         </button>
//                       )}
//                     </>
//                   )}
//                 </div>
                
//                 <button 
//                   onClick={() => handlePageChange(currentPage < calculatedTotalPages ? currentPage + 1 : calculatedTotalPages)}
//                   disabled={currentPage === calculatedTotalPages}
//                   className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-50"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="flex flex-col items-center justify-center py-10">
//           <div className="w-32 h-32 mb-4 mt-6">
//             <img src="/newsletter.png" alt="No Orders" className="w-full h-full object-contain" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-800 text-center">No Orders Found</h3>
//           <p className="text-sm text-gray-500 mt-1 text-center">You haven't placed any orders yet.</p>
//         </div>
//       )}
//     </div>
//   )
// }