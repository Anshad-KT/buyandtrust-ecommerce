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
    if (currentPath.startsWith('/profile/') && currentPath.split('/').length === 3) {
      const pathParts = currentPath.split('/');
      const lastPart = pathParts[2];
      if (lastPart !== 'orders') {
        return lastPart; 
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
      
      if (currentLink.startsWith('/profile/') && i === paths.length - 1 && paths.length === 2) {
        if (isLoading) {
          label = "Loading...";
        } else if (orderInfo) {
          label = orderInfo.order_id;
        } else {
          label = path; 
        }
      }
      
      const isLast = i === paths.length - 1;
     
      let isClickable = !(
        (currentLink.startsWith('/productinfo/') && isLast) ||
        (currentLink.startsWith('/profile/') && isLast && paths.length === 2)
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