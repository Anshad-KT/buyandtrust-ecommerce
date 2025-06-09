"use client"

import React from 'react';
import { SHIPPING_POLICIES } from '@/lib/constants/shippingpolicies';

const ShippingPolicyComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Policy</h1>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
              {SHIPPING_POLICIES}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyComponent;