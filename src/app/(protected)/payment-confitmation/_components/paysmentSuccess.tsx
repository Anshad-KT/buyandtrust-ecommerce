'use client'

import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";


const OrderSuccessConfirmation = () => {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col items-center">
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 border-green-500">
        <Check className="w-8 h-8 text-green-500 stroke-[3]" />
      </div>
      
      {/* Success Message */}
      <h2 className="text-lg text-gray-700 mb-8" 
      style={{
        fontWeight: "400",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
      >
        Your order is successfully placed
      </h2>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-2 h-11 px-6 border border-gray-300 bg-white text-[#FA8232] hover:bg-gray-50 transition"
          style={{
            fontWeight: "400",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_499_31)">
              <path d="M2.5 13.75L10 18.125L17.5 13.75" stroke="#FA8232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.5 10L10 14.375L17.5 10" stroke="#FA8232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.5 6.25L10 10.625L17.5 6.25L10 1.875L2.5 6.25Z" stroke="#FA8232" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_499_31">
                <rect width="20" height="20" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span>GO TO DASHBOARD</span>
        </button>
        
        <button 
          onClick={() => router.push('/profile/orders')}
          className="flex items-center justify-center gap-2 h-11 px-6 bg-[#FA8232] text-white hover:bg-orange-600 transition"
          style={{
            fontWeight: "400",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
        >
          <span>VIEW ORDER</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessConfirmation;