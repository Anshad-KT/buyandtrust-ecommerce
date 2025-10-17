"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowRight } from "lucide-react"
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
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
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

interface Address {
  id: string
  name: string
  address: string
  phone: string
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  country?: string // country name
  state?: string  // state/region name
  city?: string
  zipcode?: string
  is_default?: boolean // Added for completeness, but not used in this form
}

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
  autoOpen?: boolean
  fromPage?: string | null
}

const ecomService = new EcomService()

export function SheetAddress({ mode = "add", address = null, onSave, trigger, autoOpen = false, fromPage = null }: SheetAddressProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Partial<Address>>({
    first_name: "",
    last_name: "",
    company_name: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
    phone: "",
    email: "",
  })
  // console.log("formData", formData);
  
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState({
    countries: false,
    states: false
  })
  
  const [open, setOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const isEditMode = mode === "edit"
  
  // Auto-open dialog if autoOpen prop is true
  useEffect(() => {
    if (autoOpen) {
      setOpen(true)
    }
  }, [autoOpen])
  
  useEffect(() => {
    if (address) {
      setFormData({
        first_name: address.first_name || "",
        last_name: address.last_name || "",
        company_name: address.company_name || "",
        address: address.address || "",
        country: address.country || "",
        state: address.state || "",
        city: address.city || "",
        zipcode: address.zipcode || "",
        phone: address.phone || "",
        email: address.email || "",
      })
      // console.log("setformData", formData);
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        company_name: "",
        address: "",
        country: "",
        state: "",
        city: "",
        zipcode: "",
        phone: "",
        email: "",
      })
      // console.log("setformData2", formData);
    }
    setFieldErrors({})
  }, [address])

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading({ countries: true, states: true });
        const countryData = await ecomService.get_country_list();
        setCountries(countryData);
        setLoading(prev => ({ ...prev, countries: false }));
        const stateData = await ecomService.get_state_list();
        setStates(stateData);
        setLoading(prev => ({ ...prev, states: false }));
      } catch (error) {
        setLoading({ countries: false, states: false });
      }
    }
    fetchData();
  }, []);

  const filteredStates = useMemo(() => {
    if (!formData.country) return [];
    const selectedCountry = countries.find(
      c => c.id.toString() === formData.country || c.name === formData.country
    );
    if (!selectedCountry) return [];
    return states.filter(state => state.country_id.toString() === selectedCountry.id.toString());
  }, [formData.country, states, countries]);

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

  // Handle phone number change from PhoneInput
  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({ ...prev, phone: value || "" }))
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.phone;
      return newErrors;
    })
  }

  // Only allow numbers for zipcode, and lowercase for email
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    
    // Clear field error when user types
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    })
    
    if (id === "zipcode") {
      // Only allow numbers for zip code
      let filtered = value.replace(/[^0-9]/g, "")
      setFormData(prev => ({ ...prev, [id]: filtered }))
    } else if (id === "email") {
      // Convert to lowercase as user types
      setFormData(prev => ({ ...prev, [id]: value.toLowerCase() }))
    } else {
      setFormData(prev => ({ ...prev, [id]: value }))
    }
  }

  // When selecting country or region, store the name, not the id
  const handleSelectChange = (field: string, value: string) => {
    // Clear field error when user selects
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    })
    
    if (field === "country") {
      // Find the country name by id
      const selectedCountry = countries.find(c => c.id.toString() === value)
      setFormData(prev => ({
        ...prev,
        country: selectedCountry ? selectedCountry.name : "",
        state: "" // Reset region when country changes
      }))
    } else if (field === "state") {
      // Find the state name by id
      const selectedState = states.find(s => s.id.toString() === value)
      setFormData(prev => ({
        ...prev,
        state: selectedState ? selectedState.name : ""
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Validate phone number before submit
  const validatePhone = (phone: string | undefined) => {
    if (!phone) return false
    // PhoneInput provides formatted phone numbers, so we just check if it exists and has reasonable length
    // Remove all non-digit characters except + to count digits
    const digitsOnly = phone.replace(/[^0-9]/g, "")
    return digitsOnly.length >= 7
  }

  // Validate zip code to only have numbers
  const validateZip = (zip: string | undefined) => {
    if (!zip) return false
    return /^[0-9]+$/.test(zip)
  }

  // Validate email format
  const validateEmail = (email: string | undefined) => {
    if (!email) return false
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Validate all required fields except company
  const validateRequiredFields = () => {
    const requiredFields = [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "address", label: "Address" },
      { key: "country", label: "Country" },
      { key: "state", label: "Region/State" },
      { key: "city", label: "City" },
      { key: "zipcode", label: "Zip Code" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone Number" }
    ];
    
    const errors: Record<string, string> = {};
    
    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData] || (typeof formData[field.key as keyof typeof formData] === "string" && (formData[field.key as keyof typeof formData] as string).trim() === "")) {
        errors[field.key] = `${field.label} is required.`;
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async () => {
    // Validate all required fields except company
    if (!validateRequiredFields()) {
      return;
    }
    
    // Additional validations for phone, zip, and email
    const errors: Record<string, string> = {};
    
    if (!validatePhone(formData.phone)) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }
    
    if (!validateZip(formData.zipcode)) {
      errors.zipcode = "Zip code must contain numbers only.";
    }
    
    if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(prev => ({ ...prev, ...errors }));
      return;
    }
    if (isEditMode) {
      // console.log("formData", formData);
      onSave(formData)
      setOpen(false)
      toastWithTimeout(ToastVariant.Default, "Address updated successfully")
      return
    }
    // For add mode, use add_customer_address
    try {
      // Format phone number: remove + and spaces, keep only digits
      const formattedPhone = formData.phone ? formData.phone.replace(/[^0-9]/g, '') : "";
      
      // Map formData to the expected keys for add_customer_address
      const addressPayload = {
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        company_name: formData.company_name || "",
        address: formData.address || "",
        country: formData.country || "", // country name
        state: formData.state || "",    // state/region name
        city: formData.city || "",
        zipcode: formData.zipcode || "",
        email: formData.email || "",
        phone: formattedPhone,
        // is_default is NOT included here, as default selection is handled elsewhere
      }
      console.log("addressPayload", addressPayload);
      await ecomService.add_customer_address(addressPayload)
      onSave(formData)
      // console.log("formData", formData);
      setOpen(false)
      toastWithTimeout(ToastVariant.Default, "Address added successfully")
      
      // Redirect to payment page only if user came from payment page
      if (fromPage === "payment") {
        router.push("/payment")
      }
    } catch (error) {
      setOpen(false)
      toastWithTimeout(ToastVariant.Default, "Failed to add address")
    }
  }

  // Find the selected country id (for select value) from the name in formData
  const selectedCountryId = useMemo(() => {
    if (!formData.country) return "";
    const found = countries.find(c => c.name === formData.country)
    return found ? found.id.toString() : ""
  }, [formData.country, countries])

  // Find the selected state id (for select value) from the name in formData
  const selectedStateId = useMemo(() => {
    if (!formData.state) return "";
    const found = states.find(s => s.name === formData.state)
    return found ? found.id.toString() : ""
  }, [formData.state, states])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          isEditMode ? (
            <Button
              variant="outline"
              className="text-[#2DA5F3] border-[#D5EDFD] border-2 hover:bg-blue-50 hover:text-blue-600 rounded-none"
              style={{
                fontWeight: "400",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
              }}
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
          <DialogTitle className="text-lg"
          style={{
            fontWeight: "400",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }}
          >{isEditMode ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)] md:max-h-[calc(85vh-140px)]"
        style={{
          fontWeight: "400",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
        }}
        >
          {/* First row - First Name and Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2 ">
              <Label htmlFor="first_name">First Name<span className="text-red-500">*</span></Label>
              <Input 
                id="first_name"
                value={formData.first_name} 
                onChange={handleChange}
                placeholder="Enter first name"
                className="rounded-none"
                required
              />
              {fieldErrors.first_name && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.first_name}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_name">Last Name<span className="text-red-500">*</span></Label>
              <Input 
                id="last_name" 
                value={formData.last_name} 
                onChange={handleChange}
                placeholder="Enter last name"
                className="rounded-none"
                required
              />
              {fieldErrors.last_name && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.last_name}</div>
              )}
            </div>
          </div>
          
          {/* Company Name */}
          <div className="mb-4">
            <Label htmlFor="company">Company Name (Optional)</Label>
            <Input 
              id="company_name" 
              value={formData.company_name} 
              onChange={handleChange}
              placeholder="Enter company name"
              className="mt-2 rounded-none"
            />
          </div>
          
          {/* Address */}
          <div className="mb-4">
            <Label htmlFor="address">Address<span className="text-red-500">*</span></Label>
            <Input 
              id="address" 
              value={formData.address} 
              onChange={handleChange}
              placeholder="Road No, House no, Flat no"
              className="mt-2 rounded-none"
              required
            />
            {fieldErrors.address && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.address}</div>
            )}
          </div>
          
          {/* Country */}
          <div className="mb-4">
            <Label htmlFor="country">Country<span className="text-red-500">*</span></Label>
            <select
              id="country"
              value={selectedCountryId}
              onChange={(e) => handleSelectChange("country", e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading.countries}
              required
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
            {fieldErrors.country && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.country}</div>
            )}
          </div>
          
          {/* Region/State */}
          <div className="mb-4">
            <Label htmlFor="state">Region/State<span className="text-red-500">*</span></Label>
            <select
              id="state"
              value={selectedStateId}
              onChange={(e) => handleSelectChange("state", e.target.value)}
              disabled={!selectedCountryId || loading.states}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">
                {loading.states 
                  ? "Loading states..." 
                  : selectedCountryId 
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
                selectedCountryId && !loading.states ? 
                <option value="" disabled>No states available for this country</option> : null
              )}
            </select>
            {fieldErrors.state && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.state}</div>
            )}
          </div>
          
          {/* City and Zip Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City<span className="text-red-500">*</span></Label>
              <Input 
                id="city" 
                value={formData.city} 
                onChange={handleChange}
                placeholder="Enter city"
                className="mt-2 rounded-none"
                required
              />
              {fieldErrors.city && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.city}</div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zipCode">Zip Code<span className="text-red-500">*</span></Label>
              <Input 
                id="zipcode" 
                value={formData.zipcode} 
                onChange={handleChange}
                placeholder="Enter zip code"
                className="mt-2 rounded-none"
                required
                inputMode="numeric"
                pattern="^[0-9]*$"
                maxLength={12}
              />
              {fieldErrors.zipcode && (
                <div className="text-red-500 text-xs mt-1">{fieldErrors.zipcode}</div>
              )}
            </div>
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
            <Input 
              id="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="Enter email address"
              className="mt-2 rounded-none"
              required
              type="email"
              autoComplete="email"
            />
            {fieldErrors.email && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>
            )}
          </div>
          
          {/* Phone Number */}
          <div className="mb-4">
            <Label htmlFor="phone">Phone Number<span className="text-red-500">*</span></Label>
            <PhoneInput
              international
              defaultCountry="IN"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              className="mt-2 rounded-none border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {fieldErrors.phone && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.phone}</div>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-none"
            style={{
              fontWeight: "400",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
            }}
          >
            SAVE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}