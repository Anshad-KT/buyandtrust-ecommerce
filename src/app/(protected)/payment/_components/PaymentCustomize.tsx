// import Image from "next/image"
// import { Card, CardContent } from "@/components/ui/card"

// interface OrderDetailsProps {
//   orderName: string
//   orderNo: string
//   size: string
//   quantity: number
//   deliveryExpected: string
//   totalPrice: number
//   imageUrl: string
// }

// export default function PaymentDetails({
//   orderName = "Men Jersey and Trousers",
 
//   size = "S,M,L,XL,XXL",
//   quantity = 11,
//   deliveryExpected = "Jan 18, 2025 Sunday, 11 am",
//   totalPrice = 11999,
//   imageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B0947E9B9-1B4B-4E56-AE1F-34E4AA3463B1%7D-8xYlniz8iolxNOPht0l3iMyw9ruzKe.png",
// }: any) {
 
  
//   return (
//     <Card className="lg:w-1/2 w-full m-auto h-full lg:mt-20 ">
//       <CardContent className="flex items-center justify-between p-0 ">
//         <div className="space-y-4 bg-[#F4F6FF] p-6 w-full lg:w-2/3 rounded-lg">
//           <div className="grid grid-cols-2 gap-x-8 gap-y-8 text-sm">
//             <div className="text-muted-foreground">Order Name</div>
//             <div className="font-bold">{orderName}</div>

//             <div className="text-muted-foreground">Quantity</div>
//             <div className="font-bold">{quantity}</div>

//             <div className="text-muted-foreground">Delivery Expected</div>
//             <div className="font-bold">{deliveryExpected}</div>

//             <div className="text-muted-foreground">Total Advance</div>
//             <div className="font-bold">₹ {totalPrice}/-</div>
//           </div>
//         </div>

//         <div className="lg:block hidden relative  m-auto   w-1/3  h-full">
//           <Image src={"/customized.svg"} alt={orderName} width={130} height={100} className="object-contain m-auto" />
//          </div>
//       </CardContent>
//     </Card>
//   )
// }

import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";


const OrderSuccessConfirmation = () => {
  const router = useRouter();
  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-4 flex flex-col items-center border border-gray-100 rounded-lg shadow-sm bg-white">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6 border-2 border-green-500">
        <Check className="w-8 h-8 text-green-500 stroke-2" />
      </div>
      
      {/* Success Message */}
      <h2 className="text-xl text-gray-700 font-medium mb-8">
        Your order is successfully placed
      </h2>
      
      {/* Action Buttons */}
      <div className="flex gap-3 mt-2">
        <button 
          className="flex items-center gap-2 py-2 px-5 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-50 transition text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span onClick={() => router.push('/')}>GO TO DASHBOARD</span>
        </button>
        
        <button 
          className="flex items-center gap-2 py-2 px-5 border border-orange-500 rounded bg-orange-500 text-white hover:bg-orange-600 transition text-sm"
        >
          <span onClick={() => router.push('/profile/orders')}>VIEW ORDER</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessConfirmation;