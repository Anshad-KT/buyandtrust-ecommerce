"use client";

import React from "react";
import { StepProgress } from "./_components/StepProgress";
import AddressForm from "./_components/Address";

export default function ShoppingCartPage() {
  

 
  return (
    <div className="container mx-auto lg:px-28 px-5 py-8">
      {/* Step Progress */}
      <StepProgress />

      <div className="flex justify-center">
       <AddressForm />
      </div>
    </div>
  );
}
