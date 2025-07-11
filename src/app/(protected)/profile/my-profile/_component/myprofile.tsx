'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ToastVariant, toastWithTimeout } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EcomService } from '@/services/api/ecom-service'
import { makeApiCall } from '@/lib/apicaller'
import { useLogin } from '@/app/LoginContext'

export default function AddressForm({ address }: { address?: any }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { isLoggedIn } = useLogin()
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // Handle both new address creation and editing existing address
  const isEditMode = !!address

  const [formData, setFormData] = useState({
    fullAddress: address?.full_address || '',
    landmark: address?.landmark || '',
    state: address?.state || '',
    pinCode: address?.pin_code || '',
    fullName: '',
    email: '',
    phoneNumber: '',
    country: '',
    zipCode: ''
  })
  const [countryList, setCountryList] = useState<any[]>([])
  const [stateList, setStateList] = useState<any[]>([])
  const [loading, setLoading] = useState({
    countries: false,
    states: false
  })

  // Add computed filtered states based on selected country
  const filteredStates = useMemo(() => {
    if (!formData.country) return [];
    const countryId = parseInt(formData.country as string, 10);
    return stateList.filter(state => state.country_id === countryId);
  }, [formData.country, stateList]);

  // Fetch the user's name from Supabase profile and set it in formData.fullName
  useEffect(() => {
    // Fetch country list
    makeApiCall(
      async () => {
        setLoading(prev => ({ ...prev, countries: true }))
        return new EcomService().get_country_list()
      },
      {
        afterSuccess: (country_data: any) => {
          setCountryList(country_data)
          setLoading(prev => ({ ...prev, countries: false }))
        }
      }
    )

    // Fetch state list
    makeApiCall(
      async () => {
        setLoading(prev => ({ ...prev, states: true }))
        return new EcomService().get_state_list()
      },
      {
        afterSuccess: (state_data: any) => {
          setStateList(state_data)
          setLoading(prev => ({ ...prev, states: false }))
        }
      }
    )

    // Try to fetch profile image if user is logged in
    if (isLoggedIn) {
      makeApiCall(
        async () => {
          const ecomService = new EcomService()
          const customer = await ecomService.check_customer_exists()
          if (customer && customer.image) {
            console.log("customer.image",customer.image)
            // Always use image URL stored in customer record
            setProfileImage(customer.image)
          }
        },
        {}
      )
    }


    // Fetch customer addresses and fill phone, country, state, zip from default address
    makeApiCall(
      async () => {
        const ecomService = new EcomService()
        let customer = null
        try {
          customer = await ecomService.check_customer_exists()
        } catch (e) {
          // ignore
        }
        if (customer) {
          let addresses: any[] = []
          try {
            addresses = await ecomService.get_customer_addresses()
          } catch (e) {
            addresses = []
          }
          let defaultAddress = null
          if (Array.isArray(addresses) && addresses.length > 0) {
            defaultAddress = addresses.find(addr => addr.is_default)
            if (!defaultAddress) defaultAddress = addresses[0]
          }
          console.log("defaultAddress",defaultAddress)
          setFormData(prev => ({
            ...prev,
            phoneNumber: defaultAddress?.phone || '',
            country: defaultAddress?.country ? String(defaultAddress.country) : '',
            state: defaultAddress?.state ? String(defaultAddress.state) : '',
            zipCode: defaultAddress?.zipcode || '',
          }))
        } else {
          setFormData(prev => ({
            ...prev,
            phoneNumber: '',
            country: '',
            state: '',
            zipCode: '',
          }))
          console.log("formData",formData)
        }
      },
      {}
    )

    // Fetch the user's name from Supabase profile and set it in formData.fullName
    makeApiCall(
      async () => {
        const ecomService = new EcomService()
        const customerNamePhone = await ecomService.get_customer_name_phone()
        console.log("customerNamePhone", customerNamePhone)
        setFormData(prev => ({
          ...prev,
          fullName: customerNamePhone.name,
          phoneNumber: customerNamePhone.phone
        }));
        console.log("formData",formData)
      },
      {}
    )

    if (address) {
      setFormData(prev => ({
        ...prev,
        fullAddress: address.full_address || '',
        landmark: address.landmark || '',
        state: address.state || '',
        pinCode: address.pin_code || ''
      }))
      console.log("formData",formData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isLoggedIn])

  const handleImageUpload = async () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImageLoading(true)

    makeApiCall(
      async () => {
        const ecomService = new EcomService()
        const customer = await ecomService.check_customer_exists()
        if (!customer) {
          toastWithTimeout(ToastVariant.Default, 'Failed to verify customer account')
          setIsImageLoading(false)
          return
        }
        const userId = customer.customer_id
        const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`
        console.log("fileName",fileName)
        await ecomService.uploadProfileImage(userId, fileName, file)
        const publicUrl = await ecomService.getProfileImageUrl(userId, fileName)
        await ecomService.updateCustomerProfileImage(userId, publicUrl)
        setProfileImage(publicUrl)
        toastWithTimeout(ToastVariant.Default, 'Profile image updated successfully')
      },
      {
        afterSuccess: () => setIsImageLoading(false),
        afterError: () => {
          toastWithTimeout(ToastVariant.Default, 'An error occurred while uploading image')
          setIsImageLoading(false)
        }
      }
    )
  }

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

    // Reset state when country changes
    if (name === "country") {
      setFormData(prev => ({
        ...prev,
        state: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Only validate fullName, since other fields are not editable
    if (!formData.fullName || formData.fullName.trim() === '') {
      toastWithTimeout(ToastVariant.Default, 'Please enter your full name')
      setIsLoading(false)
      return
    }

    makeApiCall(
      async () => {
        const ecomService = new EcomService()
        await ecomService.update_profile_name(formData.fullName)
      },
      {
        afterSuccess: () => {
          const successMessage = isEditMode ? 'Profile updated successfully' : 'Profile updated successfully'
          toastWithTimeout(ToastVariant.Default, successMessage)
          setIsLoading(false)
        },
        afterError: () => {
          toastWithTimeout(ToastVariant.Default, 'An Error Occurred')
          setIsLoading(false)
        }
      }
    )
  }

  return (
    <section className="w-full h-full">
      <div className="w-full h-full"
      style={{
        fontWeight: "400",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }}
      >
        <div className="bg-white rounded-none shadow-sm overflow-hidden">
          <div className="p-6 border mt-16 justify-between">
            <h2 className="text-lg text-gray-800 mb-6 border-b pb-4">ACCOUNT SETTING</h2>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row">
                {/* Profile Picture */}
                <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 group">
                    <Avatar className="w-32 h-32">
                      {/* <AvatarImage src={profileImage || ""} alt="Profile Picture" /> */}
                      <AvatarImage src={profileImage ? `${profileImage}?t=${Date.now()}` : ""} alt="Profile Picture" />
                    </Avatar>

                    {/* Overlay with text instead of plus icon */}
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white hover:bg-black/50 ${profileImage ? 'opacity-0 group-hover:opacity-100 transition-opacity' : 'opacity-100'}`}
                      // className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white hover:bg-black/50 transition-all"
                    >
                      {isImageLoading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <>
                          <Camera className="h-6 w-6 mb-1" />
                          <span className="text-xs font-medium">{profileImage ? "Change photo" : "Add photo"}</span>
                        </>
                      )}
                    </button>

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="md:w-3/4 md:pl-6 ">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">

                    <div>
                      <label htmlFor="fullName" className="block text-sm text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="rounded-none" />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                        Email
                      </label>

                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={typeof isLoggedIn === 'object' && isLoggedIn.email
                          ? isLoggedIn.email
                          : (typeof isLoggedIn === 'string' ? isLoggedIn : '')}
                        readOnly
                        className="rounded-none bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="rounded-none bg-gray-100 cursor-not-allowed"
                        readOnly
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm text-gray-700 mb-1">
                        Country/Region
                      </label>
                      <Input id="country" name="country" value={formData.country} onChange={handleInputChange} className="rounded-none bg-gray-100 cursor-not-allowed" readOnly />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm text-gray-700 mb-1">
                        States
                      </label>
                      <Input id="state" name="state" value={formData.state} onChange={handleInputChange} className="rounded-none bg-gray-100 cursor-not-allowed" readOnly />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-sm text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <Input id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="rounded-none bg-gray-100 cursor-not-allowed" readOnly />
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 rounded-none"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          SAVING...
                        </>
                      ) : (
                        'SAVE CHANGES'
                      )}
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

