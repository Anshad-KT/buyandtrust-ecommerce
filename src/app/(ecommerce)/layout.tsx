'use client'
import { AuthService } from "@/services/api/auth-service";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { toastWithTimeout } from "@/hooks/use-toast";
import { ToastVariant } from "@/hooks/use-toast";

 
export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const checkUserAuth = async () => {
      const cart_products = await new AuthService().isUserActive();
    
      if (cart_products == null) {
        toastWithTimeout(ToastVariant.Default, "Please login to buy customised jersey");
        router.push("/");
      }
    };

    checkUserAuth();
  }, [router]);
  return (
      <div>
         
          {children}
        
      </div>
    
  )
}
