// 'use client'
// import { Button } from "@/components/ui/button"

// interface CategoryFilterProps {
//   categories: { id: string; name: string }[];
//   activeCategory: string | null;
//   onCategoryChange: (categoryId: string | null) => void;
// }

// export default function CategoryFilter({ 
//   categories, 
//   activeCategory, 
//   onCategoryChange 
// }: CategoryFilterProps) {
//   return (
//     <div className="mb-8">
//       <div className="flex flex-wrap gap-2 justify-center">
//         <Button
//           variant={activeCategory === null ? "destructive" : "outline"}
//           className={`
//             min-w-[100px] whitespace-normal rounded-md transition-transform duration-200
//             ${activeCategory === null 
//               ? 'bg-red-600 text-white hover:bg-red-700 hover:text-white border-red-600' 
//               : 'bg-white text-black hover:text-black border-gray-300 hover:bg-gray-100 hover:scale-105 hover:shadow-md'}
//           `}
//           onClick={() => onCategoryChange(null)}
//         >
//           All Products
//         </Button>
        
//         {categories.map((category) => (
//           <Button
//             key={category.id}
//             variant={activeCategory === category.id ? "destructive" : "outline"}
//             className={`
//                 min-w-[100px] whitespace-normal rounded-md transition-transform duration-200
//                 ${activeCategory === category.id 
//                   ? 'bg-red-600 text-white hover:bg-red-700 hover:text-white border-red-600' 
//                   : 'bg-white text-black hover:text-black border-gray-300 hover:bg-gray-100 hover:scale-105 hover:shadow-md'}
//               `}
//             onClick={() => onCategoryChange(category.id)}
//             title={category.name || `Category ${category.id}`}
//           >
//             {category.name || `Category ${category.id}`}
//           </Button>
//         ))}
//       </div>
//     </div>
//   )
// }