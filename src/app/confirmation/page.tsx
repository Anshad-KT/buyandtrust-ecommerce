import React from 'react';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center p-8 max-w-sm w-full">
        {/* Illustration Container */}
        <div className="w-48 h-48 mb-6">
          <img src="/confirm.svg" alt="" className="w-full h-full" />
        </div>

        {/* Text Content */}
        <h2 className="text-xl font-semibold mb-2">Order Confirmed</h2>
        <p className="text-gray-600 mb-6">Your order id #1015 Confirmed</p>

        {/* Button */}
        <button className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition-colors rounded-none">
          Go to My Order
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;