"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { EcomService } from "@/services/api/ecom-service";

interface CurrencyContextType {
  currencySymbol: string;
  currencyCode: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencySymbol: "Rs",
  currencyCode: "INR",
  isLoading: true,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: currency, isLoading } = useQuery({
    queryKey: ["business-currency"],
    queryFn: () => new EcomService().get_business_currency(),
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });

  const currencySymbol = typeof currency?.symbol === "string" ? currency.symbol : "Rs";
  const currencyCode = typeof currency?.code === "string" ? currency.code : "INR";

  return (
    <CurrencyContext.Provider value={{ currencySymbol, currencyCode, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
