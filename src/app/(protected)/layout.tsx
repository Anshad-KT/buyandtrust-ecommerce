'use client'
import { usePathname } from "next/navigation";
import Footer from "@/app/_components/Footer";
import Breadcrumbs from "@/app/_components/breadcrumps";

export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    const pathname = usePathname();
    
    // Define breadcrumb paths based on the file structure
    const breadcrumbPaths = {
      '/address': 'Address',
      '/cart': 'Cart',
      '/payment': 'Payment',
      '/product': 'Products',
      '/productinfo': 'Product Details',
      '/profile': 'Profile'  // Add Profile to the path map
    };
    
    return (
      <>
       {pathname !== '/' && <Breadcrumbs currentPath={pathname} pathMap={breadcrumbPaths} />}
      <div className="w-[90%] mx-auto">
       
        {children}
      </div>
      <Footer />
      </>
    )
  }