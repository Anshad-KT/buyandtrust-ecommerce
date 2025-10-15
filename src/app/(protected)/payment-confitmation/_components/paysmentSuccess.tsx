'use client'

import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";


const OrderSuccessConfirmation = () => {
  const router = useRouter();
  return (
    <div className="w-full px-4 md:px-6 py-16 md:py-24 flex flex-col items-center">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6 md:mb-8 border-2 border-green-500">
        <Check className="w-8 h-8 text-green-500 stroke-2" />
      </div>
      
      {/* Success Message */}
      <h2 className="text-lg md:text-xl text-gray-700 font-medium mb-6 md:mb-8" 
      style={{
        fontWeight: "400",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
      >
        Your order is successfully placed
      </h2>
      
      {/* Action Buttons */}
      <div className="flex gap-3 md:gap-4 mt-2">
        <button 
          className="flex items-center justify-center gap-2 h-10 md:h-11 px-4 md:px-6 min-w-[160px] md:min-w-[180px] border-2 border-[#FFE7D6] rounded-none bg-white text-gray-600 hover:bg-gray-50 transition text-sm"
        >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_499_31)">
        <path d="M2.5 13.75L10 18.125L17.5 13.75" stroke="#FA8232" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2.5 10L10 14.375L17.5 10" stroke="#FA8232" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2.5 6.25L10 10.625L17.5 6.25L10 1.875L2.5 6.25Z" stroke="#FA8232" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <defs>
        <clipPath id="clip0_499_31">
        <rect width="20" height="20" fill="white"/>
        </clipPath>
        </defs>
        </svg>

          <span onClick={() => router.push('/')} className="text-bold text-[#FA8232]"
          style={{
            fontWeight: "400",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
          >GO TO DASHBOARD</span>
        </button>
        
        <button 
          className="flex items-center justify-center gap-2 h-10 md:h-11 px-4 md:px-6 min-w-[140px] md:min-w-[160px] border border-orange-500 rounded-none bg-orange-500 text-white hover:bg-orange-600 transition text-sm"
        >
          <span onClick={() => router.push('/profile/orders')} className="text-semibold "
          style={{
            fontWeight: "400",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
          >VIEW ORDER</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessConfirmation;