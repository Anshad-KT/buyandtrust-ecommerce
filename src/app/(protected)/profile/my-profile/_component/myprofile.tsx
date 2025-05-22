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
    makeApiCall(async () => {
      setLoading({ countries: true, states: true });

      const ecomService = new EcomService();

      // Fetch country and state lists
      const country_data = await ecomService.get_country_list()
      setCountryList(country_data)
      setLoading(prev => ({ ...prev, countries: false }));

      const state_data = await ecomService.get_state_list()
      setStateList(state_data)
      setLoading(prev => ({ ...prev, states: false }));

      // Try to fetch profile image if user is logged in
      if (isLoggedIn) {
        await fetchProfileImage()
      }

      // Fetch customer addresses and fill phone, country, state, zip from default address
      let customer = null;
      try {
        customer = await ecomService.check_customer_exists();
      } catch (e) {
        // ignore
      }
      if (customer) {
        let addresses: any[] = [];
        try {
          addresses = await ecomService.get_customer_addresses();
        } catch (e) {
          addresses = [];
        }
        let defaultAddress = null;
        if (Array.isArray(addresses) && addresses.length > 0) {
          defaultAddress = addresses.find(addr => addr.is_default);
          if (!defaultAddress) defaultAddress = addresses[0];
        }
        setFormData(prev => ({
          ...prev,
          phoneNumber: defaultAddress?.phone || '',
          country: defaultAddress?.country ? String(defaultAddress.country) : '',
          state: defaultAddress?.state ? String(defaultAddress.state) : '',
          zipCode: defaultAddress?.zipcode || '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          phoneNumber: '',
          country: '',
          state: '',
          zipCode: '',
        }));
      }

      // // Fetch the user's name from Supabase profile and set it in formData.fullName
      // try {
      //   const { data: { session } } = await ecomService.supabase.auth.getSession();
      //   if (session?.user) {
      //     // Supabase stores user metadata in user.user_metadata
      //     const userName = session.user.user_metadata?.name || '';
      //     setFormData(prev => ({
      //       ...prev,
      //       fullName: userName
      //     }));
      //   }
      // } catch (e) {
      //   // ignore
      // }
    }, {
      afterSuccess: () => {
        // No debug logs
      }
    })

    if (address) {
      setFormData(prev => ({
        ...prev,
        fullAddress: address.full_address || '',
        landmark: address.landmark || '',
        state: address.state || '',
        pinCode: address.pin_code || ''
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const fetchProfileImage = async () => {
    try {
      // Get the current user ID
      const ecomService = new EcomService()
      const customer = await ecomService.check_customer_exists()

      if (customer) {
        const userId = customer.customer_id

        // Try to fetch the profile image
        const data = await ecomService.listProfileImages(userId);
        console.log("dataimg1", data);

        if (data && data.length > 0) {
          // Get the first image in the folder
          const publicUrl = await ecomService.getProfileImageUrl(userId, data[0].name);
          setProfileImage(publicUrl)
          console.log("dataimg2", publicUrl);
        }
      }
    } catch (error) {
      // Removed error log
    }
  }

  const handleImageUpload = async () => {
    console.log("handleImageUpload");
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    console.log("file", file);
    setIsImageLoading(true)

    try {
      const ecomService = new EcomService()
      // First check if customer exists
      const customer = await ecomService.check_customer_exists()

      if (!customer) {
        toastWithTimeout(ToastVariant.Default, 'Failed to verify customer account')
        setIsImageLoading(false)
        return
      }

      const userId = customer.customer_id
      const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`
      console.log("fileName", fileName);
      // Upload the file to Supabase Storage
      await ecomService.uploadProfileImage(userId, fileName, file);
      console.log("uploaded");
      // Get the public URL for the image
      const publicUrl = await ecomService.getProfileImageUrl(userId, fileName);
      console.log("publicUrl", publicUrl);
      // Update the customer record with the profile image URL
      await ecomService.updateCustomerProfileImage(userId, publicUrl);
      console.log("updated");
      setProfileImage(publicUrl)
      toastWithTimeout(ToastVariant.Default, 'Profile image updated successfully')
    } catch (error) {
      console.error('Error uploading image:', error);
      toastWithTimeout(ToastVariant.Default, 'An error occurred while uploading image')
    } finally {
      setIsImageLoading(false)
    }
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

    try {
      // Actually update the profile name in Supabase
      const ecomService = new EcomService()
      await ecomService.update_profile_name(formData.fullName)
      const successMessage = isEditMode ? 'Profile updated successfully' : 'Profile updated successfully'
      toastWithTimeout(ToastVariant.Default, successMessage)
      setIsLoading(false)
      // router.push('/profile/address') // Optionally redirect
    } catch (error) {
      toastWithTimeout(ToastVariant.Default, 'An Error Occurred')
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
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profileImage || ""} alt="Profile Picture" />
                    </Avatar>

                    {/* Overlay with text instead of plus icon */}
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white hover:bg-black/50 transition-all"
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
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="rounded-none" />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country/Region
                      </label>
                      <Input id="country" name="country" value={formData.country} onChange={handleInputChange} className="rounded-none bg-gray-100 cursor-not-allowed" readOnly />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        States
                      </label>
                      <Input id="state" name="state" value={formData.state} onChange={handleInputChange} className="rounded-none bg-gray-100 cursor-not-allowed" readOnly />
                    </div>

                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
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