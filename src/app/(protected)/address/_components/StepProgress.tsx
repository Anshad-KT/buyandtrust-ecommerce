"use client";

import React from "react";

export function StepProgress() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4 text-sm">
        <span className="font-medium text-[#2C2C2C] lg:text-base text-sm">CART</span>
        <span className="text-[#2C2C2C] flex">
          ------- <span className="lg:block hidden"> -----------------------</span>
        </span>
        <span className="text-red-500 lg:text-base text-sm underline">ADDRESS</span>
        <span className="text-[#2C2C2C] flex">
          ------- <span className="lg:block hidden"> -----------------------</span>
        </span> 
        <span className="text-[#2C2C2C] lg:text-base text-sm">PAYMENT</span>
      </div>
    </div>
  );
}
