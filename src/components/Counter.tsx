// import React, { useState } from 'react';

// const QuantityCounter = ({ size, quantity, onIncrement, onDecrement }: { 
//   size: string
//   quantity: number
//   onIncrement: () => void
//   onDecrement: () => void
// }) => {
    
//   return (
//     <div className="relative w-32 border border-gray-300 rounded ml-16">
//       <div className="absolute -top-2 left-0 right-0 flex justify-center">
//         <span className="px-1 text-xs text-red-500 font-bold bg-white">{size}</span>
//       </div>
//       <div className="flex items-center">
//         <button 
//           onClick={onDecrement} 
//           className="w-1/3    px-2 py-2 text-gray-500 hover:text-gray-700 focus:outline-none"
//         >
//           -
//         </button>
//         <div className="w-1/3 text-center py-2">
//           <div className="font-semibold">{quantity.toString().padStart(2, '0')}</div>
//         </div>
//         <button 
//           onClick={onIncrement} 
//           className="w-1/3 px-2 py-2 text-gray-500   hover:text-gray-700 focus:outline-none"
//         >
//           +
//         </button>
//       </div>
//     </div>
//   );
// };

// export default QuantityCounter;