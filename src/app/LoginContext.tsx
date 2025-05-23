'use client';
import { createContext, useState, useContext, ReactNode } from 'react';
import { AuthService } from '@/services/api/auth-service';

// Define the shape of our context
interface LoginContextType {
  isLoggedIn: any;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<any>>;
  isRefreshing: boolean;
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  cartItemCount: number;
  setCartItemCount: React.Dispatch<React.SetStateAction<number>>;
}

// Create the context with a default value
const LoginContext = createContext<LoginContextType | undefined>(undefined);

// Provider component that wraps parts of our app that need the context
export function LoginProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<any>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cartItemCount, setCartItemCount] = useState<number>(0);

  return (
    <LoginContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        isRefreshing,
        setIsRefreshing,
        cartItemCount,
        setCartItemCount,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}

// Custom hook to use the login context
export function useLogin() {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
}


