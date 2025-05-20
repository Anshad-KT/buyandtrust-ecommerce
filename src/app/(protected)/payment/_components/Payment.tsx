// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import React, { useEffect, useState } from 'react';
// import { Loader2, CreditCard, Banknote, ChevronRight } from 'lucide-react';
// import { EcomService } from '@/services/api/ecom-service';
// import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Textarea } from '@/components/ui/textarea';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import { makeApiCall } from '@/lib/apicaller';

// const OrderDetails = ({size, localQuantity, deliveryExpected, totalPrice, imageUrl, cartProducts, delivery_address}:any) => {
  
//   // const { createOrderId,processPayment,onSubmit} = usePayment()
//   const [isLoading, setIsLoading] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState('cash');
//   const [country, setCountry] = useState('');
//   const [region, setRegion] = useState('');
//   const [city, setCity] = useState('');
//   const router = useRouter();


//   const [countryList, setCountryList] = useState<any[]>([])
//   const [stateList, setStateList] = useState<any[]>([])
//   const [cityList, setCityList] = useState<any[]>([])
//   const [customerAddresses, setCustomerAddresses] = useState<any[]>([])
//   const [defaultAddress, setDefaultAddress] = useState<any>(null)
  
//   // Form fields for billing information
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [companyName, setCompanyName] = useState('');
//   const [address, setAddress] = useState('');
//   const [zipCode, setZipCode] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');

//   useEffect(() => {
//     makeApiCall(async () => {
//       const countryList = await new EcomService().get_country_list()
//       const stateList = await new EcomService().get_state_list()
//       const cityList = await new EcomService().get_city_list()
//       const customerAddresses = await new EcomService().get_customer_addresses()
//       console.log("customerAddresses", customerAddresses)
//       setCountryList(countryList)
//       setStateList(stateList)
//       setCityList(cityList)
//       setCustomerAddresses(customerAddresses)
      
      
//       // Find default address or use the first one
//       const defaultAddr = customerAddresses.find((addr: any) => addr.is_default === true) || 
//                          (customerAddresses.length > 0 ? customerAddresses[0] : null);
//       console.log("defaultAddr", defaultAddr)
                         
//       if (defaultAddr) {
//         console.log("defaultAddrsetset", defaultAddr)
//         setDefaultAddress(defaultAddr);
        
//         // Set form values based on the address
//         if (defaultAddr.name) {
//           const nameParts = defaultAddr.name.split(' ');
//           console.log("nameParts", nameParts)
//           setFirstName(nameParts[0] || '');
//           setLastName(nameParts.slice(1).join(' ') || '');
//         }

//         setFirstName(defaultAddr.first_name || '');

//         setLastName(defaultAddr.last_name || '');

//         setCompanyName(defaultAddr.company_name || '');

//         setAddress(defaultAddr.address || '');

//         setCountry(defaultAddr.country || '');

//         setRegion(defaultAddr.state || '');

//         setCity(defaultAddr.city || '');

//         setZipCode(defaultAddr.zipcode || '');

//         setEmail(defaultAddr.email || '');

//         setPhone(defaultAddr.phone || '');
//       }
//     }, {
//       afterSuccess: () => {
//         console.log("countryList", countryList)
//         console.log("stateList", stateList)
//         console.log("cityList", cityList)
//         console.log("customerAddresses", customerAddresses)
//         console.log("defaultAddress", defaultAddress)
//       }
//     })
//   }, [])


//   // For testing: create dsale on proceed to pay
//   const handleProceedToPay = async () => {
//     setIsLoading(true);
//     try {
//       // Just for testing: create dsale
//       await new EcomService().create_order({cartProducts});
//       // You can add a redirect or notification here if needed
//       router.push('/profile/orders');
//     } catch (error) {
//       console.error("Error creating dsale:", error);
//     }
//     setIsLoading(false);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column - Billing Information */}
//         <div className="lg:col-span-2 space-y-8">
//           {/* Billing Information */}
//           <div>
//             <h2 className="text-xl font-medium mb-6">Billing Information</h2>

//             {/* User Name */}
//             <div className="mb-4">
//               <Label htmlFor="firstName">User name</Label>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 ">
//                 <Input 
//                   id="firstName" 
//                   placeholder="First name" 
//                   className='rounded-none' 
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                 />
//                 <Input 
//                   id="lastName" 
//                   placeholder="Last name" 
//                   className='rounded-none' 
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Company Name */}
//             <div className="mb-4">
//               <Label htmlFor="companyName">
//                 Company Name <span className="text-gray-400 text-sm">(Optional)</span>
//               </Label>
//               <Input 
//                 id="companyName" 
//                 className="mt-2 rounded-none" 
//                 value={companyName}
//                 onChange={(e) => setCompanyName(e.target.value)}
//               />
//             </div>

//             {/* Address */}
//             <div className="mb-4">
//               <Label htmlFor="address">Address</Label>
//               <Input 
//                 id="address" 
//                 className="mt-2 rounded-none" 
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//               />
//             </div>

//             {/* Location Fields */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
//               <div>
//                 <Label htmlFor="country">Country</Label>
//                 <Select value={country} onValueChange={setCountry}>
//                   <SelectTrigger className="mt-2 rounded-none">
//                     <SelectValue placeholder="Select..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {countryList.map((country) => (
//                       <SelectItem key={country.id} value={country.id}>
//                         {country.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="region">Region/State</Label>
//                 <Select value={region} onValueChange={setRegion}>
//                   <SelectTrigger className="mt-2 rounded-none">
//                     <SelectValue placeholder="Select..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {country && stateList?.map((state) => (
//                       <SelectItem key={state.id} value={state.id}>
//                         {state.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="city">City</Label>
//                 <Select value={city} onValueChange={setCity}>
//                   <SelectTrigger className="mt-2 rounded-none">
//                     <SelectValue placeholder="Select..." />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {region && cityList?.map((city) => (
//                       <SelectItem key={city.id} value={city.id}>
//                         {city.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="zipCode">Zip Code</Label>
//                 <Input 
//                   id="zipCode" 
//                   className="mt-2 rounded-none" 
//                   value={zipCode}
//                   onChange={(e) => setZipCode(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Contact Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <Label htmlFor="email">Email</Label>
//                 <Input 
//                   id="email" 
//                   type="email" 
//                   className="mt-2 rounded-none" 
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="phone">Phone Number</Label>
//                 <Input 
//                   id="phone" 
//                   type="tel" 
//                   className="mt-2 rounded-none" 
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Shipping Address Checkbox */}
//             <div className="flex items-center space-x-2 mt-4">
//               <Checkbox id="differentAddress" />
//               <Label htmlFor="differentAddress" className="text-sm font-normal">
//                 Ship to different address
//               </Label>
//             </div>
//           </div>

//           {/* Payment Options */}
//           <div>
//             <h2 className="text-xl font-medium mb-6">Payment Option</h2>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//               <div
//                 className={`border rounded-none p-4 flex flex-col items-center justify-center cursor-pointer ${
//                   paymentMethod === "cash" ? "border-gray-400" : "border-gray-200"
//                 }`}
//                 onClick={() => setPaymentMethod("cash")}
//               >
//                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
//                   <span className="text-orange-500 text-xl">$</span>
//                 </div>
//                 <span className="text-sm">Cash on Delivery</span>
//                 <div className="mt-2">
//                   <div
//                     className={`w-4 h-4 rounded-full border ${
//                       paymentMethod === "cash" ? "border-orange-500" : "border-gray-300"
//                     } flex items-center justify-center`}
//                   >
//                     {paymentMethod === "cash" && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
//                   </div>
//                 </div>
//               </div>

//               <div
//                 className={`border rounded-none p-4 flex flex-col items-center justify-center cursor-pointer ${
//                   paymentMethod === "upi" ? "border-gray-400" : "border-gray-200"
//                 }`}
//                 onClick={() => setPaymentMethod("upi")}
//               >
//                 <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
//                   <span className="text-purple-500 text-sm font-bold">UPI</span>
//                 </div>
//                 <span className="text-sm">UPI</span>
//                 <div className="mt-2">
//                   <div
//                     className={`w-4 h-4 rounded-full border ${
//                       paymentMethod === "upi" ? "border-orange-500" : "border-gray-300"
//                     } flex items-center justify-center`}
//                   >
//                     {paymentMethod === "upi" && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
//                   </div>
//                 </div>
//               </div>

//               <div
//                 className={`border rounded-none p-4 flex flex-col items-center justify-center cursor-pointer ${
//                   paymentMethod === "netbanking" ? "border-gray-400" : "border-gray-200"
//                 }`}
//                 onClick={() => setPaymentMethod("netbanking")}
//               >
//                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
//                   <span className="text-blue-500 text-sm font-bold">NB</span>
//                 </div>
//                 <span className="text-sm">Net Banking</span>
//                 <div className="mt-2">
//                   <div
//                     className={`w-4 h-4 rounded-full border ${
//                       paymentMethod === "netbanking" ? "border-orange-500" : "border-gray-300"
//                     } flex items-center justify-center`}
//                   >
//                     {paymentMethod === "netbanking" && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
//                   </div>
//                 </div>
//               </div>

//               <div
//                 className={`border rounded-none p-4 flex flex-col items-center justify-center cursor-pointer ${
//                   paymentMethod === "card" ? "border-gray-400" : "border-gray-200"
//                 }`}
//                 onClick={() => setPaymentMethod("card")}
//               >
//                 <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
//                   <CreditCard className="h-5 w-5 text-orange-500" />
//                 </div>
//                 <span className="text-sm">Debit/Credit Card</span>
//                 <div className="mt-2">
//                   <div
//                     className={`w-4 h-4 rounded-full border ${
//                       paymentMethod === "card" ? "border-orange-500" : "border-gray-300"
//                     } flex items-center justify-center`}
//                   >
//                     {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Card Details (only shown if card payment is selected) */}
//             {paymentMethod === "card" && (
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="nameOnCard">Name on Card</Label>
//                   <Input id="nameOnCard" className="mt-2 rounded-none" />
//                 </div>

//                 <div>
//                   <Label htmlFor="cardNumber">Card Number</Label>
//                   <Input id="cardNumber" className="mt-2 rounded-none" />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="expiryDate">Expire Date</Label>
//                     <Input id="expiryDate" placeholder="MM/YY" className="mt-2 rounded-none" />
//                   </div>

//                   <div>
//                     <Label htmlFor="cvv">CVV</Label>
//                     <Input id="cvv" className="mt-2 rounded-none" />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Additional Information */}
//           <div>
//             <h2 className="text-xl font-medium mb-6">Additional Information</h2>

//             <div>
//               <Label htmlFor="orderNotes">
//                 Order Notes <span className="text-gray-400 text-sm">(Optional)</span>
//               </Label>
//               <Textarea
//                 id="orderNotes"
//                 placeholder="Notes about your order, e.g. special notes for delivery"
//                 className="mt-2 h-32 rounded-none"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Order Summary */}
//         <div className="lg:col-span-1">
//           <div className="border rounded-none p-6 mt-5">
//             <h2 className="text-xl font-medium mb-6">Card Totals</h2>

//             {/* Cart Items */}
//             <div className="space-y-4 mb-6">
//               {cartProducts && cartProducts.map((product: any, index: number) => (
//                 console.log("card totals payment",cartProducts),
//                 console.log("card totals",product),
//                 <div className="flex items-center" key={index}>
//                   <div className="w-12 h-12 bg-gray-100 rounded-none overflow-hidden relative mr-3">
//                     <Image
//                       src={(() => {
//                         if (product.images && Array.isArray(product.images)) {
//                           // Find thumbnail image
//                           const thumbnail = product.images.find((img: any) => img.is_thumbnail === true);
//                           // Return thumbnail if found, otherwise first image, or fallback
//                           return thumbnail ? thumbnail.url : 
//                                  product.images.length > 0 ? product.images[0].url : 
//                                  product.url || "/placeholder.svg?height=48&width=48";
//                         }
//                         return product.url || "/placeholder.svg?height=48&width=48";
//                       })()}
//                       alt={product.name || "Product"}
//                       width={48}
//                       height={48}
//                       className="object-cover"
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-sm">{product.name || "Product"}</p>
//                     <p className="text-xs text-gray-500">{product.localQuantity} x ₹{product.sale_price || 0}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Order Summary */}
//             <div className="border-t pt-4 space-y-2">
//               <div className="flex justify-between">
//                 <span className="text-sm">Sub-total</span>
//                 <span className="font-medium">₹{cartProducts.reduce((acc:any, product:any) => acc + Number(product.sale_price*product.localQuantity), 0)}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-sm">Shipping</span>
//                 <span className="text-green-600">Free</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-sm">Quantity</span>
//                 <span className="font-medium">{cartProducts.reduce((acc:any, product:any) => acc + Number(product.localQuantity), 0)}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-sm">Delivery Expected</span>
//                 <span className="font-medium">{deliveryExpected}</span>
//               </div>
//             </div>

//             {/* Total */}
//             <div className="border-t mt-4 pt-4">
//               <div className="flex justify-between mb-6">
//                 <span className="font-medium">Total</span>
//                 <span className="font-bold">₹{totalPrice} INR</span>
//               </div>

//               <Button 
//                 className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none lg:text-wrap"
//                 onClick={async() => {
//                   await new EcomService().check_customer_exists()
//                   handleProceedToPay()
//                 }}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     PROCEED TO PAY <ChevronRight className="ml-2 h-4 w-4" />
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderDetails;


import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import React, { useEffect, useState } from 'react';
import { Loader2, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { EcomService } from '@/services/api/ecom-service';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { makeApiCall } from '@/lib/apicaller';

const OrderDetails = ({size, localQuantity, deliveryExpected, totalPrice, imageUrl, cartProducts, delivery_address}:any) => {
  
  const [isLoading, setIsLoading] = useState(false);
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false);
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const router = useRouter();
  const [selectedShippingAddress, setSelectedShippingAddress] = useState('');

  // Shipping address states
  const [shippingCountry, setShippingCountry] = useState('');
  const [shippingRegion, setShippingRegion] = useState('');
  const [shippingCity, setShippingCity] = useState('');

  const [countryList, setCountryList] = useState<any[]>([])
  const [stateList, setStateList] = useState<any[]>([])
  const [cityList, setCityList] = useState<any[]>([])
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([])
  const [defaultAddress, setDefaultAddress] = useState<any>(null)
  
  // Form fields for billing information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Form fields for shipping information
  const [shippingFirstName, setShippingFirstName] = useState('');
  const [shippingLastName, setShippingLastName] = useState('');
  const [shippingCompanyName, setShippingCompanyName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingZipCode, setShippingZipCode] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');

  useEffect(() => {
    makeApiCall(async () => {
      const countryList = await new EcomService().get_country_list()
      const stateList = await new EcomService().get_state_list()
      const cityList = await new EcomService().get_city_list()
      const customerAddresses = await new EcomService().get_customer_addresses()
      console.log("customerAddresses", customerAddresses)
      setCountryList(countryList)
      setStateList(stateList)
      setCityList(cityList)
      setCustomerAddresses(customerAddresses)
      
      
      // Find default address or use the first one
      const defaultAddr = customerAddresses.find((addr: any) => addr.is_default === true) || 
                         (customerAddresses.length > 0 ? customerAddresses[0] : null);
      console.log("defaultAddr", defaultAddr)
                         
      if (defaultAddr) {
        console.log("defaultAddrsetset", defaultAddr)
        setDefaultAddress(defaultAddr);
        
        // Set form values based on the address
        if (defaultAddr.name) {
          const nameParts = defaultAddr.name.split(' ');
          console.log("nameParts", nameParts)
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        }

        setFirstName(defaultAddr.first_name || '');

        setLastName(defaultAddr.last_name || '');

        setCompanyName(defaultAddr.company_name || '');

        setAddress(defaultAddr.address || '');

        setCountry(defaultAddr.country || '');

        setRegion(defaultAddr.state || '');

        setCity(defaultAddr.city || '');

        setZipCode(defaultAddr.zipcode || '');

        setEmail(defaultAddr.email || '');

        setPhone(defaultAddr.phone || '');
      }
    }, {
      afterSuccess: () => {
        console.log("countryList", countryList)
        console.log("stateList", stateList)
        console.log("cityList", cityList)
        console.log("customerAddresses", customerAddresses)
        console.log("defaultAddress", defaultAddress)
      }
    })
  }, [])


  // For testing: create dsale on proceed to pay
  const handleProceedToPay = async () => {
    setIsLoading(true);
    try {
      // Just for testing: create dsale
      await new EcomService().create_order({cartProducts});
      // You can add a redirect or notification here if needed
      router.push('/profile/orders');
    } catch (error) {
      console.error("Error creating dsale:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Billing Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* Billing Information */}
          <div>
            <h2 className="text-xl font-medium mb-6">Billing Information</h2>

            {/* User Name */}
            <div className="mb-4">
              <Label htmlFor="firstName">User name</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 ">
                <Input 
                  id="firstName" 
                  placeholder="First name" 
                  className='rounded-none' 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input 
                  id="lastName" 
                  placeholder="Last name" 
                  className='rounded-none' 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="mb-4">
              <Label htmlFor="companyName">
                Company Name <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input 
                id="companyName" 
                className="mt-2 rounded-none" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            {/* Address */}
            <div className="mb-4">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                className="mt-2 rounded-none" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="mt-2 rounded-none">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region">Region/State</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="mt-2 rounded-none">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {country && stateList?.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="mt-2 rounded-none">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {region && cityList?.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input 
                  id="zipCode" 
                  className="mt-2 rounded-none" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  className="mt-2 rounded-none" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  className="mt-2 rounded-none" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Shipping Address Checkbox */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="differentAddress" 
                checked={shipToDifferentAddress}
                onCheckedChange={(checked) => setShipToDifferentAddress(checked === true)}
              />
              <Label htmlFor="differentAddress" className="text-sm font-normal">
                Ship to different address
              </Label>
            </div>
          </div>

          {/* Shipping Address (only shown when checkbox is checked) */}
          {shipToDifferentAddress && (
            <div>
              <h2 className="text-xl font-medium mb-6">Shipping Information</h2>
              
              {/* Saved Addresses Dropdown */}
              <div className="mb-6">
                <Label htmlFor="savedAddresses">Saved Addresses</Label>
                <Select 
                  value={selectedShippingAddress}
                  onValueChange={(value) => {
                    setSelectedShippingAddress(value);
                    console.log("selectedShippingAddress", selectedShippingAddress)
                    console.log("customerAddresses", customerAddresses)
                    console.log("value", value)
                    // Find the selected address from customerAddresses
                    const selectedAddress = customerAddresses.find((addr) => addr.customer_addresses_id === value);
                    if (selectedAddress) {
                      // Set shipping form values based on the selected address
                      if (selectedAddress.name) {
                        const nameParts = selectedAddress.name.split(' ');
                        setShippingFirstName(nameParts[0] || '');
                        setShippingLastName(nameParts.slice(1).join(' ') || '');
                      }
                      setShippingFirstName(selectedAddress.first_name || '');
                      setShippingLastName(selectedAddress.last_name || '');
                      setShippingCompanyName(selectedAddress.company_name || '');
                      setShippingAddress(selectedAddress.address || '');
                      setShippingCountry(selectedAddress.country || '');
                      setShippingRegion(selectedAddress.state || '');
                      setShippingCity(selectedAddress.city || '');
                      setShippingZipCode(selectedAddress.zipcode || '');
                      setShippingEmail(selectedAddress.email || '');
                      setShippingPhone(selectedAddress.phone || '');
                    }
                  }}
                >
                  <SelectTrigger className="mt-2 rounded-none text-gray-500">
                    <SelectValue placeholder="Select a saved address" />
                  </SelectTrigger>
                  
                  <SelectContent>
                    
                    {customerAddresses && customerAddresses.map((address) => (
                      <SelectItem key={address.customer_addresses_id} value={address.customer_addresses_id}>
                        {address.city || ''}{address.city && address.address ? ' - ' : ''}{address.address || ''}

                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Name */}
              <div className="mb-4">
                <Label htmlFor="shippingFirstName">User name</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 ">
                  <Input 
                    id="shippingFirstName" 
                    placeholder="First name" 
                    className='rounded-none' 
                    value={shippingFirstName}
                    onChange={(e) => setShippingFirstName(e.target.value)}
                  />
                  <Input 
                    id="shippingLastName" 
                    placeholder="Last name" 
                    className='rounded-none' 
                    value={shippingLastName}
                    onChange={(e) => setShippingLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="mb-4">
                <Label htmlFor="shippingCompanyName">
                  Company Name <span className="text-gray-400 text-sm">(Optional)</span>
                </Label>
                <Input 
                  id="shippingCompanyName" 
                  className="mt-2 rounded-none" 
                  value={shippingCompanyName}
                  onChange={(e) => setShippingCompanyName(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="mb-4">
                <Label htmlFor="shippingAddress">Address</Label>
                <Input 
                  id="shippingAddress" 
                  className="mt-2 rounded-none" 
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="shippingCountry">Country</Label>
                  <Select value={shippingCountry} onValueChange={setShippingCountry}>
                    <SelectTrigger className="mt-2 rounded-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countryList.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shippingRegion">Region/State</Label>
                  <Select value={shippingRegion} onValueChange={setShippingRegion}>
                    <SelectTrigger className="mt-2 rounded-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingCountry && stateList?.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shippingCity">City</Label>
                  <Select value={shippingCity} onValueChange={setShippingCity}>
                    <SelectTrigger className="mt-2 rounded-none">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingRegion && cityList?.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shippingZipCode">Zip Code</Label>
                  <Input 
                    id="shippingZipCode" 
                    className="mt-2 rounded-none" 
                    value={shippingZipCode}
                    onChange={(e) => setShippingZipCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="shippingEmail">Email</Label>
                  <Input 
                    id="shippingEmail" 
                    type="email" 
                    className="mt-2 rounded-none" 
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="shippingPhone">Phone Number</Label>
                  <Input 
                    id="shippingPhone" 
                    type="tel" 
                    className="mt-2 rounded-none" 
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div>
            <h2 className="text-xl font-medium mb-6">Additional Information</h2>

            <div>
              <Label htmlFor="orderNotes">
                Order Notes <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Textarea
                id="orderNotes"
                placeholder="Notes about your order, e.g. special notes for delivery"
                className="mt-2 h-32 rounded-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-none p-6 mt-5">
            <h2 className="text-xl font-medium mb-6">Card Totals</h2>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartProducts && cartProducts.map((product: any, index: number) => (
                console.log("card totals payment",cartProducts),
                console.log("card totals",product),
                <div className="flex items-center" key={index}>
                  <div className="w-12 h-12 bg-gray-100 rounded-none overflow-hidden relative mr-3">
                    <Image
                      src={(() => {
                        if (product.images && Array.isArray(product.images)) {
                          // Find thumbnail image
                          const thumbnail = product.images.find((img: any) => img.is_thumbnail === true);
                          // Return thumbnail if found, otherwise first image, or fallback
                          return thumbnail ? thumbnail.url : 
                                 product.images.length > 0 ? product.images[0].url : 
                                 product.url || "/placeholder.svg?height=48&width=48";
                        }
                        return product.url || "/placeholder.svg?height=48&width=48";
                      })()}
                      alt={product.name || "Product"}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{product.name || "Product"}</p>
                    <p className="text-xs text-gray-500">{product.localQuantity} x ₹{product.sale_price || 0}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Sub-total</span>
                <span className="font-medium">₹{cartProducts.reduce((acc:any, product:any) => acc + Number(product.sale_price*product.localQuantity), 0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Quantity</span>
                <span className="font-medium">{cartProducts.reduce((acc:any, product:any) => acc + Number(product.localQuantity), 0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Delivery Expected</span>
                <span className="font-medium">{deliveryExpected}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between mb-6">
                <span className="font-medium">Total</span>
                <span className="font-bold">₹{totalPrice} INR</span>
              </div>

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none lg:text-wrap"
                onClick={async() => {
                  await new EcomService().check_customer_exists()
                  handleProceedToPay()
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    PROCEED TO PAY <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;