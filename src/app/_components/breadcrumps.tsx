// import Link from "next/link"
// import { Home, ChevronRight } from 'lucide-react'

// interface BreadcrumbsProps {
//   currentPath: string
//   pathMap: Record<string, string>
// }

// export default function Breadcrumbs({ currentPath, pathMap }: BreadcrumbsProps) {
//   // Generate breadcrumb items based on the current path
//   const generateBreadcrumbs = () => {
//     const paths = currentPath?.split('/')?.filter(Boolean) || [];
//     const breadcrumbs = [];
    
//     let currentLink = '';
    
//     for (let i = 0; i < paths.length; i++) {
//       const path = paths[i];
//       currentLink += `/${path}`;
      
//       // Check if this path exists in our pathMap
//       const label = pathMap[currentLink] || path;
//       const isLast = i === paths.length - 1;
      
//       breadcrumbs.push({
//         href: currentLink,
//         label,
//         isCurrent: isLast
//       });
//     }
    
//     return breadcrumbs;
//   };
  
//   const breadcrumbItems = generateBreadcrumbs();
  
//   return (
//     <nav className="bg-gray-100 py-4 w-full ">
//       <ol className="w-[90%] flex items-center space-x-1 text-sm  mx-auto py-1">
//         <li>
//           <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
//             <Home className="h-4 w-4" />
//           </Link>
//         </li>
//         <li className="ml-2">
//           <Link href="/" className="text-gray-600 hover:text-gray-900">
//             Home
//           </Link>
//         </li>
        
//         {breadcrumbItems.map((item, index) => (
//           <li key={index} className="flex items-center">
//             <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
//             {item.isCurrent ? (
//               <span className="text-blue-500 font-medium">{item.label}</span>
//             ) : (
//               <Link href={item.href} className="text-gray-600 hover:text-gray-900">
//                 {item.label}
//               </Link>
//             )}
//           </li>
//         ))}
//       </ol>
//     </nav>
//   )
// }


// import Link from "next/link"
// import { Home, ChevronRight } from 'lucide-react'

// interface BreadcrumbsProps {
//   currentPath: string
//   pathMap: Record<string, string>
// }

// export default function Breadcrumbs({ currentPath, pathMap }: BreadcrumbsProps) {
//   // Generate breadcrumb items based on the current path
//   const generateBreadcrumbs = () => {
//     const paths = currentPath?.split('/')?.filter(Boolean) || [];
//     const breadcrumbs = [];
    
//     let currentLink = '';
    
//     for (let i = 0; i < paths.length; i++) {
//       const path = paths[i];
//       currentLink += `/${path}`;
      
//       // Check if this path exists in our pathMap
//       const label = pathMap[currentLink] || path;
//       const isLast = i === paths.length - 1;
      
//       // Special case for profile pages
//       const isClickable = !(path === 'Profile' || (pathMap[currentLink] === 'Profile'));
      
//       breadcrumbs.push({
//         href: currentLink,
//         label,
//         isCurrent: isLast,
//         isClickable
//       });
//     }
    
//     return breadcrumbs;
//   };
  
//   const breadcrumbItems = generateBreadcrumbs();
  
//   return (
//     <nav className="bg-gray-100 py-4 w-full ">
//       <ol className="w-[90%] flex items-center space-x-1 text-sm  mx-auto py-1">
//         <li>
//           <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
//             <Home className="h-4 w-4" />
//           </Link>
//         </li>
//         <li className="ml-2">
//           <Link href="/" className="text-gray-600 hover:text-gray-900">
//             Home
//           </Link>
//         </li>
        
//         {breadcrumbItems.map((item, index) => (
//           <li key={index} className="flex items-center">
//             <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
//             {item.isCurrent ? (
//               <span className="text-blue-500 font-medium">{item.label}</span>
//             ) : item.isClickable ? (
//               <Link href={item.href} className="text-gray-600 hover:text-gray-900">
//                 {item.label}
//               </Link>
//             ) : (
//               <span className="text-gray-600">{item.label}</span>
//             )}
//           </li>
//         ))}
//       </ol>
//     </nav>
//   )
// }

'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, ChevronRight } from 'lucide-react'
import { EcomService } from "@/services/api/ecom-service"

interface BreadcrumbsProps {
  currentPath: string
  pathMap: Record<string, string>
}

export default function Breadcrumbs({ currentPath, pathMap }: BreadcrumbsProps) {
  const [productName, setProductName] = useState<string>("");
  const [orderInfo, setOrderInfo] = useState<{ order_id: string; sale_id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Extract item_id from path if it's a productinfo route
  const getItemIdFromPath = () => {
    if (currentPath.startsWith('/productinfo/')) {
      const pathParts = currentPath.split('/');
      return pathParts[2]; // /productinfo/ITEM_ID
    }
    return null;
  };

  // Extract sale_id from path if it's a profile order route
  const getSaleIdFromPath = () => {
    if (currentPath.startsWith('/profile/') && currentPath.split('/').length === 3) {
      const pathParts = currentPath.split('/');
      const lastPart = pathParts[2];
      // Check if it's not 'orders' (which would be the main orders page)
      if (lastPart !== 'orders') {
        return lastPart; // /profile/SALE_ID
      }
    }
    return null;
  };

  // Fetch product name when on productinfo page
  useEffect(() => {
    const itemId = getItemIdFromPath();
    const saleId = getSaleIdFromPath();
    
    if (itemId) {
      setIsLoading(true);
      
      // Fetch products and find the one with matching item_id
      new EcomService().get_all_products()
        .then((data: any) => {
          const foundProduct = data.find((item: any) => item.item_id === itemId);
          if (foundProduct) {
            setProductName(foundProduct.name);
          }
        })
        .catch((error) => {
          console.error("Error fetching product for breadcrumb:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (saleId) {
      setIsLoading(true);
      
      // Fetch orders and find the one with matching sale_id
      new EcomService().get_customer_orders()
        .then((data: any) => {
          const foundOrder = data.find((item: any) => item.sale_id === saleId);
          if (foundOrder) {
            setOrderInfo({
              order_id: foundOrder.order_id || `SALE-${foundOrder.sale_id?.slice(-6)}`,
              sale_id: foundOrder.sale_id
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching order for breadcrumb:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Clear data if not on productinfo or order detail page
      setProductName("");
      setOrderInfo(null);
    }
  }, [currentPath]);

  // Generate breadcrumb items based on the current path
  const generateBreadcrumbs = () => {
    const paths = currentPath?.split('/')?.filter(Boolean) || [];
    const breadcrumbs = [];
   
    let currentLink = '';
   
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      currentLink += `/${path}`;
     
      // Check if this path exists in our pathMap
      let label = pathMap[currentLink] || path;
      
      // Special handling for productinfo pages
      if (currentLink.startsWith('/productinfo/')) {
        if (i === paths.length - 1) {
          // This is the item_id part, use product name if available
          if (isLoading) {
            label = "Loading...";
          } else if (productName) {
            label = productName;
          } else {
            label = path; // Fallback to item_id if name not found
          }
        } else if (currentLink === '/productinfo') {
          label = 'Product Details';
        }
      }
      
      // Special handling for profile order detail pages
      if (currentLink.startsWith('/profile/') && i === paths.length - 1 && paths.length === 2) {
        // This is /profile/SALE_ID
        if (isLoading) {
          label = "Loading...";
        } else if (orderInfo) {
          label = orderInfo.order_id;
        } else {
          label = path; // Fallback to sale_id if order not found
        }
      }
      
      const isLast = i === paths.length - 1;
     
      // Special case for profile pages, product detail pages, and order detail pages
      const isClickable = !(
        path === 'Profile' || 
        (pathMap[currentLink] === 'Profile') ||
        (currentLink.startsWith('/productinfo/') && isLast) ||
        (currentLink.startsWith('/profile/') && isLast && paths.length === 2)
      );
     
      breadcrumbs.push({
        href: currentLink,
        label,
        isCurrent: isLast,
        isClickable
      });
    }
   
    return breadcrumbs;
  };
 
  const breadcrumbItems = generateBreadcrumbs();
 
  return (
    <nav className="bg-gray-100 py-4 w-full">
      <ol className="w-[90%] flex items-center space-x-1 text-sm mx-auto py-1">
        <li>
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        <li className="ml-2">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
        </li>
       
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            {item.isCurrent ? (
              <span className="text-blue-500 font-medium">{item.label}</span>
            ) : item.isClickable ? (
              <Link href={item.href} className="text-gray-600 hover:text-gray-900">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-600">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}