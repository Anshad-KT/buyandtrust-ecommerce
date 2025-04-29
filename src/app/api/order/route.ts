import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

const razorpay = new Razorpay({
 key_id: process.env.RAZORPAY_KEY_ID!,
 key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
 const { amount,email,name } = (await request.json()) as {
  amount: string;
  email:string;
  name:string
 }; 

 const options = {
  amount: amount,
  currency: "INR",
  receipt: 'rcp1',
  notes: {
    name: name, // Adding custom metadata
    email: email,
  },
 };
 console.log(razorpay,"----")
 let order;
 try {
   order = await razorpay.orders.create(options);
   console.log(order, "order");
 } catch (error) {
   console.error("Error creating Razorpay order:", error);
   return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
 }
 return NextResponse.json({ orderId: order.id }, { status: 200 });
}
