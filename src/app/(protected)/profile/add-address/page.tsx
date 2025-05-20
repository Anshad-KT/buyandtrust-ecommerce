// "use client"

// import AddAddress from "./_component/addaddress"

// export default function AddressPage() {
//   return (
//     <div className="mx-auto px-4 py-8 mt-16 border">
//       <AddAddress />
//     </div>
//   )
// }

"use client"

// page.js
import dynamic from 'next/dynamic'

// Import the component with SSR disabled
const AddAddressDynamic = dynamic(
  () => import('./_component/addaddress'),
  { ssr: false } // This will disable server-side rendering for this component
)

export default function AddressPage() {
  return (
    <div className="mx-auto px-4 py-8 mt-16 border">
      <AddAddressDynamic />
    </div>
  )
}
