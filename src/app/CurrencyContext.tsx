"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { EcomService } from '@/services/api/ecom-service';

interface CurrencyContextType {
  currencySymbol: string;
  currencyCode: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencySymbol: '₹',
  currencyCode: 'INR',
  isLoading: true,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [currencyCode, setCurrencyCode] = useState<string>('INR');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const currency = await new EcomService().get_business_currency();
        setCurrencySymbol(currency.symbol || '');
        setCurrencyCode(currency.code || '');
      } catch (error) {
        console.error('Error fetching currency:', error);
        // Keep default values
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrency();
  }, []);

  return (
    <CurrencyContext.Provider value={{ currencySymbol, currencyCode, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
