"use client"

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TERMS_AND_CONDITIONS } from '@/lib/constants/termsandcondition';
import { PRIVACY_POLICY } from '@/lib/constants/privacypolicy';
import { RETURN_AND_REFUND_POLICY } from '@/lib/constants/returnandrefundpolicy';
import { SHIPPING_POLICIES } from '@/lib/constants/shippingpolicies';

export type PolicyType = 'terms' | 'privacy' | 'return' | 'shipping';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: PolicyType;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ 
  isOpen, 
  onClose, 
  type 
}) => {
  if (!isOpen) return null;

  const getPolicyContent = () => {
    switch (type) {
      case 'terms':
        return {
          title: 'Terms and Conditions',
          content: TERMS_AND_CONDITIONS
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: PRIVACY_POLICY
        };
      case 'return':
        return {
          title: 'Return and Refund Policy',
          content: RETURN_AND_REFUND_POLICY
        };
      case 'shipping':
        return {
          title: 'Shipping Policy',
          content: SHIPPING_POLICIES
        };
      default:
        return {
          title: 'Policy',
          content: ''
        };
    }
  };

  const { title, content } = getPolicyContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
              {content}
            </pre>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <Button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
