'use client'
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/app/_components/Footer";
import Breadcrumbs from "@/app/_components/breadcrumps";
import { AuthService } from "@/services/api/auth-service";
import { EcomService } from "@/services/api/ecom-service";

export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const pathname = usePathname();
    
    // Define breadcrumb paths based on the file structure
    // For product detail pages, ensure the breadcrumb path is 'Products' and the path is '/product'
    const breadcrumbPaths = {
      '/address': 'Address',
      '/cart': 'Cart',
      '/payment': 'Payment',
      '/product': 'Products',
      '/productinfo': 'Products',
      '/profile': 'Profile'
    };

    useEffect(() => {
      let isMounted = true;

      const savePendingOrdersAsLostSale = async () => {
        try {
          const userId = await new AuthService().getUserId();
          if (!userId || !isMounted) {
            return;
          }

          const pendingOrdersForUser: any[] = [];
          const pendingOrderPrefix = 'pendingOrder:';

          for (const storageKey of Object.keys(localStorage)) {
            if (!storageKey.startsWith(pendingOrderPrefix)) {
              continue;
            }

            const pendingOrderRaw = localStorage.getItem(storageKey);
            if (!pendingOrderRaw) {
              continue;
            }

            try {
              const pendingPayload = JSON.parse(pendingOrderRaw);
              const cartProducts = Array.isArray(pendingPayload?.cartProducts)
                ? pendingPayload.cartProducts
                : [];

              const hasCurrentUserProduct = cartProducts.some(
                (product: any) => product?.user_id === userId
              );

              if (!hasCurrentUserProduct) {
                continue;
              }

              pendingOrdersForUser.push({
                pending_order_key: storageKey,
                merchant_order_id: storageKey.replace(pendingOrderPrefix, ''),
                ...pendingPayload,
              });
            } catch (parseError) {
              console.error(`Invalid pending order JSON for key: ${storageKey}`, parseError);
            }
          }

          if (pendingOrdersForUser.length === 0 || !isMounted) {
            return;
          }

          await new EcomService().save_lost_sale_if_missing(userId, pendingOrdersForUser);
        } catch (error) {
          console.error('Error saving pending orders into lost_sale:', error);
        }
      };

      savePendingOrdersAsLostSale();

      return () => {
        isMounted = false;
      };
    }, []);
    
    return (
      <>
       {pathname !== '/' && <Breadcrumbs currentPath={pathname} pathMap={breadcrumbPaths} />}
      <div className="w-[90%] mx-auto">
{/*         
      <div className="min-h-screen flex flex-col">
        <div className="w-[90%] mx-auto flex-1"> */}
       
          {children}
        </div>
        <Footer />
      {/* </div> */}
      </>
    )
  }
