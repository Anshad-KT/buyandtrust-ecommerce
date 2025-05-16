import Link from "next/link"
import { Home, ChevronRight } from 'lucide-react'

interface BreadcrumbsProps {
  currentPath: string
  pathMap: Record<string, string>
}

export default function Breadcrumbs({ currentPath, pathMap }: BreadcrumbsProps) {
  // Generate breadcrumb items based on the current path
  const generateBreadcrumbs = () => {
    const paths = currentPath?.split('/')?.filter(Boolean) || [];
    const breadcrumbs = [];
    
    let currentLink = '';
    
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      currentLink += `/${path}`;
      
      // Check if this path exists in our pathMap
      const label = pathMap[currentLink] || path;
      const isLast = i === paths.length - 1;
      
      breadcrumbs.push({
        href: currentLink,
        label,
        isCurrent: isLast
      });
    }
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = generateBreadcrumbs();
  
  return (
    <nav className="bg-gray-100 py-4 w-full ">
      <ol className="w-[90%] flex items-center space-x-1 text-sm  mx-auto py-1">
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
            ) : (
              <Link href={item.href} className="text-gray-600 hover:text-gray-900">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
