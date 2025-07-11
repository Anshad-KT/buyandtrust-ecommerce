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
    // For product detail pages, ensure the breadcrumb path is 'Products' and the path is '/product'
    const breadcrumbPaths = {
      '/address': 'Address',
      '/cart': 'Cart',
      '/payment': 'Payment',
      '/product': 'Products',
      '/productinfo': 'Products',
      '/profile': 'Profile'
    };
    
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