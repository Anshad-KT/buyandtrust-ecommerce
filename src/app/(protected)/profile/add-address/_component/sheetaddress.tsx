// "use client"

// import { useState, useEffect } from "react"
// import { ArrowRight } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { EcomService } from "@/services/api/ecom-service"

// interface Address {
//   id: string
//   name: string
//   address: string
//   phone: string
//   email: string
//   firstName?: string
//   lastName?: string
//   company?: string
//   country?: string
//   region?: string
//   city?: string
//   zipCode?: string
//   is_default?: boolean // Added for completeness, but not used in this form
// }

// interface SheetAddressProps {
//   mode: "add" | "edit"
//   address?: Address | null
//   onSave: (data: Partial<Address>) => void
//   trigger?: React.ReactNode
// }

// const ecomService = new EcomService()

// /**
//  * NOTE:
//  * No changes are needed here for the is_default field.
//  * The default address selection should be handled on the address list/page,
//  * not in the add/edit address form. This form is for address details only.
//  * If you want to allow setting an address as default during add/edit,
//  * you could add a checkbox here and include is_default in the payload.
//  * But as per your description, selection is on the address page, so no change is required.
//  */
// export function SheetAddress({ mode = "add", address = null, onSave, trigger }: SheetAddressProps) {
//   const [formData, setFormData] = useState<Partial<Address>>({
//     firstName: "",
//     lastName: "",
//     company: "",
//     address: "",
//     country: "",
//     region: "",
//     city: "",
//     zipCode: "",
//     phone: "",
//     email: "",
//   })
  
//   const [open, setOpen] = useState(false)
  
//   const isEditMode = mode === "edit"
  
//   // Update form data when address prop changes
//   useEffect(() => {
//     if (address) {
//       setFormData({
//         firstName: address.firstName || "",
//         lastName: address.lastName || "",
//         company: address.company || "",
//         address: address.address || "",
//         country: address.country || "",
//         region: address.region || "",
//         city: address.city || "",
//         zipCode: address.zipCode || "",
//         phone: address.phone || "",
//         email: address.email || "",
//       })
//     } else {
//       setFormData({
//         firstName: "",
//         lastName: "",
//         company: "",
//         address: "",
//         country: "",
//         region: "",
//         city: "",
//         zipCode: "",
//         phone: "",
//         email: "",
//       })
//     }
//   }, [address])
  
//   // Add backdrop blur effect when dialog is open
//   useEffect(() => {
//     if (open) {
//       document.body.classList.add('modal-open')
//       document.body.style.overflow = 'hidden'
//     } else {
//       document.body.classList.remove('modal-open')
//       document.body.style.overflow = ''
//     }
//     return () => {
//       document.body.classList.remove('modal-open')
//       document.body.style.overflow = ''
//     }
//   }, [open])
  
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target
//     setFormData(prev => ({ ...prev, [id]: value }))
//   }
  
//   const handleSelectChange = (field: string, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }))
//   }
  
//   const handleSubmit = async () => {
//     if (isEditMode) {
//       onSave(formData)
//       setOpen(false)
//       return
//     }
//     // For add mode, use add_customer_address
//     try {
//       // Map formData to the expected keys for add_customer_address
//       const addressPayload = {
//         first_name: formData.firstName || "",
//         last_name: formData.lastName || "",
//         company_name: formData.company || "",
//         address: formData.address || "",
//         country: formData.country || "",
//         state: formData.region || "",
//         city: formData.city || "",
//         zipcode: formData.zipCode || "",
//         email: formData.email || "",
//         phone: formData.phone || "",
//         // is_default is NOT included here, as default selection is handled elsewhere
//       }
//       await ecomService.add_customer_address(addressPayload)
//       onSave(formData)
//       setOpen(false)
//     } catch (error) {
//       setOpen(false)
//     }
//   }
  
//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         {trigger ? trigger : (
//           isEditMode ? (
//             <Button
//               variant="outline"
//               className="text-[#2DA5F3] border-[#D5EDFD] border-2 hover:bg-blue-50 hover:text-blue-600 rounded-none font-semibold"
//             >
//               EDIT ADDRESS
//             </Button>
//           ) : (
//             <Button
//               variant="ghost"
//               className="font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center rounded-none"
//             >
//               Add Address <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           )
//         )}
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden z-[1000] max-h-[90vh] md:max-h-[85vh]">
//         <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white z-10">
//           <DialogTitle className="text-lg">{isEditMode ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}</DialogTitle>
//         </DialogHeader>
//         <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)] md:max-h-[calc(85vh-140px)]">
//           {/* First row - First Name and Last Name */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//             <div className="flex flex-col gap-2 ">
//               <Label htmlFor="firstName">First Name</Label>
//               <Input 
//                 id="firstName"
//                 value={formData.firstName} 
//                 onChange={handleChange}
//                 placeholder="Enter first name"
//                 className="rounded-none"
//               />
//             </div>
//             <div className="flex flex-col gap-2">
//               <Label htmlFor="lastName">Last Name</Label>
//               <Input 
//                 id="lastName" 
//                 value={formData.lastName} 
//                 onChange={handleChange}
//                 placeholder="Enter last name"
//                 className="rounded-none"
//               />
//             </div>
//           </div>
          
//           {/* Company Name */}
//           <div className="mb-4">
//             <Label htmlFor="company">Company Name (Optional)</Label>
//             <Input 
//               id="company" 
//               value={formData.company} 
//               onChange={handleChange}
//               placeholder="Enter company name"
//               className="mt-2 rounded-none"
//             />
//           </div>
          
//           {/* Address */}
//           <div className="mb-4">
//             <Label htmlFor="address">Address</Label>
//             <Input 
//               id="address" 
//               value={formData.address} 
//               onChange={handleChange}
//               placeholder="Road No, House no, Flat no"
//               className="mt-2 rounded-none"
//             />
//           </div>
          
//           {/* Country */}
//           <div className="mb-4">
//             <Label htmlFor="country">Country</Label>
//             <Select 
//               value={formData.country} 
//               onValueChange={(value) => handleSelectChange("country", value)}
//             >
//               <SelectTrigger className="mt-2 rounded-none">
//                 <SelectValue placeholder="Select country" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="bangladesh">Bangladesh</SelectItem>
//                 <SelectItem value="india">India</SelectItem>
//                 <SelectItem value="pakistan">Pakistan</SelectItem>
//                 <SelectItem value="usa">United States</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
          
//           {/* Region/State */}
//           <div className="mb-4">
//             <Label htmlFor="region">Region/State</Label>
//             <Select 
//               value={formData.region} 
//               onValueChange={(value) => handleSelectChange("region", value)}
//             >
//               <SelectTrigger className="mt-2 rounded-none">
//                 <SelectValue placeholder="Select..." />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="dhaka">Dhaka</SelectItem>
//                 <SelectItem value="chittagong">Chittagong</SelectItem>
//                 <SelectItem value="rajshahi">Rajshahi</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
          
//           {/* City and Zip Code */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//             <div className="flex flex-col gap-2">
//               <Label htmlFor="city">City</Label>
//               <Select 
//                 value={formData.city} 
//                 onValueChange={(value) => handleSelectChange("city", value)}
//               >
//                 <SelectTrigger className="mt-2 rounded-none">
//                   <SelectValue placeholder="Select city" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="dhaka">Dhaka</SelectItem>
//                   <SelectItem value="chittagong">Chittagong</SelectItem>
//                   <SelectItem value="rajshahi">Rajshahi</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className="flex flex-col gap-2">
//               <Label htmlFor="zipCode">Zip Code</Label>
//               <Input 
//                 id="zipCode" 
//                 value={formData.zipCode} 
//                 onChange={handleChange}
//                 placeholder="Enter zip code"
//                 className="mt-2 rounded-none"
//               />
//             </div>
//           </div>
          
//           {/* Email */}
//           <div className="mb-4">
//             <Label htmlFor="email">Email</Label>
//             <Input 
//               id="email" 
//               value={formData.email} 
//               onChange={handleChange}
//               placeholder="Enter email address"
//               className="mt-2 rounded-none"
//             />
//           </div>
          
//           {/* Phone Number */}
//           <div className="mb-4">
//             <Label htmlFor="phone">Phone Number</Label>
//             <Input 
//               id="phone" 
//               value={formData.phone} 
//               onChange={handleChange}
//               placeholder="+1-000-000-0000"
//               className="mt-2 rounded-none"
//             />
//           </div>
//         </div>
//         <DialogFooter className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white z-10">
//           <Button 
//             type="submit" 
//             onClick={handleSubmit}
//             className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none"
//           >
//             SAVE
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }


"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EcomService } from "@/services/api/ecom-service"

interface Address {
  id: string
  name: string
  address: string
  phone: string
  email: string
  firstName?: string
  lastName?: string
  company?: string
  country?: string
  region?: string
  city?: string
  zipCode?: string
  is_default?: boolean // Added for completeness, but not used in this form
}

// Updated types to match your database structure
type Country = { 
  id: number; 
  name: string; 
  code?: string;
};

type State = { 
  id: string; 
  name: string; 
  code?: string; 
  country_id: string;
};

interface SheetAddressProps {
  mode: "add" | "edit"
  address?: Address | null
  onSave: (data: Partial<Address>) => void
  trigger?: React.ReactNode
}

const ecomService = new EcomService()

export function SheetAddress({ mode = "add", address = null, onSave, trigger }: SheetAddressProps) {
  const [formData, setFormData] = useState<Partial<Address>>({
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    country: "",
    region: "",
    city: "",
    zipCode: "",
    phone: "",
    email: "",
  })
  
  // Add state for countries and states
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState({
    countries: false,
    states: false
  })
  
  const [open, setOpen] = useState(false)
  
  const isEditMode = mode === "edit"
  
  // Update form data when address prop changes
  useEffect(() => {
    if (address) {
      setFormData({
        firstName: address.firstName || "",
        lastName: address.lastName || "",
        company: address.company || "",
        address: address.address || "",
        country: address.country || "",
        region: address.region || "",
        city: address.city || "",
        zipCode: address.zipCode || "",
        phone: address.phone || "",
        email: address.email || "",
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        address: "",
        country: "",
        region: "",
        city: "",
        zipCode: "",
        phone: "",
        email: "",
      })
    }
  }, [address])
  
  // Add effect to fetch countries and states
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading({ countries: true, states: true });
        
        // Fetch countries
        const countryData = await ecomService.get_country_list();
        setCountries(countryData);
        setLoading(prev => ({ ...prev, countries: false }));
        
        // Fetch states
        const stateData = await ecomService.get_state_list();
        setStates(stateData);
        setLoading(prev => ({ ...prev, states: false }));
      } catch (error) {
        setLoading({ countries: false, states: false });
      }
    }
    
    fetchData();
  }, []);
  
  // Get filtered states based on selected country
  const filteredStates = useMemo(() => {
    if (!formData.country) return [];
    // Fix: compare as string, but also allow for number id in country_id
    const countryId = formData.country;
    return states.filter(state => state.country_id.toString() === countryId.toString());
  }, [formData.country, states]);
  
  // Add backdrop blur effect when dialog is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('modal-open')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
    }
    return () => {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = ''
    }
  }, [open])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Reset region when country changes
    if (field === "country") {
      setFormData(prev => ({ ...prev, region: "" }))
    }
  }
  
  const handleSubmit = async () => {
    if (isEditMode) {
      onSave(formData)
      setOpen(false)
      return
    }
    // For add mode, use add_customer_address
    try {
      // Map formData to the expected keys for add_customer_address
      const addressPayload = {
        first_name: formData.firstName || "",
        last_name: formData.lastName || "",
        company_name: formData.company || "",
        address: formData.address || "",
        country: formData.country || "",
        state: formData.region || "",
        city: formData.city || "",
        zipcode: formData.zipCode || "",
        email: formData.email || "",
        phone: formData.phone || "",
        // is_default is NOT included here, as default selection is handled elsewhere
      }
      await ecomService.add_customer_address(addressPayload)
      onSave(formData)
      setOpen(false)
    } catch (error) {
      setOpen(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          isEditMode ? (
            <Button
              variant="outline"
              className="text-[#2DA5F3] border-[#D5EDFD] border-2 hover:bg-blue-50 hover:text-blue-600 rounded-none font-semibold"
            >
              EDIT ADDRESS
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="font-semibold text-orange-500 hover:text-orange-600 hover:bg-orange-50 flex items-center rounded-none"
            >
              Add Address <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] md:max-h-[85vh]">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white">
          <DialogTitle className="text-lg">{isEditMode ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)] md:max-h-[calc(85vh-140px)]">
          {/* First row - First Name and Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2 ">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName"
                value={formData.firstName} 
                onChange={handleChange}
                placeholder="Enter first name"
                className="rounded-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={formData.lastName} 
                onChange={handleChange}
                placeholder="Enter last name"
                className="rounded-none"
              />
            </div>
          </div>
          
          {/* Company Name */}
          <div className="mb-4">
            <Label htmlFor="company">Company Name (Optional)</Label>
            <Input 
              id="company" 
              value={formData.company} 
              onChange={handleChange}
              placeholder="Enter company name"
              className="mt-2 rounded-none"
            />
          </div>
          
          {/* Address */}
          <div className="mb-4">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              value={formData.address} 
              onChange={handleChange}
              placeholder="Road No, House no, Flat no"
              className="mt-2 rounded-none"
            />
          </div>
          
          {/* Country */}
          <div className="mb-4">
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleSelectChange("country", e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading.countries}
            >
              <option value="">
                {loading.countries ? "Loading countries..." : "Select country"}
              </option>
              {countries.map((country) => (
                <option key={country.id} value={country.id.toString()}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Region/State */}
          <div className="mb-4">
            <Label htmlFor="region">Region/State</Label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => handleSelectChange("region", e.target.value)}
              disabled={!formData.country || loading.states}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">
                {loading.states 
                  ? "Loading states..." 
                  : formData.country 
                    ? "Select..." 
                    : "Select country first"}
              </option>
              {filteredStates.length > 0 ? (
                filteredStates.map((state) => (
                  <option key={state.id} value={state.id.toString()}>
                    {state.name}
                  </option>
                ))
              ) : (
                formData.country && !loading.states ? 
                <option value="" disabled>No states available for this country</option> : null
              )}
            </select>
          </div>
          
          {/* City and Zip Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={formData.city} 
                onChange={handleChange}
                placeholder="Enter city"
                className="mt-2 rounded-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input 
                id="zipCode" 
                value={formData.zipCode} 
                onChange={handleChange}
                placeholder="Enter zip code"
                className="mt-2 rounded-none"
              />
            </div>
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="Enter email address"
              className="mt-2 rounded-none"
            />
          </div>
          
          {/* Phone Number */}
          <div className="mb-4">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={handleChange}
              placeholder="+1-000-000-0000"
              className="mt-2 rounded-none"
            />
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none"
          >
            SAVE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}