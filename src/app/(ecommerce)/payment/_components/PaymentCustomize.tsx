import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface OrderDetailsProps {
  orderName: string
  orderNo: string
  size: string
  quantity: number
  deliveryExpected: string
  totalPrice: number
  imageUrl: string
}

export default function PaymentDetails({
  orderName = "Men Jersey and Trousers",
 
  size = "S,M,L,XL,XXL",
  quantity = 11,
  deliveryExpected = "Jan 18, 2025 Sunday, 11 am",
  totalPrice = 11999,
  imageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7B0947E9B9-1B4B-4E56-AE1F-34E4AA3463B1%7D-8xYlniz8iolxNOPht0l3iMyw9ruzKe.png",
}: any) {
 
  
  return (
    <Card className="lg:w-1/2 w-full m-auto h-full lg:mt-20 ">
      <CardContent className="flex items-center justify-between p-0 ">
        <div className="space-y-4 bg-[#F4F6FF] p-6 w-full lg:w-2/3 rounded-lg">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 text-sm">
            <div className="text-muted-foreground">Order Name</div>
            <div className="font-bold">{orderName}</div>

            <div className="text-muted-foreground">Quantity</div>
            <div className="font-bold">{quantity}</div>

            <div className="text-muted-foreground">Delivery Expected</div>
            <div className="font-bold">{deliveryExpected}</div>

            <div className="text-muted-foreground">Total Advance</div>
            <div className="font-bold">₹ {totalPrice}/-</div>
          </div>
        </div>

        <div className="lg:block hidden relative  m-auto   w-1/3  h-full">
          <Image src={"/customized.svg"} alt={orderName} width={130} height={100} className="object-contain m-auto" />
         </div>
      </CardContent>
    </Card>
  )
}

