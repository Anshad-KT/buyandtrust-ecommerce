"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EcomService } from "@/services/api/ecom-service";
import { useRouter } from "next/navigation";
import { toastWithTimeout } from "@/hooks/use-toast";
import { ToastVariant } from "@/hooks/use-toast";
import { makeApiCall } from "@/lib/apicaller";

interface PriceDetailsProps {
  products: any;
  notes: string
  cart_product_id: string[]
  isTrending: boolean
  quantity: number
  quantities: number[]
  extraPrinting: boolean[]
}

export function PriceDetails({ products, notes, cart_product_id, isTrending, quantities, quantity, extraPrinting}: PriceDetailsProps) {
  console.log("products:", products)
  const totalItems = isTrending ? quantities.reduce((acc:number, quantity:number) => acc + quantity, 0) : products.length
  const totalMRP = isTrending ? products.reduce((acc:number, product:any, index:number) => acc + product.sale_price*quantities[index], 0) : 2000
  const deliveryFee = "Free"
  const total = `₹${totalMRP.toLocaleString()}`

  const [calculatedTax, setCalculatedTax] = useState<number>(0);

  // --- FIX: Calculate discount based on quantities, not product.localQuantity ---
  // This ensures discount updates when quantities change.
  const totalDiscount = isTrending
    ? products.reduce(
        (acc: number, product: any, idx: number) =>
          acc +
          (product.retail_price - product.sale_price) *
            (quantities[idx] !== undefined ? quantities[idx] : 1),
        0
      )
    : 0;

  useEffect(() => {
    const fetchTax = async () => {
      if (!products || products.length === 0) {
        setCalculatedTax(0);
        return;
      }
      let totalTax = 0;
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        // get_tax_amount returns the rate (e.g. 0.18 for 18%)
        const rate = await new EcomService().get_tax_amount(product);
        // Use quantities[idx] if available, else fallback to product.localQuantity or 1
        const salePrice = Number(product.sale_price) || 0;
        const qty =
          isTrending && Array.isArray(quantities)
            ? Number(quantities[i]) || 1
            : Number(product.localQuantity) || 1;
        totalTax += salePrice * qty * rate;
      }
      setCalculatedTax(Math.round(totalTax));
    };
    fetchTax();
    // Only recalculate if cartProducts or quantities changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, quantities, isTrending]);

  const router = useRouter();
  return (
    <div className=" lg:pb-0 pb-5 lg:block flex flex-col-reverse gap-5">
      {/* Mobile Save and Update Button */}
      <button
        onClick={async () => {
          if (isTrending) {
            for (let i = 0; i < cart_product_id.length; i++) {
              await makeApiCall(
                () =>
                  new EcomService().update_cart_notes(
                    notes[i],
                    quantities[i],
                    cart_product_id[i],
                    extraPrinting[i]
                  ),
                {}
              );
            }
          }

          router.push("/payment");
        }}
        className="bg-gradient-to-b lg:hidden block from-[#FA8232] to-[#FA8232] text-white py-3 px-7 w-full"
      >
        Proceed to Checkout
      </button>

      {/* Price Breakdown */}

      <Card className="rounded-none bg-white border border-gray-200 shadow-none">
        <CardContent className="p-4">
          <h3 className="mb-4 text-black font-bold">Cart Totals</h3>
          <div className="space-y-2 text-[#757575]">
            {/* <div className="flex justify-between">
              <span>Total Items</span>
              <span>{!isTrending ? quantity : totalItems}</span>
            </div> */}
            <div className="flex justify-between">
              <span>Sub-total</span>
              <span className="font-medium">
                {isTrending
                  ? "₹" + totalMRP.toLocaleString()
                  : "₹" + "2000"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-green-600">
                {deliveryFee}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="font-medium">₹{totalDiscount}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span className="font-medium">₹{calculatedTax}</span>
            </div>
            <div className="border-t border-gray-300 my-2 pt-2"></div>
            <div className="flex justify-between font-bold text-black">
              <span>Total</span>
              <span>{total}</span>
            </div>
          </div>
          {/* Desktop Proceed to Checkout Button */}
          <button
            onClick={async () => {
              if (isTrending) {
                for (let i = 0; i < cart_product_id.length; i++) {
                  await makeApiCall(
                    () =>
                      new EcomService().update_cart_notes(
                        notes[i],
                        quantities[i],
                        cart_product_id[i],
                        extraPrinting[i]
                      ),
                    {}
                  );
                }
              }

              router.push("/payment");
            }}
            className="mt-3 bg-gradient-to-b lg:block font-bold hidden from-[#FA8232] to-[#FA8232] text-white py-3 px-7 w-full"
          >
            Proceed to Checkout
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
