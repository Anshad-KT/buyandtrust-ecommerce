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

  const getItemIdFromPath = () => {
    if (currentPath.startsWith('/productinfo/')) {
      const pathParts = currentPath.split('/');
      return pathParts[2]; 
    }
    return null;
  };

  const getSaleIdFromPath = () => {
    // Handle /profile/{saleId} route for order details
    if (currentPath.startsWith('/profile/') && currentPath.split('/').length === 3) {
      const pathParts = currentPath.split('/');
      const possibleSaleId = pathParts[2];
      // Check if it's not a known profile route (orders, my-profile, add-address, etc.)
      if (!['orders', 'my-profile', 'add-address', 'address', 'cards'].includes(possibleSaleId)) {
        return possibleSaleId;
      }
    }
    return null;
  };

  useEffect(() => {
    
    const itemId = getItemIdFromPath();
    const saleId = getSaleIdFromPath();
    
    if (itemId) {
      setIsLoading(true);
      
      new EcomService().get_all_products()
        .then((data: any) => {
          const foundProduct = data.find((item: any) => item.item_id === itemId);
          if (foundProduct) {
            setProductName(foundProduct.name);
          }
        })
        .catch((error) => {
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (saleId) {
      setIsLoading(true);
      
      new EcomService().get_order_details_by_id(saleId)
        .then((data: any) => {
          if (data) {
            setOrderInfo({
              order_id: data.sale_invoice || data.order_id || `SALE-${data.sale_id?.slice(-6)}`,
              sale_id: data.sale_id
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching order details:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setProductName("");
      setOrderInfo(null);
    }
  }, [currentPath]);

  const generateBreadcrumbs = () => {
    const paths = currentPath?.split('/')?.filter(Boolean) || [];
    const breadcrumbs = [];
   
    let currentLink = '';
   
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      currentLink += `/${path}`;
     
      let label = pathMap[currentLink] || path;
      
      // Handle profile route labels with proper capitalization
      if (currentLink === '/profile/orders') {
        label = 'Orders';
      } else if (currentLink === '/profile/my-profile') {
        label = 'My Profile';
      } else if (currentLink === '/profile/add-address' || currentLink === '/profile/address') {
        label = 'Saved Address';
      } else if (currentLink === '/profile/cards') {
        label = 'Cards';
      }
      
      if (currentLink.startsWith('/productinfo/')) {
        if (i === paths.length - 1) {
          if (isLoading) {
            label = "Loading...";
          } else if (productName) {
            label = productName;
          } else {
            label = path; 
          }
        } else if (currentLink === '/productinfo') {
          label = 'Products';
        }
      }
      
      // Handle order detail page breadcrumb (e.g., /profile/{saleId})
      if (currentLink.startsWith('/profile/') && i === paths.length - 1 && paths.length === 2) {
        const possibleSaleId = paths[1];
        if (!['orders', 'my-profile', 'add-address', 'address', 'cards'].includes(possibleSaleId)) {
          if (isLoading) {
            label = "Loading...";
          } else if (orderInfo) {
            label = orderInfo.order_id;
          } else {
            label = path; 
          }
        }
      }
      
      const isLast = i === paths.length - 1;
     
      let isClickable = !(
        (currentLink.startsWith('/productinfo/') && isLast) ||
        (currentLink.startsWith('/profile/') && isLast && paths.length === 2 && 
         !['orders', 'my-profile', 'add-address', 'address', 'cards'].includes(paths[1]))
      );
      let href = currentLink;
      if (currentLink === '/productinfo') {
        href = '/product';
      }
      if (
        (path === 'Profile' || pathMap[currentLink] === 'Profile') &&
        currentLink === '/profile'
      ) {
        isClickable = true;
        href = '/profile/my-profile';
      }

      breadcrumbs.push({
        href: href,
        label,
        isCurrent: isLast,
        isClickable
      });
      
      // If this is the Profile breadcrumb and the next item is a sale ID, insert Orders
      if (currentLink === '/profile' && i < paths.length - 1) {
        const nextPath = paths[i + 1];
        if (!['orders', 'my-profile', 'add-address', 'address', 'cards'].includes(nextPath)) {
          breadcrumbs.push({
            href: '/profile/orders',
            label: 'Orders',
            isCurrent: false,
            isClickable: true
          });
        }
      }
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
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2 flex-shrink-0" />
            {item.isCurrent ? (
              <span className="text-blue-500 font-medium truncate max-w-[120px] sm:max-w-[350px] md:max-w-[250px] lg:max-w-[350px] xl:max-w-[450px]">{item.label}</span>
            ) : item.isClickable ? (
              <Link href={item.href} className="text-gray-600 hover:text-gray-900 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[250px] lg:max-w-[350px] xl:max-w-[450px]">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-600 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[250px] lg:max-w-[350px] xl:max-w-[450px]">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}