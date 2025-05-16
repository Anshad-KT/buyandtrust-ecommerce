// /profile/address/add-address


'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ToastVariant, toastWithTimeout } from '@/hooks/use-toast'
import { states } from '@/lib/utils'
// import { useLogin } from '@/app/LoginContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EcomService } from '@/services/api/ecom-service'
import { makeApiCall } from '@/lib/apicaller'
import { useLogin } from '@/app/LoginContext'
export default function AddressForm({ address }: { address?: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isLoggedIn } = useLogin()
  
  // Handle both new address creation and editing existing address
  const isEditMode = !!address

  const [formData, setFormData] = useState({
    fullAddress: address?.full_address || '',
    landmark: address?.landmark || '',
    city: address?.city || '',
    // state: address?.state || '',
    pinCode: address?.pin_code || '',
    displayName: '',
    username: '',
    fullName: '',
    email: '',
    secondaryEmail: '',
    phoneNumber: '',
    country: '',
    state: '',
    zipCode: ''
  })
  const [countryList, setCountryList] = useState<any[]>([])
  const [stateList, setStateList] = useState<any[]>([])
  const [cityList, setCityList] = useState<any[]>([])
  // Update form data if address prop changes (when editing)
  useEffect(() => {
    makeApiCall(async () => {
      const country_data = await new EcomService().get_country_list()
      const state_data = await new EcomService().get_state_list()
      const city_data = await new EcomService().get_city_list()
      console.log("country_data:", country_data)
      console.log("state_data:", state_data)
      console.log("city_data:", city_data)
      setCountryList(country_data)
      setStateList(state_data)
      setCityList(city_data)
    }, {
      afterSuccess: () => {
        console.log("countryList:", countryList)
        console.log("stateList:", stateList)
        console.log("cityList:", cityList)
      }
    })
    if (address) {
      setFormData({
        ...formData,
        fullAddress: address.full_address || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        pinCode: address.pin_code || ''
      })
    }
  }, [address])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Validate form data
    if(!formData.state || formData.state === '') {
      toastWithTimeout(ToastVariant.Default, 'Please select a state')
      setIsLoading(false)
      return
    }
    if(!formData.city || formData.city === '') {
      toastWithTimeout(ToastVariant.Default, 'Please enter city')
      setIsLoading(false)
      return
    }
    if(!formData.fullAddress || formData.fullAddress === '') {
      toastWithTimeout(ToastVariant.Default, 'Please enter full address')
      setIsLoading(false)
      return
    }
    if(!formData.pinCode || formData.pinCode === '' || formData.pinCode.length != 6) {
      toastWithTimeout(ToastVariant.Default, 'Please enter a valid 6-digit pin code')
      setIsLoading(false)
      return
    }
    
    // Validate pin code format (6 digits for Indian PIN codes)
    if(!/^\d{6}$/.test(formData.pinCode)) {
      toastWithTimeout(ToastVariant.Default, 'Please enter a valid 6-digit pin code')
      setIsLoading(false)
      return
    }
    
    try {
      // For now, just show success message without actual API call
      const successMessage = isEditMode ? 'Address updated successfully' : 'Address added successfully'
      toastWithTimeout(ToastVariant.Default, successMessage)
      setIsLoading(false)
      router.push('/profile/address')
    } catch (error) {
      toastWithTimeout(ToastVariant.Default, 'An Error Occurred')
      console.error(error)
      setIsLoading(false)
    }
  }

  return (
    <section className="w-full h-full">
    <div className="w-full h-full">
      <div className="bg-white rounded-none shadow-sm overflow-hidden">
        <div className="p-6 border mt-16 justify-between">
          <h2 className="text-lg font-medium text-gray-800 mb-6 border-b pb-4">ACCOUNT SETTING</h2>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row">
              {/* Profile Picture */}
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-blue-500">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="" alt="Profile Picture" />
                    
                    <AvatarFallback>
                      {isLoggedIn && typeof isLoggedIn === 'object' && isLoggedIn.email
                        ? isLoggedIn.email.charAt(0).toUpperCase()
                        : (typeof isLoggedIn === 'string' && isLoggedIn.length > 0
                            ? isLoggedIn.charAt(0).toUpperCase()
                            : ''
                          )
                      }
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Form Fields */}
              <div className="md:w-3/4 md:pl-6 r">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1 ">
                      Display name
                    </label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <Input id="username" name="username" value={formData.username} onChange={handleInputChange} className="rounded-none" />
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="rounded-none" />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="rounded-none" />
                  </div>

                  <div>
                    <label htmlFor="secondaryEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Email
                    </label>
                    <Input
                      id="secondaryEmail"
                      name="secondaryEmail"
                      type="email"
                      value={formData.secondaryEmail}
                      onChange={handleInputChange}
                      className="rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="rounded-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country/Region
                    </label>
                    <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="Select country" />
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
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      States
                    </label>
                    <Select value={formData.state} onValueChange={(value) => handleSelectChange("state", value)}>
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {stateList.map((state)=>
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>)}

                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Zip Code
                    </label>
                    <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="rounded-none" />
                  </div>
                </div>

                <div className="mt-8">
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 rounded-none">
                    SAVE CHANGES
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </section>
  );
}

// Page component for adding a new address
export function AddAddressPage() {
  return <AddressForm />
}

// Page component for the address listing page
export function AddressPage() {
  const [address, setAddress] = useState<any[]>([])

  useEffect(() => {
    // For now, just set empty address array to allow access without auth
    setAddress([])
  }, [])

  return (
    <>
      <div className="flex-col items-center justify-center lg:hidden flex">
        {address.length === 0 ? (
          <>
            <div className="w-64 h-64 mb-6">
              <img
                src="/newsletter.png" 
                alt="Illustration of a person sitting in an armchair"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Available Address</h2>
            <p className="text-gray-500 text-center">
              You haven&apos;t added any address yet.
            </p>
            <Link className="pt-6" href="/profile/address/add-address">
              <Button className="bg-white hover:bg-white text-[#FF3333] border border-[#FF3333] px-8 rounded-none">
                Add address
              </Button>
            </Link>
          </>
        ) : (
          <AddressForm address={address[0]} />
        )}
      </div>
    
      <div className="lg:flex hidden w-full justify-center items-center mx-auto mb-8">
        {address.length === 0 ? (
          <>
            <img
              src="/orders.png"
              alt="No Address Illustration" 
              className="w-40 h-40"
            />
          </>
        ) : (
          <AddressForm address={address[0]} />
        )}
      </div>
        
      {address.length === 0 && (
        <Link className="lg:flex hidden" href="/profile/address/add-address">
          <Button className="bg-white hover:bg-white text-[#FF3333] border border-[#FF3333] px-8 rounded-none">
            Add address
          </Button>
        </Link>
      )}
    </>
  )
}