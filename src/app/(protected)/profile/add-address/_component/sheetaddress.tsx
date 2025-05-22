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
import { ToastVariant, toastWithTimeout } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"

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
}

const ecomService = new EcomService()

export function SheetAddress({ mode = "add", address = null, onSave, trigger }: SheetAddressProps) {
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
  console.log("formData", formData);
  
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState({
    countries: false,
    states: false
  })
  
  const [open, setOpen] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  
  const isEditMode = mode === "edit"
  
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
      console.log("setformData", formData);
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
      console.log("setformData2", formData);
    }
    setPhoneError(null)
    setFormError(null)
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

  // Only allow numbers and "+" for phone input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    if (id === "phone") {
      // Allow only digits, spaces, dashes, parentheses, and leading +
      let filtered = value.replace(/[^0-9+]/g, "")
      // Only allow one leading +
      if (filtered.startsWith("++")) filtered = "+" + filtered.replace(/^\++/, "")
      if (filtered.indexOf("+") > 0) filtered = filtered.replace(/\+/g, "")
      setFormData(prev => ({ ...prev, [id]: filtered }))
      setPhoneError(null)
    } else {
      setFormData(prev => ({ ...prev, [id]: value }))
    }
  }

  // When selecting country or region, store the name, not the id
  const handleSelectChange = (field: string, value: string) => {
    if (field === "country") {
      // Find the country name by id
      const selectedCountry = countries.find(c => c.id.toString() === value)
      setFormData(prev => ({
        ...prev,
        country: selectedCountry ? selectedCountry.name : "",
        region: "" // Reset region when country changes
      }))
    } else if (field === "region") {
      // Find the state name by id
      const selectedState = states.find(s => s.id.toString() === value)
      setFormData(prev => ({
        ...prev,
        region: selectedState ? selectedState.name : ""
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Validate phone number before submit
  const validatePhone = (phone: string | undefined) => {
    if (!phone) return false
    // Allow only numbers and optional leading +
    // Must start with optional +, then at least 7 digits
    return /^(\+)?[0-9]{7,}$/.test(phone)
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
    for (const field of requiredFields) {
      if (!formData[field.key as keyof typeof formData] || (typeof formData[field.key as keyof typeof formData] === "string" && (formData[field.key as keyof typeof formData] as string).trim() === "")) {
        setFormError(`${field.label} is required.`);
        return false;
      }
    }
    setFormError(null);
    return true;
  }

  const handleSubmit = async () => {
    // Validate all required fields except company
    if (!validateRequiredFields()) {
      return;
    }
    // Validate phone before submit
    if (!validatePhone(formData.phone)) {
      setPhoneError("Please enter a valid phone number (numbers only, optional leading +, at least 7 digits).")
      return
    }
    if (isEditMode) {
      console.log("formData", formData);
      onSave(formData)
      setOpen(false)
      toastWithTimeout(ToastVariant.Default, "Address updated successfully")
      return
    }
    // For add mode, use add_customer_address
    try {
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
        phone: formData.phone || "",
        // is_default is NOT included here, as default selection is handled elsewhere
      }
      console.log("addressPayload", addressPayload);
      await ecomService.add_customer_address(addressPayload)
      onSave(formData)
      console.log("formData", formData);
      setOpen(false)
      toastWithTimeout(ToastVariant.Default, "Address added successfully")
    } catch (error) {
      setOpen(false)
      toastWithTimeout(ToastVariant.Error, "Failed to add address")
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
          {/* Show form error if any */}
          {formError && (
            <div className="text-red-500 text-sm mb-4">{formError}</div>
          )}
      
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
          </div>
          
          {/* Region/State */}
          <div className="mb-4">
            <Label htmlFor="region">Region/State<span className="text-red-500">*</span></Label>
            <select
              id="region"
              value={selectedStateId}
              onChange={(e) => handleSelectChange("region", e.target.value)}
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zipcode">Zip Code<span className="text-red-500">*</span></Label>
              <Input 
                id="zipcode" 
                value={formData.zipcode} 
                onChange={handleChange}
                placeholder="Enter zip code"
                className="mt-2 rounded-none"
                required
              />
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
            />
          </div>
          
          {/* Phone Number */}
          <div className="mb-4">
            <Label htmlFor="phone">Phone Number<span className="text-red-500">*</span></Label>
            <Input 
              id="phone" 
              value={formData.phone} 
              onChange={handleChange}
              placeholder="+1-000-000-0000"
              className="mt-2 rounded-none"
              inputMode="tel"
              pattern="^(\+)?[0-9]*$"
              maxLength={20}
              required
            />
            {phoneError && (
              <div className="text-red-500 text-xs mt-1">{phoneError}</div>
            )}
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